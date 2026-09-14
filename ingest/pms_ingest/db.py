"""Loading: identity resolution, tagging windows, facts, revisions, lineage.

Backfills MUST run chronologically. Alias and tagging windows are opened as
months are observed, so replaying 2026 before 2023 would date them wrongly.
"""
import datetime as dt
import json
import logging
import time
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row

from . import config
from .normalize import norm_firm

log = logging.getLogger(__name__)

APMI_FACT_COLS = ("aum_cr", "ret_1m", "ret_3m", "ret_6m", "ret_1y",
                  "ret_2y", "ret_3y", "ret_4y", "ret_5y", "ret_si")


@contextmanager
def connect():
    with psycopg.connect(config.require_database_url(), connect_timeout=30,
                         row_factory=dict_row) as c:
        c.execute("set search_path to pms, public")
        yield c


@contextmanager
def connect_short(retries=3):
    """A connection meant for ONE slice's worth of work, not a whole crawl.

    A multi-hour crawl that holds a single connection open the entire time
    reliably dies against Supabase's pooler (observed twice in practice:
    'the connection is lost'), almost certainly an idle or max-lifetime limit
    on the session pooler. Opening fresh per slice sidesteps that.

    The retry covers ONLY establishing the connection, never the caller's use
    of it: a @contextmanager generator may yield exactly once per `with`, so
    catching an error from the caller's own code here (thrown into this
    generator at the `yield` line) and looping back to yield again is invalid
    -- contextlib raises "generator didn't stop after throw()". A connection
    that dies mid-use is the caller's problem to handle (and it already does,
    via its own try/except around the `with` block) -- not this function's.
    """
    last = None
    conn = None
    for attempt in range(1, retries + 1):
        try:
            conn = psycopg.connect(config.require_database_url(), connect_timeout=30,
                                   row_factory=dict_row)
            conn.execute("set search_path to pms, public")
            break
        except psycopg.OperationalError as e:
            last = e
            if attempt < retries:
                time.sleep(3 * attempt)
    else:
        raise last
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass   # already broken; nothing left to clean up


# ----------------------------------------------------------------- lineage

def start_run(conn, source, as_on, params) -> int:
    return conn.execute(
        "insert into ingest_run (source, as_on, params) values (%s,%s,%s) returning run_id",
        (source, as_on, json.dumps(params)),
    ).fetchone()["run_id"]


def finish_run(conn, run_id, *, status, rows_parsed=None, rows_changed=None,
               raw_path=None, raw_sha256=None, assertions=None, error=None,
               http_status=None):
    conn.execute(
        """update ingest_run set finished_at=now(), status=%s, rows_parsed=%s,
               rows_changed=%s, raw_path=%s, raw_sha256=%s,
               assertions=coalesce(%s,'{}'::jsonb), error=%s, http_status=%s
           where run_id=%s""",
        (status, rows_parsed, rows_changed, raw_path, raw_sha256,
         json.dumps(assertions) if assertions else None, error, http_status, run_id),
    )


def completed_slices(conn, source, as_on=None):
    """(as_on, params) of runs already finished ok -- lets a 36k-request crawl
    resume instead of restarting."""
    q = ("select as_on, params from ingest_run where source=%s and status in ('ok','partial')")
    args = [source]
    if as_on:
        q += " and as_on=%s"
        args.append(as_on)
    return {(r["as_on"], json.dumps(r["params"], sort_keys=True))
            for r in conn.execute(q, args).fetchall()}


# -------------------------------------------------------------- identity

