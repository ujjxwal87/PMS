"""SEBI Portfolio Manager Monthly Report: fetch, assert, parse.

One POST returns ONE manager's full filing for one month: 19 HTML tables in a
FIXED POSITIONAL template (verified identical across 4 very different real
filings -- a single-approach boutique, two large multi-strategy AMCs, and a
manager offering Discretionary+Non-Discretionary+Advisory together). A service
that is offered but has zero approaches still renders its table, just with a
header row and no data rows -- so position is more reliable here than for APMI.

SCOPE (v1): full detail for DISCRETIONARY only (identity, overall totals,
overall client split, AUM-by-service-type, services-offered flags, and for
each Discretionary approach: AUM breakdown, flows, TWRR returns + benchmark,
turnover). Non-Discretionary/Advisory/Co-investment are captured only at the
manager-level AUM aggregate (table 2) -- no confirmed real example of a
non-zero per-approach Non-Discretionary book existed to validate that shape
against, and guessing is how the APMI header bug happened. Extend later
against a real example rather than a guess.
"""
import logging
import re
from dataclasses import dataclass, field

from lxml import html as lx

from . import config
from .fetch import PoliteSession, snapshot
from .normalize import clean_text, norm_name, norm_benchmark, parse_money_cr, parse_pct

log = logging.getLogger(__name__)


class ParseAssertionError(RuntimeError):
    """Fatal for this one manager-month. Never guess past a shape mismatch."""


TABLE_CLASS_XPATH = "//table[contains(@class,'statistics-table')]"
N_TABLES = 19

# Anchor checks: (table index, expected first-row-first-cell text). If SEBI
# reorders or renames these, every downstream index shifts silently -- so
# every position we rely on is checked before we trust any of them.
ANCHORS = {
    0: "Name of the Portfolio Manager",
    1: "Particulars",
    2: "",                          # blank merged cell; checked via row 1 instead
    3: "Sr. No.",
    18: "Type of Client",
}
ANCHOR_ROW1 = {2: "Type of PMS Service"}

# SEBI's per-approach section headers -> our asset_class vocabulary.
ASSET_CLASS_MAP = {
    "EQUITY": "Equity", "DEBT": "Debt", "HYBRID": "Hybrid",
    "MULTI ASSET": "Multi Asset", "MULTI-ASSET": "Multi Asset",
}

RETURN_FIELDS = ("ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_2y",
                 "ret_3y", "ret_4y", "ret_5y", "ret_si")

SERVICE_ROW_TO_COL = {
    "Discretionary": "aum_cr_discretionary",
    "Non-Discretionary": "aum_cr_non_discretionary",
    "Co-Investment": "aum_cr_co_investment",
    "Advisory": "aum_cr_advisory",
}


@dataclass
class ApproachAum:
    ia_raw: str
    ia_norm: str
    aum_cr: float | None
    aum_cr_equity_listed: float | None = None
    aum_cr_equity_unlisted: float | None = None
    aum_cr_debt_plain: float | None = None
    aum_cr_debt_structured: float | None = None
    aum_cr_derivatives: float | None = None
    aum_cr_mutual_funds: float | None = None
    aum_cr_others: float | None = None


@dataclass
class ApproachFlow:
    ia_raw: str
    ia_norm: str
    inflow_cr: float | None
    outflow_cr: float | None
    net_flow_cr: float | None
    inflow_fytd_cr: float | None
    outflow_fytd_cr: float | None
    net_flow_fytd_cr: float | None


@dataclass
class ApproachReturn:
    ia_raw: str
    ia_norm: str
    asset_class: str
    aum_cr: float | None
    benchmark_raw: str | None
    benchmark_norm: str | None
    ret_1m: float | None = None
    ret_3m: float | None = None
    ret_6m: float | None = None
    ret_1y: float | None = None
    ret_2y: float | None = None
    ret_3y: float | None = None
    ret_4y: float | None = None
    ret_5y: float | None = None
    ret_si: float | None = None


@dataclass
class ApproachTurnover:
    ia_raw: str
    ia_norm: str
    turnover_1m: float | None
    turnover_1y: float | None


