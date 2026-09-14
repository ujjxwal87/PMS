"""A deliberately slow, well-behaved HTTP session.

Every response is written to disk and hashed BEFORE anything parses it, so a
parser change can be re-run against the exact bytes the source served.
"""
import hashlib
import logging
import random
import time
from pathlib import Path

import requests

from . import config

log = logging.getLogger(__name__)


class PoliteSession:
    def __init__(self, delay: float = None, max_retries: int = None):
        self.delay = config.REQUEST_DELAY_SEC if delay is None else delay
        self.max_retries = config.MAX_RETRIES if max_retries is None else max_retries
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": config.USER_AGENT})
        self._last_request_at = 0.0

    def _wait(self):
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)

    def request(self, method, url, *, expect_min_bytes=0, **kw):
        last = None
        for attempt in range(1, self.max_retries + 1):
            self._wait()
            try:
                r = self.s.request(method, url, timeout=kw.pop("timeout", 180), **kw)
                self._last_request_at = time.monotonic()
                if r.status_code == 200 and len(r.content) >= expect_min_bytes:
                    return r
                last = f"HTTP {r.status_code}, {len(r.content)} bytes"
            except requests.RequestException as e:
                self._last_request_at = time.monotonic()
                last = f"{type(e).__name__}: {e}"
            # Back off hard; a struggling government server deserves room.
            backoff = min(60.0, self.delay * (2 ** attempt)) + random.uniform(0, 1.5)
            log.warning("attempt %d/%d failed (%s); sleeping %.1fs",
                        attempt, self.max_retries, last, backoff)
            if attempt < self.max_retries:
                time.sleep(backoff)
        raise RuntimeError(f"{method} {url} failed after {self.max_retries} attempts: {last}")

    def get(self, url, **kw):
        return self.request("GET", url, **kw)

    def post(self, url, data=None, **kw):
        return self.request("POST", url, data=data, **kw)


def snapshot(content: bytes, source: str, as_on: str, slug: str) -> tuple[Path, str]:
    """Write raw bytes under raw/<source>/<as_on>/<slug>.html, return (path, sha256)."""
    sha = hashlib.sha256(content).hexdigest()
    d = config.RAW_DIR / source / as_on
    d.mkdir(parents=True, exist_ok=True)
    p = d / f"{slug}.html"
    p.write_bytes(content)
    return p, sha
