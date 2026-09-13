import { useState } from 'react'
import { Btn, Eyebrow, RailBlock } from '../components/ui.jsx'
import { ARCHIVE, ARCHIVE_FILTERS, MOST_READ } from '../data/content.js'

const MATCHES = {
  All: () => true,
  'Manager interviews': (a) => a.kind === 'Manager interview',
  'Method notes': (a) => a.kind === 'Method note',
  Regulation: (a) => a.kind === 'Regulation',
}

export default function Research() {
  const [filter, setFilter] = useState('All')
  const rows = ARCHIVE.filter(MATCHES[filter])

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="stack pad" style={{ borderBottom: '1px solid var(--line-strong)', gap: 12 }}>
          <Eyebrow tone="gold">Note 214 · 12 pages · published 11 Sep</Eyebrow>
          <h2 style={{ fontSize: 34.5, lineHeight: 1.08, textWrap: 'balance' }}>
            What downside capture tells you that drawdown does not
          </h2>
          <p className="lede" style={{ maxWidth: '74ch' }}>
            Max drawdown is one bad path. Downside capture is every falling quarter in the window, and it separates
            managers who sized down from managers who got lucky on timing. We rebuild both measures for 47 multi-cap
            books.
          </p>
          <div className="row wrap" style={{ gap: 9 }}>
            <Btn>Read the note</Btn>
            <Btn variant="ghost">Download the data</Btn>
          </div>
        </div>

        <div className="row wrap" style={{ padding: '18px var(--gutter) 8px', gap: 8 }}>
          <Eyebrow>Archive</Eyebrow>
          {ARCHIVE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip${filter === f ? ' chip--on' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ padding: '0 var(--gutter) 24px' }}>
          {rows.map((a) => (
            <div key={a.title} className="list-row" style={{ borderTop: '1px solid var(--line)', alignItems: 'baseline', gap: 20 }}>
              <span className="num" style={{ fontSize: 13.5, color: 'var(--muted-2)', width: 82, flex: 'none' }}>{a.date}</span>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <span style={{ fontSize: 17.5, fontWeight: 700, lineHeight: 1.3 }}>{a.title}</span>
                <span className="note">{a.kind} · {a.pages}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Subscription" style={{ gap: 11, padding: '20px 22px' }}>
          <span className="serif" style={{ fontSize: 20.5, fontWeight: 700, lineHeight: 1.2 }}>
            Two notes a month, plus the underlying data
          </span>
          <div className="stack" style={{ gap: 6, fontSize: 15, color: 'var(--ink-2)' }}>
            <span>· Every note since 2021</span>
            <span>· Screener exports as CSV</span>
            <span>· Analyst calls, twice a quarter</span>
          </div>
          <Btn block>₹24,000 a year</Btn>
          <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>Advisors: seat pricing from ₹1,80,000 for five.</span>
        </RailBlock>

        <RailBlock label="Most read this quarter">
          {MOST_READ.map((m) => (
            <div key={m.n} className="row" style={{ alignItems: 'baseline', gap: 10 }}>
              <span className="serif" style={{ fontSize: 19.5, fontWeight: 700, color: 'var(--ghost)' }}>{m.n}</span>
              <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3 }}>{m.title}</span>
            </div>
          ))}
        </RailBlock>
      </aside>
    </div>
  )
}