def resolve_managers(conn, source, names, as_on):
    """{raw name -> manager_id}. Creates managers and aliases as needed.

    Matching is exact-on-normalised only. Fuzzy matching is deliberately NOT
    done here: an unattended fuzzy merge is how a Rs 7,775 Cr fund's record
    gets welded to a Rs 0 one. Unmatched names become new managers, and the
    crosswalk step reconciles them later under a confidence threshold.
    """
    out, wanted = {}, {}
    for raw in set(names):
        wanted[norm_firm(raw)] = raw
    if not wanted:
        return out
    rows = conn.execute(
        """select a.name_norm, a.manager_id from manager_alias a
           where a.source=%s and a.name_norm = any(%s)
             and daterange(a.valid_from, a.valid_to, '[)') @> %s::date""",
        (source, list(wanted), as_on),
    ).fetchall()
    found = {r["name_norm"]: r["manager_id"] for r in rows}
    for norm, raw in wanted.items():
        if norm in found:
            out[raw] = found[norm]
            continue
        # No window covers this month. Before forking a new manager, look for an
        # existing window for the same name and EXTEND it -- observing a name in
        # a month we had not yet loaded is new knowledge about the same firm, not
        # a new firm. Backfills can arrive out of order, so handle both directions.
        near = conn.execute(
            """select alias_id, manager_id, valid_from, valid_to from manager_alias
               where source=%s and name_norm=%s order by valid_from""",
            (source, norm)).fetchall()
        later = [a for a in near if a["valid_from"] > as_on]
        earlier = [a for a in near if a["valid_to"] is not None and a["valid_to"] <= as_on]
        if later:
            a = later[0]          # earliest known window: widen its start backwards
            conn.execute("update manager_alias set valid_from=%s where alias_id=%s",
                         (as_on, a["alias_id"]))
            out[raw] = a["manager_id"]
            continue
        if earlier:
            a = earlier[-1]       # latest closed window: reopen it forwards
            conn.execute("update manager_alias set valid_to=null where alias_id=%s",
                         (a["alias_id"],))
            out[raw] = a["manager_id"]
            continue
        mid = conn.execute(
            """insert into manager (name, first_seen, last_seen)
               values (%s,%s,%s) returning manager_id""", (raw, as_on, as_on)
        ).fetchone()["manager_id"]
        conn.execute(
            """insert into manager_alias
               (manager_id, source, name_raw, name_norm, valid_from, match_method, match_score, confirmed)
               values (%s,%s,%s,%s,%s,'norm',1.0,true)""",
            (mid, source, raw, norm, as_on))
        out[raw] = mid
    conn.execute("update manager set first_seen=least(first_seen,%s) where manager_id = any(%s)",
                 (as_on, list(set(out.values()))))
    conn.execute("update manager set last_seen=greatest(last_seen,%s) where manager_id = any(%s)",
                 (as_on, list(set(out.values()))))
    return out


def resolve_approaches(conn, source, items, as_on):
    """items: iterable of (manager_id, ia_raw, ia_norm). -> {(mid,norm)->approach_id}"""
    out = {}
    items = list({(m, r, n) for m, r, n in items})
    if not items:
        return out
    mids = list({m for m, _, _ in items})
    norms = list({n for _, _, n in items})
    rows = conn.execute(
        """select manager_id, name_norm, approach_id from approach_alias
           where source=%s and manager_id = any(%s) and name_norm = any(%s)
             and daterange(valid_from, valid_to, '[)') @> %s::date""",
        (source, mids, norms, as_on),
    ).fetchall()
    found = {(r["manager_id"], r["name_norm"]): r["approach_id"] for r in rows}
    for mid, raw, norm in items:
        if (mid, norm) in found:
            out[(mid, norm)] = found[(mid, norm)]
            continue
        near = conn.execute(
            """select alias_id, approach_id, valid_from, valid_to from approach_alias
               where source=%s and manager_id=%s and name_norm=%s order by valid_from""",
            (source, mid, norm)).fetchall()
        later = [a for a in near if a["valid_from"] > as_on]
        earlier = [a for a in near if a["valid_to"] is not None and a["valid_to"] <= as_on]
        if later:
            conn.execute("update approach_alias set valid_from=%s where alias_id=%s",
                         (as_on, later[0]["alias_id"]))
            out[(mid, norm)] = later[0]["approach_id"]
            conn.execute("update approach set first_seen=least(first_seen,%s) where approach_id=%s",
                         (as_on, later[0]["approach_id"]))
            continue
        if earlier:
            conn.execute("update approach_alias set valid_to=null where alias_id=%s",
                         (earlier[-1]["alias_id"],))
            out[(mid, norm)] = earlier[-1]["approach_id"]
            continue
        existing = conn.execute(
            "select approach_id from approach where manager_id=%s and name_norm=%s",
            (mid, norm)).fetchone()
        if existing:
            aid = existing["approach_id"]
        else:
            aid = conn.execute(
                """insert into approach (manager_id, name, name_norm, first_seen, last_seen)
                   values (%s,%s,%s,%s,%s) returning approach_id""",
                (mid, raw, norm, as_on, as_on)).fetchone()["approach_id"]
        conn.execute(
            """insert into approach_alias
               (approach_id, manager_id, source, name_raw, name_norm, valid_from,
                match_method, match_score, confirmed)
               values (%s,%s,%s,%s,%s,%s,'norm',1.0,true)""",
            (aid, mid, source, raw, norm, as_on))
        out[(mid, norm)] = aid
    conn.execute("update approach set first_seen=least(first_seen,%s) where approach_id = any(%s)",
                 (as_on, list(set(out.values()))))
    conn.execute("""update approach set last_seen=greatest(last_seen,%s),
                       status='active', missing_streak=0
                    where approach_id = any(%s)""", (as_on, list(set(out.values()))))
    return out