@dataclass
class SebiFiling:
    no_filing: bool
    # Populated when the four per-approach tables (AUM/flow/return/turnover)
    # don't fully agree on which approaches exist -- real and not rare (~4% of
    # managers): a brand-new approach has AUM but no return history yet, one
    # fully redeemed mid-month has flow but zero AUM, and some filings spell
    # the same approach differently between tables ("X" vs "X TWRR Unitised").
    # Recorded for review, never silently merged and never blocks the load --
    # each table's own rows are still loaded for whichever approaches it has.
    approach_set_mismatch: dict = field(default_factory=dict)
    reg_no: str | None = None
    name: str | None = None
    registered_on: str | None = None
    address: str | None = None
    principal_officer: str | None = None
    compliance_officer: str | None = None
    clients_total: int | None = None
    aum_cr_total: float | None = None
    clients_pf_epfo: int | None = None
    clients_corp: int | None = None
    clients_noncorp: int | None = None
    clients_nri: int | None = None
    clients_fpi: int | None = None
    clients_other: int | None = None
    aum_cr_pf_epfo: float | None = None
    aum_cr_corp: float | None = None
    aum_cr_noncorp: float | None = None
    aum_cr_nri: float | None = None
    aum_cr_fpi: float | None = None
    aum_cr_other: float | None = None
    aum_cr_discretionary: float | None = None
    aum_cr_non_discretionary: float | None = None
    aum_cr_co_investment: float | None = None
    aum_cr_advisory: float | None = None
    offers_discretionary: bool | None = None
    offers_non_discretionary: bool | None = None
    offers_advisory: bool | None = None
    offers_co_investment: bool | None = None
    sales_cr: float | None = None
    purchase_cr: float | None = None
    turnover_ratio_1m: float | None = None
    complaints_open: int | None = None
    complaints_received: int | None = None
    complaints_resolved: int | None = None
    complaints_pending: int | None = None
    approach_aum: list = field(default_factory=list)
    approach_flow: list = field(default_factory=list)
    approach_return: list = field(default_factory=list)
    approach_turnover: list = field(default_factory=list)


_SENTINEL_IA = {"0", "", "NA"}


def _rows(table):
    return table.xpath(".//tr")


def _cells(tr):
    return [clean_text(c.text_content()) for c in tr.xpath("./td|./th")]


def _int(s):
    v = parse_money_cr(s)   # same "NA"/blank handling; SEBI counts have no decimals
    return int(v) if v is not None else None


def is_no_filing(doc) -> bool:
    tables = doc.xpath(TABLE_CLASS_XPATH)
    return len(tables) == 0


def _assert_anchors(tables, ctx):
    if len(tables) != N_TABLES:
        raise ParseAssertionError(f"{ctx}: expected {N_TABLES} tables, got {len(tables)}")
    for idx, expect in ANCHORS.items():
        if not expect:
            continue
        cells = _cells(_rows(tables[idx])[0])
        if not cells or cells[0] != expect:
            raise ParseAssertionError(
                f"{ctx}: table[{idx}] anchor mismatch, expected first cell "
                f"{expect!r}, got {cells[:1]!r}"
            )
    for idx, expect in ANCHOR_ROW1.items():
        cells = _cells(_rows(tables[idx])[1])
        if not cells or cells[0] != expect:
            raise ParseAssertionError(
                f"{ctx}: table[{idx}] row[1] anchor mismatch, expected "
                f"{expect!r}, got {cells[:1]!r}"
            )


def _parse_identity(t0, filing, ctx):
    kv = {_cells(tr)[0]: (_cells(tr)[1] if len(_cells(tr)) > 1 else "") for tr in _rows(t0)}
    filing.reg_no = kv.get("Registration Number") or None
    filing.name = kv.get("Name of the Portfolio Manager") or None
    filing.registered_on = kv.get("Date of Registration") or None
    filing.address = kv.get("Registered Address of the Portfolio Manager") or None
    filing.principal_officer = kv.get("Name of Principal Officer") or None
    filing.compliance_officer = kv.get("Name of Compliance Officer") or None
    for key, attr, conv in [
        ("No. of clients as on last day of the month", "clients_total", _int),
        ("Total Assets under Management (AUM) as on last day of the month",
         "aum_cr_total", parse_money_cr),
    ]:
        raw = next((v for k, v in kv.items() if k.startswith(key[:40])), None)
        if raw is not None:
            setattr(filing, attr, conv(raw))
    if not filing.reg_no:
        raise ParseAssertionError(f"{ctx}: no registration number in identity table")


