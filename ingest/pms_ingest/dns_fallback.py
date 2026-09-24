"""Resolve a host through a public DNS server when the system resolver refuses.

Some corporate/VPN resolvers answer SERVFAIL for particular public domains --
sebi.gov.in among them -- which looks identical to the site being down. This
installs a last-resort fallback: normal resolution is tried first and is what
almost always answers, and only a genuine resolver failure falls through to
`dig @<server>`.

Opt in with PMS_DNS_FALLBACK=8.8.8.8 in ingest/.env. Unset, nothing is patched.
Only the address lookup is redirected -- the hostname still drives TLS SNI and
the Host header, so the request is indistinguishable from an ordinary one.
"""
import logging
import socket
import subprocess
import time

log = logging.getLogger(__name__)

_MIN_TTL = 60.0
_MAX_TTL = 3600.0
_cache: dict[str, tuple[list[str], float]] = {}
_announced: dict[str, list[str]] = {}
_installed = False


def _dig(host: str, server: str) -> list[str]:
    """Return A records for host from `server`, cached against their TTL. [] on failure."""
    try:
        out = subprocess.run(
            ["dig", "+time=5", "+tries=2", "+noall", "+answer", f"@{server}", host, "A"],
            capture_output=True, text=True, timeout=20,
        ).stdout
    except (OSError, subprocess.SubprocessError) as e:
        log.warning("dns fallback: dig failed for %s (%s)", host, e)
        return []

    addrs, ttl = [], _MAX_TTL
    for line in out.splitlines():
        parts = line.split()
        # name ttl class type value -- follow CNAMEs by ignoring non-A rows.
        if len(parts) >= 5 and parts[3] == "A":
            addrs.append(parts[4])
            try:
                ttl = min(ttl, float(parts[1]))
            except ValueError:
                pass
    if addrs:
        _cache[host] = (addrs, time.monotonic() + max(_MIN_TTL, ttl))
    return addrs


def _resolve(host: str, server: str) -> list[str]:
    hit = _cache.get(host)
    if hit and hit[1] > time.monotonic():
        return hit[0]
    return _dig(host, server)


def install(server: str) -> None:
    """Patch socket.getaddrinfo to fall back to `server`. Idempotent."""
    global _installed
    if _installed or not server:
        return
    _installed = True
    original = socket.getaddrinfo

    def getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        try:
            return original(host, port, family, type, proto, flags)
        except socket.gaierror:
            if not isinstance(host, str) or family == socket.AF_INET6:
                raise
            addrs = _resolve(host, server)
            if not addrs:
                raise
            # Announce a host once, and again only if its addresses change. The
            # fallback fires on every request to an unresolvable host, so
            # warning each time would bury the ingest's own output.
            if _announced.get(host) != addrs:
                _announced[host] = list(addrs)
                log.warning("dns fallback: %s resolved via %s to %s",
                            host, server, ", ".join(addrs))
            else:
                log.debug("dns fallback: %s -> %s", host, addrs[0])
            sock_type = type or socket.SOCK_STREAM
            sock_proto = proto or socket.IPPROTO_TCP
            port_num = port if isinstance(port, int) else socket.getservbyname(port or "http")
            return [(socket.AF_INET, sock_type, sock_proto, "", (a, port_num))
                    for a in addrs]

    socket.getaddrinfo = getaddrinfo
    log.info("dns fallback armed: failed lookups retried against %s", server)
