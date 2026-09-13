import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, KV, RailBlock, Stat, TitleMeta } from '../components/ui.jsx'
import { CIO_MOVES, FIRMS } from '../data/content.js'

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function Managers() {
  const navigate = useNavigate()

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="stack" style={{ padding: '24px var(--gutter) 18px', borderBottom: '1px solid var(--line-strong)', gap: 7 }}>
          <Eyebrow tone="gold">27 firms · asset-weighted</Eyebrow>
          <h2 style={{ fontSize: 30 }}>Ranked by the firm, not the flagship</h2>
          <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '70ch' }}>
            Asset-weighted across every strategy the firm runs, so one good book cannot carry the record. Firms with
            under 36 months of audited history are excluded.
          </span>
        </div>

        {FIRMS.map((f) => (
          <div
            key={f.name}
            style={{ padding: '20px var(--gutter)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}
          >
            <div className="stack" style={{ flex: 1, minWidth: 300, gap: 9 }}>
              <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
                <span className="serif" style={{ fontSize: 21.5, fontWeight: 700 }}>{f.name}</span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--on-dark-gold)', padding: '3px 9px' }}
                >
                  {f.rank}
                </span>
              </div>
              <span className="note">{f.meta}</span>
              <span style={{ fontSize: 15, lineHeight: 1.55, maxWidth: '66ch' }}>{f.blurb}</span>
              <div className="row wrap" style={{ gap: 9 }}>
                <Btn onClick={() => navigate(`/managers/${slug(f.name)}`)}>View profile</Btn>
                <span className="btn btn--quiet">{f.funds}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 104px)', border: '1px solid var(--line)', flex: 'none' }}>
              <div style={{ padding: 12, borderRight: '1px solid var(--line)' }}><Stat label="AUM" value={f.aum} /></div>
              <div style={{ padding: 12, borderRight: '1px solid var(--line)' }}><Stat label="AW Sharpe" value={f.sharpe} /></div>
              <div style={{ padding: 12 }}><Stat label="CIO tenure" value={f.tenure} /></div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rail">
        <RailBlock label="Compliance record" style={{ gap: 11 }}>
          <KV label="Firms with SEBI action" value="3 of 27" />
          <KV label="Late disclosure filings" value="5" />
          <KV label="Clean for 5+ years" value="19" lined={false} />
        </RailBlock>

        <RailBlock label="CIO changes, last 12 months">
          {CIO_MOVES.map((c) => (
            <TitleMeta key={c.title} title={c.title} meta={c.meta} />
          ))}
        </RailBlock>
      </aside>
    </div>
  )
}