def _parse_client_breakdown(table, filing, ctx):
    """table[1]-shaped: 2 data rows (client count, AUM), 7 value columns:
    PF/EPFO, Corp, NonCorp, NRI, FPI, Other, Total."""
    rows = _rows(table)
    data = [r for r in rows if _cells(r) and re.match(r"^(No\. of|Assets under)", _cells(r)[0])]
    if len(data) != 2:
        raise ParseAssertionError(f"{ctx}: client breakdown: expected 2 data rows, got {len(data)}")
    cols = ("pf_epfo", "corp", "noncorp", "nri", "fpi", "other", "total")
    clients = _cells(data[0])[1:]
    aum = _cells(data[1])[1:]
    if len(clients) != 7 or len(aum) != 7:
        raise ParseAssertionError(f"{ctx}: client breakdown: expected 7 columns, "
                                  f"got {len(clients)}/{len(aum)}")
    for col, raw in zip(cols, clients):
        setattr(filing, f"clients_{col}", _int(raw))
    for col, raw in zip(cols, aum):
        setattr(filing, f"aum_cr_{col}", parse_money_cr(raw))


def _parse_aum_by_service(table, filing, ctx):
    for tr in _rows(table):
        cells = _cells(tr)
        if not cells or cells[0] not in SERVICE_ROW_TO_COL:
            continue
        if len(cells) < 2:
            raise ParseAssertionError(f"{ctx}: service-AUM row {cells[0]!r} has no Total cell")
        setattr(filing, SERVICE_ROW_TO_COL[cells[0]], parse_money_cr(cells[-1]))


def _parse_services_offered(table, filing, ctx):
    flags = {
        "Discretionary Service": "offers_discretionary",
        "Non-Discretionary Service": "offers_non_discretionary",
        "Advisory Service": "offers_advisory",
        "Co-investment Service": "offers_co_investment",
    }
    seen = set()
    for tr in _rows(table)[1:]:
        cells = _cells(tr)
        if len(cells) < 3 or cells[1] not in flags:
            continue
        setattr(filing, flags[cells[1]], cells[2].strip().upper() == "YES")
        seen.add(cells[1])
    missing = set(flags) - seen
    if missing:
        raise ParseAssertionError(f"{ctx}: services-offered table missing rows: {missing}")


def _sum_cr(*raws):
    vals = [parse_money_cr(r) for r in raws]
    present = [v for v in vals if v is not None]
    return sum(present) if present else None


def _parse_approach_aum(table, ctx):
    """13 cells per row: label + Equity(listed,unlisted) + PlainDebt(listed,unlisted)
    + StructuredDebt(listed,unlisted) + Derivatives(equity,commodity,others)
    + MutualFunds + Others + Total. Our schema keeps one column per asset
    class (no listed/unlisted split), so listed+unlisted are summed."""
    out = []
    for tr in _rows(table)[3:]:   # 3 header rows, see the dumped fixture
        cells = _cells(tr)
        if not cells or cells[0] in _SENTINEL_IA or cells[0] == "Total":
            continue
        if len(cells) != 13:
            raise ParseAssertionError(f"{ctx}: approach-AUM row has {len(cells)} cells, "
                                      f"expected 13: {cells[:2]}")
        out.append(ApproachAum(
            ia_raw=cells[0], ia_norm=norm_name(cells[0]),
            aum_cr_equity_listed=parse_money_cr(cells[1]),
            aum_cr_equity_unlisted=parse_money_cr(cells[2]),
            aum_cr_debt_plain=_sum_cr(cells[3], cells[4]),
            aum_cr_debt_structured=_sum_cr(cells[5], cells[6]),
            aum_cr_derivatives=_sum_cr(cells[7], cells[8], cells[9]),
            aum_cr_mutual_funds=parse_money_cr(cells[10]),
            aum_cr_others=parse_money_cr(cells[11]),
            aum_cr=parse_money_cr(cells[12]),
        ))
    return out


