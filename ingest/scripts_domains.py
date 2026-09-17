"""Derive each firm's website domain from its SEBI filing, using the raw
snapshots already on disk -- no re-fetch.

PRIVACY: SEBI publishes the principal and compliance officers' work email
addresses. Those are named individuals' contact details, and re-publishing them
on a marketplace is a different act from SEBI listing them on its own register.
Only the DOMAIN is derived and stored; the addresses themselves are never
written to the database.
"""
import pathlib
import sys
import lxml.html as lx

from pms_ingest import db

# Free providers say nothing about the firm.
GENERIC = {
    'gmail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'hotmail.com', 'outlook.com',
    'rediffmail.com', 'live.com', 'icloud.com', 'protonmail.com', 'ymail.com',
    'googlemail.com', 'gmail.co.in', 'hotmail.co.uk',
}


def domain_from_filing(path):
    text = path.read_text('utf-8', 'ignore')
    if 'statistics-table' not in text:
        return None, None
    doc = lx.fromstring(text)
    rows = doc.xpath("(//table[contains(@class,'statistics-table')])[1]//tr")
    kv = {}
    for tr in rows:
        cells = [c.text_content().strip() for c in tr.xpath('./td|./th')]
        if len(cells) >= 2:
            kv[cells[0]] = cells[1]

    reg = kv.get('Registration Number')
    doms = []
    for key, val in kv.items():
        if 'Email' in key and '@' in val:
            d = val.split('@')[-1].strip().lower().rstrip('.')
            # A trailing typo or stray text after the domain is common enough
            # to guard against; a domain has no spaces.
            d = d.split()[0] if d else ''
            if d and d not in GENERIC and '.' in d:
                doms.append(d)
    if not doms:
        return reg, None
    # The principal officer's address comes first in the table and is the more
    # likely to be a real company address, so first-seen wins.
    return reg, doms[0]


def main(month='2026-07-31'):
    files = sorted(pathlib.Path('raw/sebi').joinpath(month).glob('*.html'))
    found = {}
    for f in files:
        reg, dom = domain_from_filing(f)
        if reg and dom:
            found[reg] = dom
    print(f'{len(files)} filings scanned, {len(found)} domains derived')

    with db.connect() as conn:
        conn.execute("alter table pms.manager add column if not exists website_domain text")
        n = 0
        for reg, dom in found.items():
            n += conn.execute(
                "update pms.manager set website_domain=%s where sebi_reg_no=%s "
                "and website_domain is distinct from %s",
                (dom, reg, dom)).rowcount
        conn.commit()
        print(f'{n} managers updated')
        total = conn.execute("select count(*) n from pms.manager").fetchone()['n']
        have = conn.execute(
            "select count(*) n from pms.manager where website_domain is not null").fetchone()['n']
        print(f'{have} of {total} managers now have a domain')


if __name__ == '__main__':
    main(*sys.argv[1:])
