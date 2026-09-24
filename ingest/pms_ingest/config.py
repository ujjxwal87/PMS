import os
from pathlib import Path
from dotenv import load_dotenv

INGEST_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = INGEST_DIR.parent
load_dotenv(INGEST_DIR / ".env")


def _path(env_value: str) -> Path:
    p = Path(env_value)
    return p if p.is_absolute() else REPO_ROOT / p


DATABASE_URL = os.getenv("PMS_DATABASE_URL", "")
RAW_DIR = _path(os.getenv("PMS_RAW_DIR", "ingest/raw"))
REQUEST_DELAY_SEC = float(os.getenv("PMS_REQUEST_DELAY_SEC", "2.0"))
MAX_RETRIES = int(os.getenv("PMS_MAX_RETRIES", "4"))
USER_AGENT = os.getenv("PMS_USER_AGENT", "bunker-o-billionaire-ingest/0.1")
# Public resolver to retry against when the system one fails outright. Empty =
# off; see pms_ingest/dns_fallback.py.
DNS_FALLBACK = os.getenv("PMS_DNS_FALLBACK", "")

APMI_BASE = "https://www.apmiindia.org/apmi"
APMI_MENU = f"{APMI_BASE}/welcomeiaperformance.htm?action=PMSmenu"
APMI_REPORT = f"{APMI_BASE}/welcomeiaperformance.htm?action=loadIAReport"

SEBI_PMR = "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doPmr=yes"

# APMI publishes from April 2023; earlier months are disabled in its own UI.
APMI_HISTORY_START = (2023, 4)
STRATEGIES = ("Equity", "Debt", "Hybrid", "Multi Asset")
SERVICE_TYPES = ("D", "N")   # Discretionary, Non-discretionary


def require_database_url() -> str:
    if not DATABASE_URL or "PASTE_PASSWORD_HERE" in DATABASE_URL:
        raise SystemExit(
            "PMS_DATABASE_URL is not set. Edit ingest/.env and replace "
            "PASTE_PASSWORD_HERE with the Supabase database password."
        )
    return DATABASE_URL