def _parse_approach_flows(table, ctx):
    out = []
    for tr in _rows(table)[2:]:
        cells = _cells(tr)
        if not cells or cells[0] in _SENTINEL_IA or cells[0] == "Total":
            continue
        if len(cells) != 7:
            raise ParseAssertionError(f"{ctx}: approach-flow row has {len(cells)} cells, "
                                      f"expected 7: {cells[:2]}")
        out.append(ApproachFlow(
            ia_raw=cells[0], ia_norm=norm_name(cells[0]),
            inflow_cr=parse_money_cr(cells[1]), outflow_cr=parse_money_cr(cells[2]),
            net_flow_cr=parse_money_cr(cells[3]), inflow_fytd_cr=parse_money_cr(cells[4]),
            outflow_fytd_cr=parse_money_cr(cells[5]), net_flow_fytd_cr=parse_money_cr(cells[6]),
        ))
    return out


def _parse_approach_turnover(table, ctx):
    out = []
    for tr in _rows(table)[2:]:
        cells = _cells(tr)
        if not cells or cells[0] in _SENTINEL_IA or cells[0] == "Total":
            continue
        if len(cells) != 3:
            raise ParseAssertionError(f"{ctx}: approach-turnover row has {len(cells)} cells, "
                                      f"expected 3: {cells[:2]}")
        out.append(ApproachTurnover(
            ia_raw=cells[0], ia_norm=norm_name(cells[0]),
            turnover_1m=parse_pct(cells[1]), turnover_1y=parse_pct(cells[2]),
        ))
    return out


def _parse_turnover_summary(table, filing, ctx):
    kv = {}
    for tr in _rows(table)[1:]:
        cells = _cells(tr)
        if len(cells) >= 3:
            kv[cells[1]] = cells[2]
    for key, attr, conv in [
        ("Sales in the month", "sales_cr", parse_money_cr),
        ("Purchase in the month", "purchase_cr", parse_money_cr),
        ("Portfolio Turnover Ratio", "turnover_ratio_1m", parse_pct),
    ]:
        raw = next((v for k, v in kv.items() if k.startswith(key)), None)
        if raw is not None:
            setattr(filing, attr, conv(raw))


def _parse_twrr_returns(table, ctx):
    """Rows alternate: approach, then its benchmark, grouped under bare
    single-cell asset-class headers ('EQUITY', 'MULTI ASSET', ...)."""
    out = []
    asset_class = None
    rows = _rows(table)[2:]   # skip the two header rows
    i = 0
    while i < len(rows):
        cells = _cells(rows[i])
        if len(cells) == 1 and cells[0]:
            label = cells[0].strip().upper()
            if label == "NA":
                asset_class = None    # no strategy classified: nothing real follows
                i += 1
                continue
            if label not in ASSET_CLASS_MAP:
                raise ParseAssertionError(f"{ctx}: unknown asset-class section {label!r}")
            asset_class = ASSET_CLASS_MAP[label]
            i += 1
            continue
        if not cells or cells[0] in _SENTINEL_IA or cells[0].lower().startswith("benchmark"):
            # A stray "Benchmark: 0" row can follow a skipped sentinel "0"
            # approach row (the services-not-offered placeholder pair) --
            # noise from the same degenerate block, not a real benchmark.
            i += 1
            continue
        if i + 1 >= len(rows):
            raise ParseAssertionError(f"{ctx}: approach row {cells[0]!r} has no following benchmark row")
        bcells = _cells(rows[i + 1])
        if not bcells or not bcells[0].lower().startswith("benchmark"):
            raise ParseAssertionError(
                f"{ctx}: expected a benchmark row after {cells[0]!r}, got {bcells[:1]!r}"
            )
        if len(cells) != 11 or len(bcells) != 11:
            raise ParseAssertionError(
                f"{ctx}: TWRR row width {len(cells)}/{len(bcells)}, expected 11: {cells[:2]}"
            )
        if asset_class is None:
            raise ParseAssertionError(f"{ctx}: approach row {cells[0]!r} before any asset-class header")

        approach_vals = [parse_pct(c) for c in cells[2:]]
        bench_vals = [parse_pct(c) for c in bcells[2:]]
        # SEBI writes 0 for "no history yet", same as the benchmark for that
        # window -- a real index never returns exactly 0.0000, so a window is
        # only genuine when the benchmark actually moved.
        cleaned = [None if (v == 0.0 and (b is None or b == 0.0)) else v
                  for v, b in zip(approach_vals, bench_vals)]

        bench_name = bcells[0].split(":", 1)[-1].strip() if ":" in bcells[0] else None
        r = ApproachReturn(
            ia_raw=cells[0], ia_norm=norm_name(cells[0]), asset_class=asset_class,
            aum_cr=parse_money_cr(cells[1]),
            benchmark_raw=bench_name, benchmark_norm=norm_benchmark(bench_name) if bench_name else None,
        )
        for field_name, v in zip(RETURN_FIELDS, cleaned):
            setattr(r, field_name, v)
        out.append(r)
        i += 2
    return out


