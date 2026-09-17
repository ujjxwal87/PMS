import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Btn, Eyebrow, NoteCard } from '../components/ui.jsx'
import StrategyPicker from '../components/StrategyPicker.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { useApp } from '../state.jsx'
import { loadByIds } from '../lib/universe.js'
import { pct } from '../lib/format.js'

const crore = (n) => (n === null || n === undefined ? '—' : `₹${Math.round(n).toLocaleString('en-IN')} Cr`)
const dp2 = (n) => (n === null || n === undefined ? '—' : n.toFixed(2))
const maybePct = (n, dp = 1) => (n === null || n === undefined ? '—' : pct(n, dp))

// [label, accessor, which end wins]. Nothing here is estimated: every row is a
// filed figure or computed from the filed monthly series. Fee, minimum ticket
// and holdings are absent because no source publishes them.
const ROWS = [
  ['1-year return', (s) => maybePct(s.returns['1Y']), 'max'],
  ['3-year CAGR', (s) => maybePct(s.returns['3Y']), 'max'],
  ['5-year CAGR', (s) => maybePct(s.returns['5Y']), 'max'],
  ['Sharpe, 36-mo', (s) => dp2(s.sharpe), 'max'],
  // Drawdown is negative, so the largest value is the shallowest fall.
  ['Max drawdown', (s) => maybePct(s.maxDD), 'max'],
  ['Volatility, annualised', (s) => maybePct(s.vol, 0), 'min'],
  ['AUM', (s) => crore(s.aum), null],
  ['Asset class', (s) => s.assetClass || '—', null],
  ['Benchmark', (s) => s.benchmark || '—', null],
  ['Months of filed history', (s) => String(s.months ?? 0), null],
]

export default function Compare() {
  const { basket, dropFromBasket } = useApp()
  const [picked, setPicked] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ids = basket.map((b) => b.id).join(',')

  useEffect(() => {
    if (!ids) {
      setPicked([])
      return undefined
    }
    let live = true
    setLoading(true)
    setError(null)

    loadByIds(ids.split(','))
      .then((rows) => { if (live) { setPicked(rows); setLoading(false) } })
      .catch((err) => { if (live) { setError(err); setPicked([]); setLoading(false) } })

    return () => { live = false }
  }, [ids])

  const grid = `236px repeat(${Math.max(picked.length, 1)}, minmax(0, 1fr))`

  // A takeaway only earns its place when two books actually differ; with one
  // column there is nothing to contrast, so it is left out rather than padded.
  const takeaway = (() => {
    if (picked.length < 2) return null
    const withDD = picked.filter((s) => s.maxDD !== null && s.returns['3Y'] !== null)
    if (withDD.length < 2) return null
    const safest = withDD.reduce((a, b) => (a.maxDD > b.maxDD ? a : b))
    const richest = withDD.reduce((a, b) => (a.returns['3Y'] > b.returns['3Y'] ? a : b))
    if (safest.id === richest.id) {
      return `${safest.name} leads on both counts here — the best 3-year CAGR of the set at ${pct(
        safest.returns['3Y'],
      )}, and the shallowest fall at ${pct(safest.maxDD)}. On this window there is no trade to weigh.`
    }
    const retGap = richest.returns['3Y'] - safest.returns['3Y']
    const ddGap = safest.maxDD - richest.maxDD
    return `${safest.name} gives up ${retGap.toFixed(1)} points of 3-year CAGR against ${richest.name}, and fell ${ddGap.toFixed(
      1,
    )} points less from its peak. Whether that trade is worth taking depends on how long the money can sit.`
  })()

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
          {basket.map((b) => (
            <span key={b.id} className="chip chip--on" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {b.name}
              <button type="button" aria-label={`Remove ${b.name}`} onClick={() => dropFromBasket(b.id)}>
                ×
              </button>
            </span>
          ))}
          {basket.length === 0 && <span className="note">Add up to three strategies.</span>}
        </div>
        <div style={{ width: 300, maxWidth: '100%' }}>
          <StrategyPicker placeholder="Search a PMS strategy or firm…" />
        </div>
      </div>

      {error && (
        <div className="stack" style={{ border: '1px dashed var(--line-strong)', padding: '32px 20px', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <span className="serif" style={{ fontSize: 19, fontWeight: 700, color: 'var(--neg)' }}>
            Could not load these strategies
          </span>
          <span className="note">{String(error.message || error)}</span>
        </div>
      )}

      {!error && loading && picked.length === 0 && (
        <div className="stack" style={{ border: '1px dashed var(--line-strong)', padding: '40px 20px', gap: 6, alignItems: 'center' }}>
          <span className="note">Loading filings…</span>
        </div>
      )}

      {!error && !loading && basket.length === 0 && (
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
                key={s.id}
                className="stack"
                style={{ background: 'var(--ink)', color: 'var(--on-dark)', padding: '16px 18px', gap: 6, borderLeft: '1px solid rgba(244,240,228,0.2)' }}
              >
                <FirmMark firm={s.firm} domain={s.domain} size={30} tone="dark" />
                <Link to={`/strategy/${s.id}`} className="serif row-link row-link--onDark" style={{ fontSize: 18.5, lineHeight: 1.2 }}>
                  {s.name}
                </Link>
                <span style={{ fontSize: 13.5, color: 'var(--on-dark-4)' }}>{s.firm}</span>
              </div>
            ))}
          </div>

          {ROWS.map(([label, get, dir], ri) => {
            const values = picked.map(get)
            // Only rows that actually parsed to a number get a winner; a column
            // of "—" must never be highlighted as the best of anything.
            const nums = values.map((v) => {
              const n = parseFloat(String(v).replace(/[^\-0-9.]/g, ''))
              return Number.isFinite(n) ? n : null
            })
            const live = nums.filter((n) => n !== null)
            let best = -1
            if (dir && live.length > 1) {
              const target = dir === 'max' ? Math.max(...live) : Math.min(...live)
              best = nums.indexOf(target)
            }

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
                    key={picked[i].id}
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

      {picked.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {takeaway && (
            <NoteCard label="Key takeaway" panel>
              {takeaway}
            </NoteCard>
          )}
          <NoteCard label="What this table cannot tell you">
            Holdings, overlap between books, fee structure and minimum ticket are not published by SEBI or APMI. Ask the
            manager for these directly — nothing here is a substitute.
          </NoteCard>
          <NoteCard label="Reading the window">
            Sharpe, volatility and drawdown come from the monthly returns each manager files with APMI, over the trailing
            36 months. A strategy with a shorter record than its peers is not being compared on the same window.
          </NoteCard>
        </div>
      )}
    </div>
  )
}
