"""Command line: python -m pms_ingest.cli <command>"""
import argparse
import datetime as dt
import json
import logging
import sys
from dataclasses import asdict

from . import config, db
from .apmi import (ParseAssertionError, fetch_slice, find_duplicates,
                   months_available, month_end)
from .fetch import PoliteSession
from . import sebi as sebi_mod
from . import reconcile as rec

log = logging.getLogger("pms_ingest")


def _month(s: str) -> dt.date:
    y, m = s.split("-")[:2]
    return month_end(int(y), int(m))


def load_apmi_slice(conn, session, as_on, strategy, service, run_id):
    rows, path, sha, nbytes = fetch_slice(session, as_on, strategy, service)

    dups = find_duplicates(rows)
    dup_keys = set(dups)
    clean = [r for r in rows if (r.provider_norm, r.ia_norm) not in dup_keys]

    mgr = db.resolve_managers(conn, "apmi", [r.provider_raw for r in clean], as_on)
    appr = db.resolve_approaches(
        conn, "apmi",
        [(mgr[r.provider_raw], r.ia_raw, r.ia_norm) for r in clean], as_on)

    facts = {}
    for r in clean:
        aid = appr[(mgr[r.provider_raw], r.ia_norm)]
        db.apply_tagging(conn, aid, as_on, asset_class=r.strategy,
                         service_type=r.service_type, run_id=run_id)
        facts[aid] = {c: getattr(r, c) for c in db.APMI_FACT_COLS}

    inserted, changed = db.upsert_apmi(conn, as_on, facts, run_id)

    for (prov_norm, ia_norm), group in dups.items():
        mid = db.resolve_managers(conn, "apmi", [group[0].provider_raw], as_on)[group[0].provider_raw]
        db.park_collision(conn, as_on, "apmi", mid, ia_norm,
                          [g.ia_raw for g in group], [asdict(g) for g in group])

    db.finish_run(conn, run_id, status="ok", rows_parsed=len(rows),
                  rows_changed=changed, raw_path=str(path), raw_sha256=sha,
                  assertions={"n_cols": 12, "n_rows": len(rows),
                              "bytes": nbytes, "collisions": len(dups),
                              "inserted": inserted, "revised": changed})
    return len(rows), inserted, changed, len(dups)


def cmd_backfill_apmi(args):
    months = months_available()
    if args.since:
        months = [m for m in months if m >= _month(args.since)]
    if args.until:
        months = [m for m in months if m <= _month(args.until)]
    strategies = [args.strategy] if args.strategy else list(config.STRATEGIES)
    services = [args.service] if args.service else list(config.SERVICE_TYPES)

    session = PoliteSession()
    tot_rows = tot_new = tot_rev = tot_dup = 0
    with db.connect_short() as conn:
        done = db.completed_slices(conn, "apmi") if not args.force else set()
    planned = [(m, s, t) for m in months for s in strategies for t in services]
    todo = [(m, s, t) for (m, s, t) in planned
            if (m, json.dumps({"strategy": s, "service": t}, sort_keys=True)) not in done]
    print(f"{len(planned)} slices planned, {len(planned)-len(todo)} already done, "
          f"{len(todo)} to fetch (~{len(todo)*config.REQUEST_DELAY_SEC*2/60:.0f} min)")
    for i, (as_on, strategy, service) in enumerate(todo, 1):
        # A fresh connection per slice: a single connection held for the whole
        # crawl reliably dies against Supabase's pooler on a run this long
        # (observed twice) -- see db.connect_short.
        with db.connect_short() as conn:
            params = {"strategy": strategy, "service": service}
            run_id = db.start_run(conn, "apmi", as_on, params)
            conn.commit()
            try:
                n, new, rev, dup = load_apmi_slice(conn, session, as_on, strategy, service, run_id)
                conn.commit()
                tot_rows += n; tot_new += new; tot_rev += rev; tot_dup += dup
                print(f"  [{i}/{len(todo)}] {as_on} {strategy:11s}/{service}  "
                      f"{n:5d} rows  new={new:5d} revised={rev:4d} collisions={dup}")
            except ParseAssertionError as e:
                conn.rollback()
                db.finish_run(conn, run_id, status="failed", error=str(e)[:2000])
                conn.commit()
                print(f"  [{i}/{len(todo)}] {as_on} {strategy}/{service}  ASSERTION FAILED")
                print(f"      {e}")
                if not args.keep_going:
                    raise SystemExit("stopping: the page shape changed, verify before continuing")
            except Exception as e:
                conn.rollback()
                db.finish_run(conn, run_id, status="failed", error=f"{type(e).__name__}: {e}"[:2000])
                conn.commit()
                print(f"  [{i}/{len(todo)}] {as_on} {strategy}/{service}  ERROR {type(e).__name__}: {e}")
                if not args.keep_going:
                    raise
    print(f"\ntotal: {tot_rows} rows parsed, {tot_new} new, {tot_rev} revised, {tot_dup} collisions parked")


