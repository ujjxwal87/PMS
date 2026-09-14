"""Parsing and name-normalisation rules shared by both sources.

Two source-specific conventions to keep straight:
  * APMI writes "NA" when an approach has no history for a window.
  * SEBI writes 0 instead -- and so does the benchmark row beside it. A zero
    return whose benchmark is also exactly zero means "no history", not "0%".
"""
import html as _html
import re
import unicodedata

NA_TOKENS = {"", "-", "--", "na", "n.a.", "n/a", "nil", "none"}

# Trailing corporate suffixes carry no identity; two spellings of the same firm
# differ only here. Stripped for MATCHING only -- never for display.
_SUFFIXES = re.compile(
    r"\b(PRIVATE|PVT|PUBLIC|LIMITED|LTD|LLP|LLC|INC|COMPANY|CO|CORPORATION|CORP)\b\.?",
    re.I,
)


# Symbols that CARRY PRODUCT IDENTITY and must survive normalisation.
# '+' separates "Stable Asset" (Rs 2.31 Cr) from "Stable+ Asset" (Rs 4.58 Cr) --
# dropping it merges two different funds into one track record.
# '&' is folded to AND instead, so "A & B" and "A and B" match as intended.
_SYMBOL_WORDS = (("+", " PLUS "), ("&", " AND "))


def norm_name(s: str) -> str:
    """Matching key for approaches. Keeps digits and identity-bearing symbols:
    'Approach' / 'Approach 2' and 'Stable' / 'Stable+' must never collapse."""
    if s is None:
        return ""
    s = _html.unescape(unicodedata.normalize("NFKD", s))
    s = s.replace("₹", " ")
    s = re.sub(r"\s+", " ", s).strip().upper()
    for sym, word in _SYMBOL_WORDS:
        s = s.replace(sym, word)
    return re.sub(r"[^A-Z0-9]", "", s)


def norm_firm(s: str) -> str:
    """Like norm_name but drops corporate suffixes. Firms only, never approaches."""
    if s is None:
        return ""
    s = _html.unescape(unicodedata.normalize("NFKD", s))
    s = re.sub(r"\s+", " ", s).strip()
    s = _SUFFIXES.sub(" ", s).upper()
    for sym, word in _SYMBOL_WORDS:
        s = s.replace(sym, word)
    return re.sub(r"[^A-Z0-9]", "", s)


def norm_benchmark(s: str) -> str:
    """'BSE 500 TRI' (APMI) and 'BSE500TRI' (SEBI) are the same index."""
    if s is None:
        return ""
    s = re.sub(r"(?i)^\s*benchmark\s*:\s*", "", _html.unescape(s))
    return re.sub(r"[^A-Z0-9]", "", s.upper())


def clean_text(s: str) -> str:
    """Collapse whitespace for display. Preserves punctuation: the trailing dot
    in 'CENTRUM FLEXICAP PORTFOLIO.' is part of the registered name."""
    if s is None:
        return ""
    # Entities FIRST: '&#8377;' is the rupee sign, and a numeric parser that has
    # not unescaped it happily reads 8377 as the amount.
    s = _html.unescape(s).replace("\xa0", " ")
    return re.sub(r"\s+", " ", s).strip()


def parse_money_cr(s: str):
    """'Rs 247.95' / '247.95' / 'NA' -> float | None. Always INR crore."""
    if s is None:
        return None
    t = clean_text(s).replace("₹", "").replace("Rs.", "").replace("Rs", "")
    t = t.replace(",", "").strip()
    # Reject anything that is not purely a number after cleaning, so a stray
    # entity or footnote marker fails loud instead of parsing as an amount.
    if t.lower() in NA_TOKENS:
        return None
    m = re.fullmatch(r"-?\d+(?:\.\d+)?", t)
    if m:
        return float(m.group(0))
    raise ValueError(f"unparseable AUM value: {s!r} (cleaned to {t!r})")


def parse_pct(s: str):
    """'21.59' / '-3.4' / 'NA' -> float | None. Percent, never a fraction."""
    if s is None:
        return None
    t = clean_text(s).replace("%", "").replace(",", "").strip()
    if t.lower() in NA_TOKENS:
        return None
    m = re.match(r"^-?\d+(?:\.\d+)?$", t)
    return float(m.group(0)) if m else None


def sebi_zero_is_null(values, benchmark_values):
    """SEBI's 0-as-null. A window is real only if the benchmark moved; an index
    does not return exactly 0.0000 over a year. Returns a list with the dead
    windows replaced by None.

    values / benchmark_values are aligned same-length lists of float | None.
    """
    out = []
    for v, b in zip(values, benchmark_values):
        if v == 0.0 and (b is None or b == 0.0):
            out.append(None)
        else:
            out.append(v)
    return out
