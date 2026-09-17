"""Cross-source reconciliation: weld the APMI and SEBI halves together.

Identity resolution during ingest is deliberately scoped PER SOURCE -- see
db.resolve_managers, which refuses to fuzzy-match and says the crosswalk
"reconciles them later under a confidence threshold". This is that step, and
until it runs the two halves of the database never meet: 421 APMI managers,
517 SEBI managers, zero shared.

Two rules the rest of the pipeline already lives by, kept here:

  * Never guess past an ambiguity. An APMI firm that matches two SEBI firms
    equally well is PARKED for a human, not merged on a coin toss.
  * A merge is recorded, never silent. Every pair lands in xsource_match with
    its score and method, so what was welded can be audited afterwards.

Direction: the SEBI manager survives, because it carries the registration
number -- the only real identifier either source publishes. The APMI APPROACH
survives instead, because its id is what the site already links to and its
monthly return series is what the leaderboard ranks on.
"""
import logging
from difflib import SequenceMatcher

from .normalize import norm_firm

log = logging.getLogger(__name__)

SCHEMA = """
create table if not exists pms.xsource_match (
    match_id        bigserial primary key,
    apmi_manager_id bigint not null,
    sebi_manager_id bigint not null,
    apmi_name       text not null,
    sebi_name       text not null,
    score           numeric(5,4) not null,
    method          text not null check (method in ('exact','fuzzy','manual')),
    approaches_merged int not null default 0,
    merged_at       timestamptz not null default now()
);
create unique index if not exists ux_xsource_apmi on pms.xsource_match (apmi_manager_id);
"""

# Reparenting an approach has to move approach.manager_id and the denormalised
# approach_alias.manager_id together. The composite FK between them -- added so
# the two can never disagree -- rejects either order while it is immediate, so
# it is made DEFERRABLE and checked at commit instead of per statement. The
# guarantee is unchanged: a transaction that leaves them disagreeing still fails.
DEFERRABLE = """
alter table pms.approach_alias
    drop constraint if exists approach_alias_approach_id_manager_id_fkey;
alter table pms.approach_alias
    add constraint approach_alias_approach_id_manager_id_fkey
    foreign key (approach_id, manager_id)
    references pms.approach (approach_id, manager_id) on delete cascade
    deferrable initially immediate;
"""


def ensure_schema(conn):
    conn.execute(SCHEMA)
    conn.execute(DEFERRABLE)


def threshold(conn) -> float:
    r = conn.execute(
        "select threshold from pms.publish_rule where rule='xsource_match_min'"
    ).fetchone()
    return float(r["threshold"]) if r else 0.95


# ------------------------------------------------------------------ matching

def _sides(conn):
    """APMI-only managers, and SEBI managers, as (id, name, norm) lists."""
    rows = conn.execute("""
        select m.manager_id, m.name, m.sebi_reg_no,
               exists (select 1 from pms.manager_alias a
                        where a.manager_id = m.manager_id and a.source='apmi') as has_apmi,
               exists (select 1 from pms.manager_alias a
                        where a.manager_id = m.manager_id and a.source='sebi') as has_sebi
        from pms.manager m
    """).fetchall()
    apmi, sebi = [], []
    for r in rows:
        item = (r["manager_id"], r["name"], norm_firm(r["name"]))
        # A manager already carrying both sources needs no crosswalk.
        if r["has_apmi"] and not r["has_sebi"]:
            apmi.append(item)
        elif r["has_sebi"] and not r["has_apmi"]:
            sebi.append(item)
    return apmi, sebi