# --------------------------------------------------------------- tagging

def apply_tagging(conn, approach_id, as_on, *, asset_class=None,
                  service_type=None, benchmark=None, benchmark_norm=None, run_id=None):
    """Open a tagging window, closing any prior one. A change to asset class or
    service type is a TRACK BREAK: SEBI treats a re-tag as invalidating the
    prior record, so it is recorded, not silently overwritten."""
    cur = conn.execute(
        """select * from approach_tagging where approach_id=%s and valid_to is null
           order by valid_from desc limit 1""", (approach_id,)).fetchone()
    new = (asset_class, service_type, benchmark_norm)
    if cur:
        old = (cur["asset_class"], cur["service_type"], cur["benchmark_norm"])
        if old == new:
            return False
        if cur["valid_from"] >= as_on:
            return False          # replaying an older month; leave history alone
        breaks = (old[0] != new[0]) or (old[1] != new[1])
        reason = []
        if old[0] != new[0]:
            reason.append(f"asset class {old[0]} -> {new[0]}")
        if old[1] != new[1]:
            reason.append(f"service type {old[1]} -> {new[1]}")
        if old[2] != new[2]:
            reason.append(f"benchmark {old[2]} -> {new[2]}")
        conn.execute("update approach_tagging set valid_to=%s where tagging_id=%s",
                     (as_on, cur["tagging_id"]))
    else:
        breaks, reason = False, []
    conn.execute(
        """insert into approach_tagging (approach_id, asset_class, service_type,
               benchmark, benchmark_norm, valid_from, is_track_break, break_reason,
               observed_run_id)
           values (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (approach_id, asset_class, service_type, benchmark, benchmark_norm,
         as_on, breaks, "; ".join(reason) or None, run_id))
    return True


# ----------------------------------------------------------------- facts

def upsert_apmi(conn, as_on, rows_by_approach, run_id):
    """rows_by_approach: {approach_id: {col: value}}. Logs every changed value to
    fact_revision -- a source silently restating an old month leaves a trail."""
    if not rows_by_approach:
        return 0, 0
    aids = list(rows_by_approach)
    existing = {r["approach_id"]: r for r in conn.execute(
        f"""select approach_id, {', '.join(APMI_FACT_COLS)}, run_id
            from apmi_performance where as_on=%s and approach_id = any(%s)""",
        (as_on, aids)).fetchall()}

    revisions, inserted, changed = [], 0, 0
    for aid, vals in rows_by_approach.items():
        old = existing.get(aid)
        if old is None:
            inserted += 1
            continue
        diff = False
        for col in APMI_FACT_COLS:
            o = old[col]
            n = vals.get(col)
            o = float(o) if o is not None else None
            if (o is None) != (n is None) or (o is not None and abs(o - n) > 1e-9):
                revisions.append((("apmi_performance"), as_on, aid, col,
                                  None if o is None else str(o),
                                  None if n is None else str(n),
                                  old["run_id"], run_id))
                diff = True
        if diff:
            changed += 1

    cols = ", ".join(APMI_FACT_COLS)
    ph = ", ".join(["%s"] * len(APMI_FACT_COLS))
    upd = ", ".join(f"{c}=excluded.{c}" for c in APMI_FACT_COLS)
    with conn.cursor() as cur:
        cur.executemany(
            f"""insert into apmi_performance (as_on, approach_id, {cols}, run_id)
                values (%s,%s,{ph},%s)
                on conflict (as_on, approach_id) do update
                   set {upd}, run_id=excluded.run_id, last_ingested=now()""",
            [(as_on, aid, *[vals.get(c) for c in APMI_FACT_COLS], run_id)
             for aid, vals in rows_by_approach.items()])
        if revisions:
            cur.executemany(
                """insert into fact_revision (table_name, as_on, entity_id, column_name,
                       old_value, new_value, old_run_id, new_run_id)
                   values (%s,%s,%s,%s,%s,%s,%s,%s)""", revisions)
    return inserted, changed


def park_collision(conn, as_on, source, manager_id, name_norm, variants, payloads):
    conn.execute(
        """insert into approach_collision (as_on, source, manager_id, name_norm,
               name_variants, row_payloads) values (%s,%s,%s,%s,%s,%s)""",
        (as_on, source, manager_id, name_norm, variants, json.dumps(payloads)))


def mark_missing(conn, as_on, seen_approach_ids, manager_ids):
    """Approaches whose MANAGER filed this month but which did not appear.
    Absence alone is never 'closed' -- only ever 'missing', with a streak."""
    if not manager_ids:
        return 0
    n = conn.execute(
        """update approach set missing_streak = missing_streak + 1,
               status = case when status='active' then 'missing' else status end,
               status_since = coalesce(status_since, %s)
           where manager_id = any(%s) and not (approach_id = any(%s))
             and first_seen <= %s and status <> 'closed'
           returning approach_id""",
        (as_on, manager_ids, seen_approach_ids or [-1], as_on)).fetchall()
    return len(n)


# -------------------------------------------------------- SEBI-specific

SEBI_MGR_COLS = (
    "clients_total", "clients_pf_epfo", "clients_corp", "clients_noncorp",
    "clients_nri", "clients_fpi", "clients_other",
    "aum_cr_total", "aum_cr_pf_epfo", "aum_cr_corp", "aum_cr_noncorp",
    "aum_cr_nri", "aum_cr_fpi", "aum_cr_other",
    "aum_cr_discretionary", "aum_cr_non_discretionary",
    "aum_cr_advisory", "aum_cr_co_investment",
    "offers_discretionary", "offers_non_discretionary",
    "offers_advisory", "offers_co_investment",
    "sales_cr", "purchase_cr", "turnover_ratio_1m",
    "complaints_open", "complaints_received", "complaints_resolved", "complaints_pending",
)

SEBI_APPR_COLS = (
    "aum_cr", "aum_cr_equity_listed", "aum_cr_equity_unlisted",
    "aum_cr_debt_plain", "aum_cr_debt_structured", "aum_cr_derivatives",
    "aum_cr_mutual_funds", "aum_cr_others",
    "inflow_cr", "outflow_cr", "net_flow_cr",
    "inflow_fytd_cr", "outflow_fytd_cr", "net_flow_fytd_cr",
    "ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_2y", "ret_3y", "ret_4y", "ret_5y", "ret_si",
    "benchmark_norm", "turnover_1m", "turnover_1y", "is_dormant",
)


def resolve_manager_by_regno(conn, reg_no, name, as_on):
    """SEBI gives us the registration number directly -- no fuzzy matching
    needed, unlike APMI. This is the authoritative identity; APMI names get
    matched TO this later via the crosswalk, not the other way round."""
    row = conn.execute(
        "select manager_id from manager where sebi_reg_no=%s", (reg_no,)).fetchone()
    if row:
        mid = row["manager_id"]
        conn.execute(
            """update manager set name=%s, first_seen=least(first_seen,%s),
                   last_seen=greatest(last_seen,%s) where manager_id=%s""",
            (name, as_on, as_on, mid))
    else:
        mid = conn.execute(
            """insert into manager (sebi_reg_no, name, first_seen, last_seen)
               values (%s,%s,%s,%s) returning manager_id""",
            (reg_no, name, as_on, as_on)).fetchone()["manager_id"]
    conn.execute(
        """insert into manager_alias
               (manager_id, source, name_raw, name_norm, valid_from, match_method, match_score, confirmed)
           values (%s,'sebi',%s,%s,%s,'exact',1.0,true)
           on conflict do nothing""",
        (mid, name, norm_firm(name), as_on))
    return mid


def upsert_sebi_manager_monthly(conn, as_on, manager_id, vals, run_id):
    old = conn.execute(
        f"""select {', '.join(SEBI_MGR_COLS)}, run_id from sebi_manager_monthly
            where as_on=%s and manager_id=%s""", (as_on, manager_id)).fetchone()
    revisions = []
    if old:
        for col in SEBI_MGR_COLS:
            o, n = old[col], vals.get(col)
            o_cmp = float(o) if isinstance(o, (int, float)) else o
            if o_cmp != n:
                revisions.append(("sebi_manager_monthly", as_on, manager_id, col,
                                  None if o is None else str(o), None if n is None else str(n),
                                  old["run_id"], run_id))
    cols = ", ".join(SEBI_MGR_COLS)
    ph = ", ".join(["%s"] * len(SEBI_MGR_COLS))
    upd = ", ".join(f"{c}=excluded.{c}" for c in SEBI_MGR_COLS)
    conn.execute(
        f"""insert into sebi_manager_monthly (as_on, manager_id, {cols}, run_id)
            values (%s,%s,{ph},%s)
            on conflict (as_on, manager_id) do update
               set {upd}, run_id=excluded.run_id, last_ingested=now()""",
        (as_on, manager_id, *[vals.get(c) for c in SEBI_MGR_COLS], run_id))
    if revisions:
        with conn.cursor() as cur:
            cur.executemany(
                """insert into fact_revision (table_name, as_on, entity_id, column_name,
                       old_value, new_value, old_run_id, new_run_id)
                   values (%s,%s,%s,%s,%s,%s,%s,%s)""", revisions)
    return len(revisions) > 0


def upsert_sebi_approach_monthly(conn, as_on, rows_by_approach, run_id):
    if not rows_by_approach:
        return 0, 0
    aids = list(rows_by_approach)
    existing = {r["approach_id"]: r for r in conn.execute(
        f"""select approach_id, {', '.join(SEBI_APPR_COLS)}, run_id
            from sebi_approach_monthly where as_on=%s and approach_id = any(%s)""",
        (as_on, aids)).fetchall()}
    revisions, inserted, changed = [], 0, 0
    for aid, vals in rows_by_approach.items():
        old = existing.get(aid)
        if old is None:
            inserted += 1
            continue
        diff = False
        for col in SEBI_APPR_COLS:
            o, n = old[col], vals.get(col)
            o_cmp = float(o) if isinstance(o, (int, float)) and not isinstance(o, bool) else o
            if o_cmp != n:
                revisions.append(("sebi_approach_monthly", as_on, aid, col,
                                  None if o is None else str(o), None if n is None else str(n),
                                  old["run_id"], run_id))
                diff = True
        if diff:
            changed += 1
    cols = ", ".join(SEBI_APPR_COLS)
    ph = ", ".join(["%s"] * len(SEBI_APPR_COLS))
    upd = ", ".join(f"{c}=excluded.{c}" for c in SEBI_APPR_COLS)
    with conn.cursor() as cur:
        cur.executemany(
            f"""insert into sebi_approach_monthly (as_on, approach_id, {cols}, run_id)
                values (%s,%s,{ph},%s)
                on conflict (as_on, approach_id) do update
                   set {upd}, run_id=excluded.run_id, last_ingested=now()""",
            [(as_on, aid, *[vals.get(c) for c in SEBI_APPR_COLS], run_id)
             for aid, vals in rows_by_approach.items()])
        if revisions:
            cur.executemany(
                """insert into fact_revision (table_name, as_on, entity_id, column_name,
                       old_value, new_value, old_run_id, new_run_id)
                   values (%s,%s,%s,%s,%s,%s,%s,%s)""", revisions)
    return inserted, changed
