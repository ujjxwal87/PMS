import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, KV, RailBlock, Segmented, SectionHead, TitleMeta } from '../components/ui.jsx'
import UniverseChart from '../components/UniverseChart.jsx'
import { useApp } from '../state.jsx'
import { DISCOVER_NOTES, PERIODS, PERIOD_LABEL, RETURNS, SCREEN_CHIPS, STRATEGIES } from '../data/strategies.js'
import { NEWS } from '../data/content.js'
import { crores, pct, rank2 } from '../lib/format.js'

export default function Discover() {
  const navigate = useNavigate()
  const { period, setPeriod, chips, toggleChip } = useApp()

  const rets = RETURNS[period]
  const rows = STRATEGIES.map((s, i) => ({ ...s, ret: rets[i] }))
    .sort((a, b) => b.ret - a.ret)
    .slice(0, 6)

  const matchCount = Math.max(6, 47 - chips.length * 7)

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="pad" style={{ borderBottom: '1px solid var(--line-strong)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className="stack" style={{ flex: 1, minWidth: 320, gap: 12 }}>
            <Eyebrow tone="gold">This month’s read</Eyebrow>
            <h2 style={{ fontSize: 32, lineHeight: 1.08, textWrap: 'balance' }}>
              Mid-cap books carried the quarter — but only where the manager stayed put
            </h2>
            <p className="lede">
              Across 312 open strategies, firms whose CIO has held the seat five years or more returned ~4.2 points
              more than the rest. Tenure, not AUM, is doing the work — and the three biggest books in the universe sit
              outside the top ten.
            </p>
            <div className="row wrap" style={{ gap: 9 }}>
              <Btn onClick={() => navigate('/research')}>Read the note</Btn>
              <Btn variant="ghost" onClick={() => navigate('/leaderboard')}>Screen on tenure</Btn>
            </div>
          </div>

          <div
            className="stack"
            style={{ width: 288, flex: 'none', background: 'var(--panel-deep)', border: '1px solid var(--line)', padding: 16, gap: 10 }}
          >
            <Eyebrow>Universe at a glance</Eyebrow>
            <UniverseChart />
            <div style={{ borderTop: '1px solid var(--line-strong)', paddingTop: 8 }}>
              <KV label="Median 5-yr CAGR" value="18.9%" lined={false} />
            </div>
            <KV label="Open to new money" value="312 of 351" lined={false} />
            <KV label="Median Sharpe" value="1.12" lined={false} />
          </div>
        </div>

        <SectionHead
          title={`Best-performing books · ${PERIOD_LABEL[period]}`}
          right={
            <div className="row wrap" style={{ gap: 14 }}>
              <Segmented items={PERIODS} value={period} onChange={setPeriod} />
              <span className="linkish" onClick={() => navigate('/leaderboard')}>
                Rank on four metrics →
              </span>
            </div>
          }
        />

        <div style={{ padding: '0 var(--gutter) 24px' }}>
          {rows.map((r, i) => (
            <div key={r.name} className="list-row" style={{ borderTop: '1px solid var(--line)' }}>
              <span className="rank-no num">{rank2(i)}</span>
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <span style={{ fontSize: 16.5, fontWeight: 700 }}>{r.name}</span>
                <span className="note">
                  {r.firm} · {DISCOVER_NOTES[i]}
                </span>
              </div>
              <span className="num" style={{ fontSize: 19, fontWeight: 700, color: 'var(--accent)' }}>
                {pct(r.ret)}
              </span>
              <span className="note num" style={{ width: 96, textAlign: 'right' }}>{crores(r.aum)}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Screen the universe">
          <input className="search" placeholder="Strategy, firm or manager" aria-label="Search the universe" />
          <div className="row wrap" style={{ gap: 7 }}>
            {SCREEN_CHIPS.map((c) => {
              const on = chips.includes(c)
              return (
                <button key={c} type="button" className={`chip${on ? ' chip--on' : ''}`} onClick={() => toggleChip(c)}>
                  {on ? `${c} ×` : c}
                </button>
              )
            })}
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{matchCount} strategies match</span>
        </RailBlock>

        <RailBlock label="Newsflow" style={{ gap: 13 }}>
          {NEWS.map((n) => (
            <TitleMeta key={n.title} title={n.title} meta={n.meta} />
          ))}
        </RailBlock>

        <RailBlock label="Next live session" style={{ gap: 11 }}>
          <div className="dark-card">
            <Eyebrow tone="on-dark">Thu 17 Sep · 6:30 pm</Eyebrow>
            <span className="serif" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
              Anaya Rao on holding concentrated books through a drawdown
            </span>
            <Btn variant="onDark" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/events')}>
              Reserve a seat
            </Btn>
          </div>
        </RailBlock>
      </aside>
    </div>
  )
}