def _sebi_months(since, until):
    """SEBI's own dropdown covers 2018-01 onward; cap at last complete month."""
    today = dt.date.today()
    last_complete = (dt.date(today.year, today.month, 1) - dt.timedelta(days=1))
    lo = _month(since) if since else month_end(2018, 1)
    hi = _month(until) if until else last_complete
    out, y, m = [], lo.year, lo.month
    while dt.date(y, m, 1) <= dt.date(hi.year, hi.month, 1):
        out.append(month_end(y, m))
        y, m = y + (m == 12), m % 12 + 1
    return out


def load_sebi_filing(conn, session, pmr_id, reg_no, as_on, run_id):
    filing, path, sha, nbytes = sebi_mod.fetch_filing(session, pmr_id, reg_no, as_on)

    if filing.no_filing:
        db.finish_run(conn, run_id, status="ok", rows_parsed=0, rows_changed=0,
                      raw_path=str(path), raw_sha256=sha, assertions={"no_filing": True})
        return 0, 0, 0, True

    mid = db.resolve_manager_by_regno(conn, filing.reg_no, filing.name, as_on)

    mgr_vals = {c: getattr(filing, c) for c in db.SEBI_MGR_COLS}
    mgr_changed = db.upsert_sebi_manager_monthly(conn, as_on, mid, mgr_vals, run_id)

    by_norm = {}
    for a in filing.approach_aum:
        by_norm.setdefault(a.ia_norm, {})["aum"] = a
    for a in filing.approach_flow:
        by_norm.setdefault(a.ia_norm, {})["flow"] = a
    for a in filing.approach_return:
        by_norm.setdefault(a.ia_norm, {})["ret"] = a
    for a in filing.approach_turnover:
        by_norm.setdefault(a.ia_norm, {})["turn"] = a

    items = [(mid, group["aum"].ia_raw, norm)
             for norm, group in by_norm.items() if "aum" in group]
    appr_ids = db.resolve_approaches(conn, "sebi", items, as_on)

    facts, taggings = {}, []
    for norm, group in by_norm.items():
        aid = appr_ids.get((mid, norm))
        if aid is None:
            continue
        aum, flow, ret, turn = group.get("aum"), group.get("flow"), group.get("ret"), group.get("turn")
        vals = {}
        if aum:
            vals.update({"aum_cr": aum.aum_cr, "aum_cr_equity_listed": aum.aum_cr_equity_listed,
                        "aum_cr_equity_unlisted": aum.aum_cr_equity_unlisted,
                        "aum_cr_debt_plain": aum.aum_cr_debt_plain,
                        "aum_cr_debt_structured": aum.aum_cr_debt_structured,
                        "aum_cr_derivatives": aum.aum_cr_derivatives,
                        "aum_cr_mutual_funds": aum.aum_cr_mutual_funds,
                        "aum_cr_others": aum.aum_cr_others})
        if flow:
            vals.update({"inflow_cr": flow.inflow_cr, "outflow_cr": flow.outflow_cr,
                        "net_flow_cr": flow.net_flow_cr, "inflow_fytd_cr": flow.inflow_fytd_cr,
                        "outflow_fytd_cr": flow.outflow_fytd_cr, "net_flow_fytd_cr": flow.net_flow_fytd_cr})
        if ret:
            for f in ("ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_2y", "ret_3y",
                      "ret_4y", "ret_5y", "ret_si"):
                vals[f] = getattr(ret, f)
            vals["benchmark_norm"] = ret.benchmark_norm
        if turn:
            vals["turnover_1m"] = turn.turnover_1m
            vals["turnover_1y"] = turn.turnover_1y
        aum_zero = (vals.get("aum_cr") or 0) == 0
        rets_dead = ret is None or all(getattr(ret, f) is None for f in
                                       ("ret_1m","ret_3m","ret_6m","ret_1y","ret_2y","ret_3y","ret_4y","ret_5y","ret_si"))
        vals["is_dormant"] = bool(aum_zero and rets_dead)
        facts[aid] = vals
        if ret:
            taggings.append((aid, ret.asset_class, ret.benchmark_raw, ret.benchmark_norm))

    for aid, asset_class, bench_raw, bench_norm in taggings:
        db.apply_tagging(conn, aid, as_on, asset_class=asset_class, service_type="D",
                         benchmark=bench_raw, benchmark_norm=bench_norm, run_id=run_id)

    inserted, changed = db.upsert_sebi_approach_monthly(conn, as_on, facts, run_id)
    benches = db.upsert_benchmark_returns(conn, as_on, filing.benchmark_return, run_id)

    status = "partial" if filing.approach_set_mismatch else "ok"
    db.finish_run(conn, run_id, status=status, rows_parsed=len(by_norm), rows_changed=changed,
                  raw_path=str(path), raw_sha256=sha,
                  assertions={"bytes": nbytes, "approaches": len(by_norm),
                             "mgr_changed": mgr_changed, "inserted": inserted,
                             "benchmarks": benches,
                             "benchmark_conflicts": filing.benchmark_conflicts or None,
                             "approach_set_mismatch": filing.approach_set_mismatch or None})
    return len(by_norm), inserted, changed, False