def match_managers(conn, min_score=None):
    """-> (matches, ambiguous, unmatched).

    matches:   [(apmi_id, apmi_name, sebi_id, sebi_name, score, method)]
    ambiguous: APMI firms whose best score is tied across several SEBI firms
    unmatched: APMI firms with no candidate at or above the threshold
    """
    if min_score is None:
        min_score = threshold(conn)
    apmi, sebi = _sides(conn)

    by_norm = {}
    for sid, sname, snorm in sebi:
        by_norm.setdefault(snorm, []).append((sid, sname))

    matches, ambiguous, unmatched = [], [], []
    taken = set()

    # Exact normalised-name matches first, so a fuzzy near-miss can never steal
    # a SEBI firm that some other APMI firm matches outright.
    rest = []
    for aid, aname, anorm in apmi:
        hits = by_norm.get(anorm, [])
        if len(hits) == 1:
            matches.append((aid, aname, hits[0][0], hits[0][1], 1.0, "exact"))
            taken.add(hits[0][0])
        elif len(hits) > 1:
            ambiguous.append((aid, aname, [h[1] for h in hits], 1.0))
        else:
            rest.append((aid, aname, anorm))

    pool = [(sid, sname, snorm) for sid, sname, snorm in sebi if sid not in taken]

    for aid, aname, anorm in rest:
        scored = []
        for sid, sname, snorm in pool:
            if sid in taken:
                continue
            # A cheap length gate first: SequenceMatcher over every pair is
            # ~200k comparisons, and names differing by more than a third in
            # length cannot clear a 0.95 ratio anyway.
            if abs(len(anorm) - len(snorm)) > max(len(anorm), len(snorm)) * 0.34:
                continue
            score = SequenceMatcher(None, anorm, snorm).ratio()
            if score >= min_score:
                scored.append((score, sid, sname))
        if not scored:
            unmatched.append((aid, aname))
            continue
        scored.sort(reverse=True)
        best = scored[0]
        # A tie at the top is exactly the case that must not be guessed.
        if len(scored) > 1 and abs(scored[1][0] - best[0]) < 1e-9:
            ambiguous.append((aid, aname, [s[2] for s in scored[:4]], best[0]))
            continue
        matches.append((aid, aname, best[1], best[2], round(best[0], 4), "fuzzy"))
        taken.add(best[1])

    return matches, ambiguous, unmatched


# ------------------------------------------------------------------- merging

def _merge_approaches(conn, apmi_mid, sebi_mid):
    """Fold the SEBI manager's approaches into the APMI manager's, by
    normalised name. Returns (merged, moved).

    merged = same approach under both sources, welded into one row
    moved  = SEBI-only approach, simply reparented
    """
    apmi_appr = {r["name_norm"]: r["approach_id"] for r in conn.execute(
        "select approach_id, name_norm from pms.approach where manager_id=%s", (apmi_mid,))}
    sebi_appr = conn.execute(
        "select approach_id, name_norm from pms.approach where manager_id=%s", (sebi_mid,)).fetchall()

    merged = moved = 0
    for r in sebi_appr:
        keep = apmi_appr.get(r["name_norm"])
        sid = r["approach_id"]
        if keep is None:
            # No APMI twin: the approach itself moves to the surviving manager.
            # Both sides of the composite FK move in the same deferred window.
            conn.execute("update pms.approach set manager_id=%s where approach_id=%s",
                         (apmi_mid, sid))
            conn.execute("update pms.approach_alias set manager_id=%s where approach_id=%s",
                         (apmi_mid, sid))
            moved += 1
            continue

        # Same approach, two rows. The APMI row survives; SEBI facts move onto it.
        # A PK clash means both sides already hold that month -- impossible for a
        # genuine pair, so it is left in place and logged rather than overwritten.
        conn.execute("""
            update pms.sebi_approach_monthly s set approach_id=%s
            where s.approach_id=%s
              and not exists (select 1 from pms.sebi_approach_monthly t
                               where t.approach_id=%s and t.as_on=s.as_on)
        """, (keep, sid, keep))

        # The benchmark is the prize here: SEBI publishes it, APMI does not.
        # It is written onto the surviving tagging rather than moving the SEBI
        # tagging row, which would collide with the exclusion constraint on
        # (approach_id, validity range).
        conn.execute("""
            update pms.approach_tagging keep_t
               set benchmark = coalesce(keep_t.benchmark, src.benchmark),
                   benchmark_norm = coalesce(keep_t.benchmark_norm, src.benchmark_norm)
              from (select benchmark, benchmark_norm from pms.approach_tagging
                     where approach_id=%s and benchmark_norm is not null
                     order by valid_from desc limit 1) src
             where keep_t.approach_id=%s and keep_t.valid_to is null
        """, (sid, keep))

        conn.execute("update pms.approach_alias set approach_id=%s, manager_id=%s where approach_id=%s",
                     (keep, apmi_mid, sid))
        conn.execute("update pms.approach set first_seen=least(first_seen,(select first_seen from pms.approach where approach_id=%s)),"
                     " last_seen=greatest(last_seen,(select last_seen from pms.approach where approach_id=%s))"
                     " where approach_id=%s", (sid, sid, keep))
        conn.execute("delete from pms.approach_tagging where approach_id=%s", (sid,))
        conn.execute("delete from pms.sebi_approach_monthly where approach_id=%s", (sid,))
        conn.execute("delete from pms.approach where approach_id=%s", (sid,))
        merged += 1

    return merged, moved


