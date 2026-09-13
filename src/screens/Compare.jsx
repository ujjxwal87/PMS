import { Btn, Eyebrow, NoteCard } from '../components/ui.jsx'
import StrategyPicker from '../components/StrategyPicker.jsx'
import { useApp } from '../state.jsx'
import { STRATEGIES } from '../data/strategies.js'
import { crores, pct } from '../lib/format.js'

// [label, accessor, which end wins]
const ROWS = [
  ['5-yr CAGR, net', (s) => pct(s.cagr), 'max'],
  ['Sharpe, 36-mo', (s) => s.sharpe.toFixed(2), 'max'],
  ['Upside capture', (s) => `${s.upside}%`, 'max'],
  ['Downside capture', (s) => `${s.downside}%`, 'min'],
  ['Max drawdown', (s) => pct(s.maxDD), 'max'],
  ['AUM', (s) => crores(s.aum), null],
  ['Minimum investment', () => '₹50,00,000', null],
  ['Fee', () => '1.5% + 10% over 10%', null],
  ['Holdings', (s) => String(s.holdings), null],
]

export default function Compare() {
  const { basket, dropFromBasket } = useApp()
  const picked = basket.map((n) => STRATEGIES.find((s) => s.name === n)).filter(Boolean)
  const grid = `236px repeat(${Math.max(picked.length, 1)}, minmax(0, 1fr))`

  return (
    <div className="pad stack" style={{ gap: 18, paddingBottom: 30 }}>
      <div className="row wrap" style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div className="stack" style={{ gap: 6, maxWidth: '64ch' }}>
          <Eyebrow tone="gold">
            {picked.length ? `${picked.length} strategies · same window` : 'Nothing selected yet'}
          </Eyebrow>
          <h2 style={{ fontSize: 30 }}>
            {picked.length
              ? 'Where these books differ is the downside, not the return'
              : 'Search for the books you want side by side'}
          </h2>
        </div>
        <Btn variant="ghost" onClick={() => window.print()} disabled={picked.length === 0}>
          Export as PDF
        </Btn>
      </div>

      <div
        className="row wrap"
        style={{ gap: 14, alignItems: 'center', background: 'var(--panel)', border: '1px solid var(--line)', padding: '14px 16px' }}
      >
        <Eyebrow>Comparing</Eyebrow>
        <div className="row wrap" style={{ gap: 8, flex: 1, minWidth: 220 }}>
          {picked.map((s) => (
            <span key={s.name} className="chip chip--on" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {s.name}
              <button type="button" aria-label={`Remove ${s.name}`} onClick={() => dropFromBasket(s.name)}>
                ×
              </button>
            </span>
          ))}
          {picked.length === 0 && <span className="note">Add up to three strategies.</span>}
        </div>
        <div style={{ width: 300, maxWidth: '100%' }}>
          <StrategyPicker placeholder="Search a PMS strategy or firm…" />
        </div>
      </div>

      {picked.length === 0 && (
        <div
          className="stack"
          style={{ border: '1px dashed var(--line-strong)', padding: '40px 20px', gap: 6, alignItems: 'center', textAlign: 'center' }}
        >
          <span className="serif" style={{ fontSize: 21.5, fontWeight: 700 }}>Nothing to compare yet</span>
          <span className="note" style={{ maxWidth: '46ch' }}>
            Search above, or add strategies from the leaderboard rail. Two or three read best side by side.
          </span>
        </div>
      )}

      {picked.length > 0 && (
      <div style={{ border: '1px solid var(--line-strong)', overflowX: 'auto' }}>
        <div style={{ minWidth: 690 }}>
          <div style={{ display: 'grid', gridTemplateColumns: grid }}>
            <div style={{ background: 'var(--ink)' }} />
            {picked.map((s) => (
              <div
                key={s.name}
                className="stack"
                style={{ background: 'var(--ink)', color: 'var(--on-dark)', padding: '16px 18px', gap: 4, borderLeft: '1px solid rgba(244,240,228,0.2)' }}
              >
                <span className="serif" style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.2 }}>{s.name}</span>
                <span style={{ fontSize: 13.5, color: 'var(--on-dark-4)' }}>{s.firm}</span>
              </div>
            ))}
          </div>

          {ROWS.map(([label, get, dir], ri) => {
            const values = picked.map(get)
            const nums = values.map((v) => parseFloat(String(v).replace(/[^\-0-9.]/g, '')))
            let best = -1
            if (dir === 'max') best = nums.indexOf(Math.max(...nums))
            if (dir === 'min') best = nums.indexOf(Math.min(...nums))

            return (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: grid,
                  alignItems: 'center',
                  borderTop: '1px solid var(--line-soft)',
                  background: ri % 2 ? 'var(--panel)' : 'var(--surface)',
                }}
              >
                <div style={{ padding: '12px 18px', fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</div>
                {values.map((v, i) => (
                  <div
                    key={picked[i].name}
                    className="num"
                    style={{
                      padding: '12px 18px',
                      borderLeft: '1px solid var(--line-soft)',
                      fontSize: 15.5,
                      ...(i === best ? { fontWeight: 700, background: 'var(--ok-bg)', color: 'var(--accent-dark)' } : null),
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <NoteCard label="Key takeaway" panel>
          Vireo gives up ~3.7 points of return against Northwick but keeps 13 points more capital in the two worst
          quarters. On a five-year hold the gap closes; on a three-year hold it does not.
        </NoteCard>
        <NoteCard label="Overlap in holdings">
          Northwick and Sevenhill share 7 of 18 names — ~34% by weight. Holding both is less diversification than the
          labels suggest.
        </NoteCard>
        <NoteCard label="Discussion questions">
          Is the fee step-up on Sevenhill’s performance share acceptable at a ₹1 cr minimum? Who covers the exit load if
          the mandate changes?
        </NoteCard>
      </div>
    </div>
  )
}