def cmd_backfill_sebi(args):
    session = PoliteSession()
    if args.no_refresh_managers:
        # Only safe when every manager in the universe already has a manager
        # row -- NOT true in general: a manager whose every attempted month
        # failed to parse never gets one (resolve_manager_by_regno runs after
        # parsing succeeds), so this list can silently omit exactly the
        # managers that most need retrying. Use only to iterate fast during
        # development against known-good managers.
        with db.connect() as conn:
            managers = conn.execute(
                "select sebi_reg_no, name from manager where sebi_reg_no is not null"
            ).fetchall()
        listing = [(None, reg["sebi_reg_no"], reg["name"]) for reg in managers]
    else:
        print("fetching current manager list from SEBI...")
        listing = sebi_mod.load_manager_list(session)
        print(f"  {len(listing)} managers found")

    if args.manager:
        listing = [x for x in listing if args.manager.upper() in (x[2] or "").upper()]
        print(f"filtered to {len(listing)} managers matching {args.manager!r}")

    months = _sebi_months(args.since, args.until)
    print(f"{len(months)} months x {len(listing)} managers = {len(months)*len(listing)} slices planned")

    tot_appr = tot_new = tot_rev = tot_nofile = 0
    with db.connect_short() as conn:
        done = db.completed_slices(conn, "sebi") if not args.force else set()
    n = 0
    for as_on in months:
        for pmr_id, reg_no, name in listing:
            params = {"reg_no": reg_no}
            key = (as_on, json.dumps(params, sort_keys=True))
            if key in done:
                continue
            if pmr_id is None:
                pmr_id = f"{reg_no}@@{reg_no}@@{name}"
            n += 1
            # Fresh connection per manager-month -- see db.connect_short: a
            # single connection held across a run this long (tens of thousands
            # of requests) reliably dies against Supabase's pooler.
            with db.connect_short() as conn:
                run_id = db.start_run(conn, "sebi", as_on, params)
                conn.commit()
                try:
                    appr, new, rev, nofile = load_sebi_filing(
                        conn, session, pmr_id, reg_no, as_on, run_id)
                    conn.commit()
                    tot_appr += appr; tot_new += new; tot_rev += rev; tot_nofile += int(nofile)
                    tag = "NO FILING" if nofile else f"{appr:3d} approaches new={new} rev={rev}"
                    if n % 25 == 0 or nofile:
                        print(f"  [{n}] {as_on} {reg_no} {name[:32]:32s} {tag}")
                except sebi_mod.ParseAssertionError as e:
                    conn.rollback()
                    db.finish_run(conn, run_id, status="failed", error=str(e)[:2000])
                    conn.commit()
                    print(f"  [{n}] {as_on} {reg_no} {name[:32]:32s} ASSERTION FAILED: {e}")
                    if not args.keep_going:
                        raise SystemExit("stopping: verify before continuing")
                except Exception as e:
                    conn.rollback()
                    db.finish_run(conn, run_id, status="failed", error=f"{type(e).__name__}: {e}"[:2000])
                    conn.commit()
                    print(f"  [{n}] {as_on} {reg_no} {name[:32]:32s} ERROR {type(e).__name__}: {e}")
                    if not args.keep_going:
                        raise
    print(f"\ntotal: {tot_appr} approach-rows, {tot_new} new, {tot_rev} revised, "
          f"{tot_nofile} no-filing slices")


