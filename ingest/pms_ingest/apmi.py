"""APMI standardised performance: fetch, assert, parse.

One POST returns every approach for a (month, strategy, service type) slice.
The full universe is 8 slices; Equity/Discretionary alone is only ~67% of it.
"""
import calendar
import datetime as dt
import logging
from dataclasses import dataclass, asdict

from lxml import html as lx

from . import config
from .fetch import PoliteSession, snapshot
from .normalize import clean_text, norm_name, parse_money_cr, parse_pct

log = logging.getLogger(__name__)


class ParseAssertionError(RuntimeError):
    """Raised when the page's shape is not what we verified it to be.

    Always fatal. A silently shifted column poisons every downstream number,
    so we refuse the whole slice rather than import a plausible-looking lie.
    """


# Verified against the live loadIAReport response on 2026-09-14 AND cross-checked
# against SEBI's own TWRR table for the same manager/month.
#
# TRAP: the APMI landing page renders a 13th <th> reading "9 Months" for which no
# <td> is ever emitted. Parsing that header shifts every period by one and labels
# the 1-year return as 9-month. APMI publishes NINE windows and none is 9-month.
EXPECTED_HEADER = [
    "PMS Provider Name", "IA Name", "AUM (in INR Cr.)",
    "1 Month", "3 Months", "6 Months", "1 Year", "2 Years",
    "3 Years", "4 Years", "5 Years", "Since Inception",
]
N_COLS = 12
RETURN_FIELDS = ("ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_2y",
                 "ret_3y", "ret_4y", "ret_5y", "ret_si")

# A known-good row. If APMI ever reshuffles columns, this trips before we write.
CANARY = {
    ("2026-08-31", "Equity", "D"): {
        "provider_contains": "Dalal & Broacha",
        "aum_cr": 247.95, "ret_1m": 21.59, "ret_si": 22.35,
    },
}


@dataclass
class ApmiRow:
    as_on: str
    strategy: str
    service_type: str
    provider_raw: str
    provider_norm: str
    ia_raw: str
    ia_norm: str
    aum_cr: float | None
    ret_1m: float | None = None
    ret_3m: float | None = None
    ret_6m: float | None = None
    ret_1y: float | None = None
    ret_2y: float | None = None
    ret_3y: float | None = None
    ret_4y: float | None = None
    ret_5y: float | None = None
    ret_si: float | None = None


def month_end(year: int, month: int) -> dt.date:
    return dt.date(year, month, calendar.monthrange(year, month)[1])


def as_on_param(d: dt.date) -> str:
    """APMI's own JS builds this unpadded: 2026-8-31, not 2026-08-31."""
    return f"{d.year}-{d.month}-{d.day}"


def months_available(today: dt.date | None = None):
    """April 2023 through the most recent complete month."""
    today = today or dt.date.today()
    y, m = config.APMI_HISTORY_START
    cur = dt.date(y, m, 1)
    last = dt.date(today.year, today.month, 1) - dt.timedelta(days=1)
    out = []
    while cur <= last.replace(day=1):
        out.append(month_end(cur.year, cur.month))
        cur = dt.date(cur.year + (cur.month == 12), cur.month % 12 + 1, 1)
    return out


def _assert_header(doc, ctx: str):
    ths = [clean_text(t.text_content()) for t in doc.xpath("//table[@id='pmsGridTbl']//th")]
    if not ths:
        raise ParseAssertionError(f"{ctx}: no header row found")
    got = [" ".join(t.split()) for t in ths]
    if got != EXPECTED_HEADER:
        raise ParseAssertionError(
            f"{ctx}: header changed.\n  expected {EXPECTED_HEADER}\n  got      {got}"
        )


def parse_slice(content: bytes, as_on: dt.date, strategy: str, service: str) -> list[ApmiRow]:
    ctx = f"APMI {as_on} {strategy}/{service}"
    doc = lx.fromstring(content)
    _assert_header(doc, ctx)

    rows: list[ApmiRow] = []
    for tr in doc.xpath("//table[@id='pmsGridTbl']//tr"):
        tds = tr.xpath("./td")
        if not tds:
            continue
        if len(tds) != N_COLS:
            raise ParseAssertionError(
                f"{ctx}: row has {len(tds)} cells, expected {N_COLS}: "
                f"{[clean_text(c.text_content())[:28] for c in tds]}"
            )
        cells = [clean_text(c.text_content()) for c in tds]
        provider, ia = cells[0], cells[1]
        if not provider or not ia:
            raise ParseAssertionError(f"{ctx}: row missing provider/IA name: {cells}")
        rec = ApmiRow(
            as_on=as_on.isoformat(), strategy=strategy, service_type=service,
            provider_raw=provider, provider_norm=norm_name(provider),
            ia_raw=ia, ia_norm=norm_name(ia),
            aum_cr=parse_money_cr(cells[2]),
        )
        for field, raw in zip(RETURN_FIELDS, cells[3:]):
            setattr(rec, field, parse_pct(raw))
        rows.append(rec)

    _assert_canary(rows, as_on, strategy, service, ctx)
    return rows


def _assert_canary(rows, as_on, strategy, service, ctx):
    want = CANARY.get((as_on.isoformat(), strategy, service))
    if not want:
        return
    needle = want["provider_contains"].lower()
    hit = next((r for r in rows if needle in r.provider_raw.lower()), None)
    if hit is None:
        raise ParseAssertionError(f"{ctx}: canary provider {want['provider_contains']!r} absent")
    for k, v in want.items():
        if k == "provider_contains":
            continue
        if getattr(hit, k) != v:
            raise ParseAssertionError(
                f"{ctx}: canary {k} is {getattr(hit, k)!r}, expected {v!r} "
                f"-- columns may have shifted"
            )


def find_duplicates(rows: list[ApmiRow]) -> dict:
    """Same (provider, normalised IA) twice in one slice. A parse alarm, never a
    revision: both rows are held out until a human rules."""
    seen: dict[tuple, list] = {}
    for r in rows:
        seen.setdefault((r.provider_norm, r.ia_norm), []).append(r)
    return {k: v for k, v in seen.items() if len(v) > 1}


def fetch_slice(session: PoliteSession, as_on: dt.date, strategy: str, service: str):
    """Returns (rows, raw_path, sha256, n_bytes). Snapshots before parsing."""
    r = session.post(
        config.APMI_REPORT,
        data={
            "strategyname": strategy, "servicetype": service,
            "pmsProvideName": "", "pmsInvAprochName": "",
            "SelectedBenchmark": "", "benchmark": "",
            "asOnDate": as_on_param(as_on),
        },
        headers={"X-Requested-With": "XMLHttpRequest", "Referer": config.APMI_MENU},
        expect_min_bytes=800,
    )
    slug = f"{strategy.replace(' ', '_')}_{service}"
    path, sha = snapshot(r.content, "apmi", as_on.isoformat(), slug)
    rows = parse_slice(r.content, as_on, strategy, service)
    return rows, path, sha, len(r.content)