def _parse_complaints(table, filing, ctx):
    for tr in _rows(table):
        cells = _cells(tr)
        if cells[:1] == ["Total"] and len(cells) == 5:
            filing.complaints_open = _int(cells[1])
            filing.complaints_received = _int(cells[2])
            filing.complaints_resolved = _int(cells[3])
            filing.complaints_pending = _int(cells[4])
            return
    raise ParseAssertionError(f"{ctx}: complaints table has no Total row")


def parse_filing(content: bytes, reg_no_hint: str, as_on) -> SebiFiling:
    ctx = f"SEBI {reg_no_hint} {as_on}"
    doc = lx.fromstring(content)
    if is_no_filing(doc):
        return SebiFiling(no_filing=True)

    tables = doc.xpath(TABLE_CLASS_XPATH)
    _assert_anchors(tables, ctx)

    filing = SebiFiling(no_filing=False)
    _parse_identity(tables[0], filing, ctx)
    _parse_client_breakdown(tables[1], filing, ctx)
    _parse_aum_by_service(tables[2], filing, ctx)
    _parse_services_offered(tables[3], filing, ctx)
    filing.approach_aum = _parse_approach_aum(tables[5], ctx)
    filing.approach_flow = _parse_approach_flows(tables[6], ctx)
    _parse_turnover_summary(tables[7], filing, ctx)
    filing.approach_return = _parse_twrr_returns(tables[8], ctx)
    filing.approach_turnover = _parse_approach_turnover(tables[9], ctx)
    _parse_complaints(tables[18], filing, ctx)
    _check_approach_sets_agree(filing, ctx)
    return filing


def _check_approach_sets_agree(filing, ctx):
    """AUM, flows, returns and turnover come from four separate HTML tables
    that do not always list the same approaches (see SebiFiling docstring).
    Recorded on the filing for review; the caller decides what to do with
    approaches missing from one table -- it is never a reason to drop the rest
    of a manager's month."""
    sets = {
        "aum": {a.ia_norm for a in filing.approach_aum},
        "flow": {a.ia_norm for a in filing.approach_flow},
        "return": {a.ia_norm for a in filing.approach_return},
        "turnover": {a.ia_norm for a in filing.approach_turnover},
    }
    base = sets["aum"]
    for label, s in sets.items():
        if s != base:
            filing.approach_set_mismatch[label] = {
                "only_in_aum": sorted(base - s), "only_in_" + label: sorted(s - base),
            }
    if filing.approach_set_mismatch:
        log.warning("%s: approach set mismatch: %s", ctx, filing.approach_set_mismatch)


def load_manager_list(session: PoliteSession) -> list[tuple[str, str]]:
    """[(pmr_id, display_name), ...] for all ~651 registered managers, scraped
    from the <select> on the report page itself -- the same list a human
    picks from in the form."""
    r = session.get(config.SEBI_PMR, expect_min_bytes=20_000)
    doc = lx.fromstring(r.content)
    opts = doc.xpath("//select[@name='pmrId']/option")
    out = []
    for o in opts:
        v = (o.get("value") or "").strip()
        if not v:
            continue
        parts = v.split("@@")
        reg_no = parts[0] if parts else v
        name = parts[-1] if len(parts) >= 3 else clean_text(o.text_content())
        out.append((v, reg_no, name))
    return out


def fetch_filing(session: PoliteSession, pmr_id: str, reg_no: str, as_on):
    """Returns (SebiFiling, raw_path, sha256, n_bytes)."""
    r = session.post(
        config.SEBI_PMR,
        data={"pmrId": pmr_id, "year": str(as_on.year), "month": str(as_on.month),
             "currdate": "", "format": ""},
        headers={"Referer": config.SEBI_PMR},
        expect_min_bytes=1000,
    )
    slug = reg_no
    path, sha = snapshot(r.content, "sebi", as_on.isoformat(), slug)
    filing = parse_filing(r.content, reg_no, as_on)
    return filing, path, sha, len(r.content)