def cmd_reconcile(args):
    """Weld the APMI and SEBI halves together. Dry run unless --apply."""
    with db.connect() as conn:
        rec.ensure_schema(conn)
        conn.commit()
        thr = args.min_score if args.min_score is not None else rec.threshold(conn)
        print(f"matching on normalised firm name, threshold {thr:.4f}")
        matches, ambiguous, unmatched = rec.match_managers(conn, thr)

        exact = [m for m in matches if m[5] == "exact"]
        fuzzy = [m for m in matches if m[5] == "fuzzy"]
        print(f"\n  {len(matches)} matches ({len(exact)} exact, {len(fuzzy)} fuzzy)")
        print(f"  {len(ambiguous)} ambiguous (parked, never merged)")
        print(f"  {len(unmatched)} APMI managers with no SEBI counterpart")

        if fuzzy:
            print("\n  fuzzy matches -- check these before applying:")
            for aid, aname, sid, sname, score, _ in sorted(fuzzy, key=lambda m: m[4])[:15]:
                print(f"    {score:.4f}  {aname[:38]:38s} -> {sname[:38]}")
        if ambiguous:
            print("\n  ambiguous, needing a human:")
            for aid, aname, cands, score in ambiguous[:10]:
                print(f"    {aname[:38]:38s} -> {len(cands)} candidates: {', '.join(c[:28] for c in cands[:3])}")

        if not args.apply:
            print("\ndry run -- nothing written. Re-run with --apply to merge.")
            return

        merged, moved = rec.apply_matches(conn, matches)
        conn.commit()
        print(f"\nmerged {len(matches)} managers, "
              f"{merged} approaches welded, {moved} approaches reparented")
        print("now run: python -m pms_ingest.cli refresh-views")


def cmd_refresh_views(args):
    """The leaderboard is a materialized view; a backfill does not update it."""
    import psycopg
    with psycopg.connect(config.require_database_url(), connect_timeout=60,
                         autocommit=True) as conn:
        print("refreshing public.v_strategy ...")
        db.refresh_views(conn)
    print("done")


def cmd_status(args):
    with db.connect() as conn:
        for q, label in [
            ("select source, count(*) n, min(as_on) lo, max(as_on) hi, "
             "count(*) filter (where status='ok') ok, count(*) filter (where status='failed') failed "
             "from ingest_run group by source order by source", "runs"),
            ("select count(*) n from apmi_performance", "apmi_performance"),
            ("select count(*) n from approach", "approach"),
            ("select count(*) n from manager", "manager"),
            ("select count(*) n from approach_collision where not resolved", "unresolved collisions"),
            ("select count(*) n from fact_revision", "fact_revision"),
            ("select count(*) n from approach_tagging where is_track_break", "track breaks"),
        ]:
            print(f"{label}:", conn.execute(q).fetchall())


def main(argv=None):
    p = argparse.ArgumentParser(prog="pms_ingest")
    sub = p.add_subparsers(dest="cmd", required=True)

    b = sub.add_parser("backfill-apmi", help="fetch and load APMI performance")
    b.add_argument("--since", help="YYYY-MM (default 2023-04)")
    b.add_argument("--until", help="YYYY-MM (default last complete month)")
    b.add_argument("--strategy", choices=config.STRATEGIES)
    b.add_argument("--service", choices=config.SERVICE_TYPES)
    b.add_argument("--force", action="store_true", help="re-fetch slices already marked ok")
    b.add_argument("--keep-going", action="store_true", help="continue past a failed slice")
    b.set_defaults(func=cmd_backfill_apmi)

    sb = sub.add_parser("backfill-sebi", help="fetch and load SEBI PMR filings")
    sb.add_argument("--since", help="YYYY-MM (default 2018-01)")
    sb.add_argument("--until", help="YYYY-MM (default last complete month)")
    sb.add_argument("--manager", help="substring filter on manager name, for testing")
    sb.add_argument("--force", action="store_true")
    sb.add_argument("--keep-going", action="store_true")
    sb.add_argument("--no-refresh-managers", action="store_true",
                    help="reuse the manager list already in the DB instead of re-scraping "
                         "(faster, but can silently omit managers that never loaded "
                         "successfully -- see cmd_backfill_sebi)")
    sb.set_defaults(func=cmd_backfill_sebi)

    rc = sub.add_parser("reconcile",
                        help="match APMI managers to SEBI managers and merge them")
    rc.add_argument("--apply", action="store_true",
                    help="actually merge; without it this is a dry run")
    rc.add_argument("--min-score", type=float,
                    help="override publish_rule.xsource_match_min")
    rc.set_defaults(func=cmd_reconcile)

    r = sub.add_parser("refresh-views",
                       help="rebuild the materialized leaderboard (run after any backfill)")
    r.set_defaults(func=cmd_refresh_views)

    s = sub.add_parser("status", help="what is loaded")
    s.set_defaults(func=cmd_status)

    args = p.parse_args(argv)
    logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(message)s")
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