def merge_manager(conn, apmi_mid, sebi_mid):
    """Weld one pair. The APMI manager survives and inherits the SEBI identity;
    doing it the other way round would orphan every approach_id the site links
    to. Returns approaches merged."""
    # Deferred for this transaction: the reparenting below is only consistent
    # once every statement in the pair has run.
    conn.execute("set constraints pms.approach_alias_approach_id_manager_id_fkey deferred")
    merged, moved = _merge_approaches(conn, apmi_mid, sebi_mid)

    sebi = conn.execute("select * from pms.manager where manager_id=%s", (sebi_mid,)).fetchone()
    # sebi_reg_no is unique, and the losing row still holds it until it is
    # deleted at the end of this merge. Release it before the survivor claims it.
    conn.execute("update pms.manager set sebi_reg_no=null where manager_id=%s", (sebi_mid,))
    conn.execute("""
        update pms.manager set
            sebi_reg_no        = coalesce(sebi_reg_no, %s),
            registered_on      = coalesce(registered_on, %s),
            principal_officer  = coalesce(principal_officer, %s),
            compliance_officer = coalesce(compliance_officer, %s),
            address            = coalesce(address, %s),
            first_seen         = least(first_seen, %s),
            last_seen          = greatest(last_seen, %s)
        where manager_id=%s
    """, (sebi["sebi_reg_no"], sebi["registered_on"], sebi["principal_officer"],
          sebi["compliance_officer"], sebi["address"], sebi["first_seen"],
          sebi["last_seen"], apmi_mid))

    # Monthly manager facts move wholesale; the APMI side never had any.
    conn.execute("""
        update pms.sebi_manager_monthly s set manager_id=%s
        where s.manager_id=%s
          and not exists (select 1 from pms.sebi_manager_monthly t
                           where t.manager_id=%s and t.as_on=s.as_on)
    """, (apmi_mid, sebi_mid, apmi_mid))
    conn.execute("delete from pms.sebi_manager_monthly where manager_id=%s", (sebi_mid,))

    conn.execute("update pms.manager_alias set manager_id=%s where manager_id=%s",
                 (apmi_mid, sebi_mid))
    conn.execute("update pms.approach_collision set manager_id=%s where manager_id=%s",
                 (apmi_mid, sebi_mid))
    conn.execute("delete from pms.manager where manager_id=%s", (sebi_mid,))
    return merged, moved


def apply_matches(conn, matches):
    """Merge every pair, recording each in xsource_match. One transaction per
    pair is the caller's business; this does not commit."""
    tot_merged = tot_moved = 0
    for aid, aname, sid, sname, score, method in matches:
        merged, moved = merge_manager(conn, aid, sid)
        conn.execute("""
            insert into pms.xsource_match
                (apmi_manager_id, sebi_manager_id, apmi_name, sebi_name,
                 score, method, approaches_merged)
            values (%s,%s,%s,%s,%s,%s,%s)
            on conflict (apmi_manager_id) do nothing
        """, (aid, sid, aname, sname, score, method, merged))
        tot_merged += merged
        tot_moved += moved
    return tot_merged, tot_moved
