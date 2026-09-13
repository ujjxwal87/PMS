import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, Meter, RailBlock, SectionHead, Stat, TitleMeta } from '../components/ui.jsx'
import { HOLDINGS, STATEMENTS } from '../data/content.js'
import { lakhs } from '../lib/format.js'

export default function Portfolio() {
  const navigate = useNavigate()

  const invested = HOLDINGS.reduce((a, h) => a + h.invested, 0)
  const value = HOLDINGS.reduce((a, h) => a + h.value, 0)
  const gainPct = ((value - invested) / invested) * 100

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-dark" style={{ padding: '24px var(--gutter) 20px', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="stack" style={{ gap: 5 }}>
            <Eyebrow tone="on-dark">Portfolio value · 12 Sep 2026</Eyebrow>
            <span className="serif num" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{lakhs(value)}</span>
            <span style={{ fontSize: 14, color: 'var(--on-dark-3)' }}>
              Invested {lakhs(invested)} · gain +{lakhs(value - invested)} (+{gainPct.toFixed(1)}%)
            </span>
          </div>
          <div className="row wrap" style={{ gap: 26 }}>
            <Stat dark label="Portfolio XIRR" value="15.6%" />
            <Stat dark label="Strategies" value={String(HOLDINGS.length)} />
            <Stat dark label="Managers" value={String(new Set(HOLDINGS.map((h) => h.firm)).size)} />
          </div>
        </div>

        <SectionHead title="Holdings by strategy" right={<span className="note">Valued at 11 Sep close · net of accrued fees</span>} />

        <div style={{ padding: '0 var(--gutter) 24px' }}>
          {HOLDINGS.map((h) => {
            const weight = Math.round((h.value / value) * 100)
            return (
              <div key={h.name} className="list-row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 22, flexWrap: 'wrap' }}>
                <div className="stack" style={{ flex: 1, minWidth: 220, gap: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{h.name}</span>
                  <span className="note">{h.firm} · funded {h.since}</span>
                  <Meter value={weight} style={{ maxWidth: 260 }} />
                </div>
                <div className="row wrap num" style={{ gap: 24 }}>
                  <Stat label="Value" value={lakhs(h.value)} />
                  <Stat label="Gain" value={`+${lakhs(h.value - h.invested)}`} />
                  <Stat label="XIRR" value={`${h.xirr.toFixed(1)}%`} />
                  <Stat label="Weight" value={`${weight}%`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Statements">
          {STATEMENTS.map((s) => (
            <TitleMeta key={s.title} title={s.title} meta={s.meta} />
          ))}
        </RailBlock>

        <RailBlock label="Watch item" style={{ gap: 10 }}>
          <p className="card__body">
            Rukmini Dividend Yield is 9 months old and 14% of the book. Judging it before 36 months of history is noise,
            not signal.
          </p>
        </RailBlock>

        <RailBlock style={{ gap: 10 }}>
          <Btn block onClick={() => navigate('/invest')}>Add to an existing account</Btn>
          <Btn block variant="ghost" onClick={() => navigate('/fees')}>Check what fees cost you</Btn>
        </RailBlock>
      </aside>
    </div>
  )
}
