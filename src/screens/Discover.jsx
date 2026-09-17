import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, KV, RailBlock, Segmented, SectionHead } from '../components/ui.jsx'
import UniverseChart from '../components/UniverseChart.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { useApp } from '../state.jsx'
import { PERIODS, PERIOD_LABEL } from '../data/lenses.js'
import {
  loadAssetClassCounts, loadTopBy, loadTopFlows, loadUniverseHistogram, loadUniverseStats,
} from '../lib/universe.js'
import { pct, rank2 } from '../lib/format.js'

const crore = (n) => {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L Cr`
  return `₹${Math.round(n).toLocaleString('en-IN')} Cr`
}
const monthLabel = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''

export default function Discover() {
  const navigate = useNavigate()
  const { period, setPeriod, chips, toggleChip } = useApp()
  const [meta, setMeta] = useState({ stats: null, hist: [], counts: {}, flows: [], error: null })
  const [top, setTop] = useState({ loading: true, rows: [] })

  // Everything on this page that does not depend on the period switch.
  useEffect(() => {
    let live = true
    Promise.all([
      loadUniverseStats(), loadUniverseHistogram(), loadAssetClassCounts(), loadTopFlows(),
    ])
      .then(([stats, hist, counts, flows]) => {
        if (live) setMeta({ stats, hist, counts, flows, error: null })
      })
      .catch((error) => { if (live) setMeta((m) => ({ ...m, error })) })
    return () => { live = false }
  }, [])

  // The one class chip that is on, if any. Asset class is the only screener
  // facet either source actually publishes.
  const activeClass = Object.keys(meta.counts).find((c) => chips.includes(c)) ?? null

  useEffect(() => {
    let live = true
    setTop({ loading: true, rows: [] })
    loadTopBy(period, { limit: 6, assetClass: activeClass })
      .then((rows) => { if (live) setTop({ loading: false, rows }) })
      .catch(() => { if (live) setTop({ loading: false, rows: [] }) })
    return () => { live = false }
  }, [period, activeClass])

  const { stats, hist, counts, flows, error } = meta
  const matchCount = activeClass ? counts[activeClass] : stats?.strategies

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="pad" style={{ borderBottom: '1px solid var(--line-strong)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div className="stack" style={{ flex: 1, minWidth: 320, gap: 12 }}>
            <Eyebrow tone="gold">
              {stats ? `Filings to ${monthLabel(stats.asOn)}` : 'Loading the register'}
            </Eyebrow>
            <h2 style={{ fontSize: 34.5, lineHeight: 1.08, textWrap: 'balance' }}>
              Every registered portfolio manager in India, on the numbers they file
            </h2>
            <p className="lede">
              {stats ? (
                <>
                  {stats.strategies.toLocaleString('en-IN')} strategies from {stats.firms} firms, as filed with APMI
                  and SEBI. The median three-year return is {pct(stats.medianRet3y)} and the median worst drawdown{' '}
                  {pct(stats.medianMaxDd)} — so half of this market fell further than that from a peak. Nothing here is
                  a manager's own marketing figure.
                </>
              ) : (
                'Reading the filings…'
              )}
            </p>
            <div className="row wrap" style={{ gap: 9 }}>
              <Btn onClick={() => navigate('/leaderboard')}>Rank the universe</Btn>
              <Btn variant="ghost" onClick={() => navigate('/managers')}>Browse firms</Btn>
            </div>
          </div>

          <div
            className="stack"
            style={{ width: 300, flex: 'none', background: 'var(--panel-deep)', border: '1px solid var(--line)', padding: 16, gap: 10 }}
          >
            <Eyebrow>Three-year returns, whole universe</Eyebrow>
            <UniverseChart buckets={hist} median={stats?.medianRet3y ?? null} />
            <div style={{ borderTop: '1px solid var(--line-strong)', paddingTop: 8 }}>
              <KV label="Median 3-yr CAGR" value={stats ? pct(stats.medianRet3y) : '—'} lined={false} />
            </div>
            <KV label="Median Sharpe" value={stats ? stats.medianSharpe.toFixed(2) : '—'} lined={false} />
            <KV
              label="With 24 mo+ history"
              value={stats ? `${stats.rated.toLocaleString('en-IN')} of ${stats.strategies.toLocaleString('en-IN')}` : '—'}
              lined={false}
            />
          </div>
        </div>

        <SectionHead
          title={`Best-performing books · ${PERIOD_LABEL[period]}${activeClass ? ` · ${activeClass}` : ''}`}
          right={
            <div className="row wrap" style={{ gap: 14 }}>
              <Segmented items={PERIODS} value={period} onChange={setPeriod} />
              <span className="linkish" onClick={() => navigate('/leaderboard')}>
                Rank on three metrics →
              </span>
            </div>
          }
        />

        <div style={{ padding: '0 var(--gutter) 24px' }}>
          {top.loading && <p className="card__body" style={{ paddingTop: 12 }}>Loading…</p>}
          {!top.loading && top.rows.length === 0 && (
            <p className="card__body" style={{ paddingTop: 12 }}>Nothing filed for this window.</p>
          )}
          {top.rows.map((r, i) => (
            <div key={r.id} className="list-row" style={{ borderTop: '1px solid var(--line)' }}>
              <span className="rank-no num">{rank2(i)}</span>
              <FirmMark firm={r.firm} domain={r.domain} size={34} />
              <div className="stack" style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Link to={`/strategy/${r.id}`} className="row-link" style={{ fontSize: 18 }}>{r.name}</Link>
                <span className="note">
                  {r.firm}
                  {r.assetClass ? ` · ${r.assetClass}` : ''}
                  {r.sharpe !== null ? ` · Sharpe ${r.sharpe.toFixed(2)}` : ''}
                </span>
              </div>
              <span className="num" style={{ fontSize: 20.5, fontWeight: 700, color: 'var(--accent)' }}>
                {pct(r.returns[period])}
              </span>
              <span className="note num" style={{ width: 104, textAlign: 'right' }}>{crore(r.aum)}</span>
            </div>
          ))}
          <span className="note" style={{ display: 'block', paddingTop: 10 }}>
            Books under ₹100 Cr are held back from this list: on a small enough base a percentage return swings on
            almost no money.
          </span>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Screen the universe">
          <div className="row wrap" style={{ gap: 7 }}>
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([c, n]) => {
                const on = chips.includes(c)
                return (
                  <button key={c} type="button" className={`chip${on ? ' chip--on' : ''}`} onClick={() => toggleChip(c)}>
                    {on ? `${c} ×` : `${c} ${n}`}
                  </button>
                )
              })}
          </div>
          <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>
            {matchCount ? `${matchCount.toLocaleString('en-IN')} strategies match` : '—'}
          </span>
          <span className="note">
            Asset class is the only screener facet either source publishes. Minimum ticket, holdings and CIO tenure are
            not filed anywhere.
          </span>
        </RailBlock>

        <RailBlock label="Where the money went" style={{ gap: 11 }}>
          {flows.length === 0 && <span className="note">No flow data filed yet.</span>}
          {flows.map((f) => (
            <div key={f.id} className="stack" style={{ gap: 2 }}>
              <Link to={`/strategy/${f.id}`} className="row-link truncate" style={{ fontSize: 14.5, fontWeight: 700 }}>
                {f.name}
              </Link>
              <span className="note">
                {f.firm} · net {f.netFlow >= 0 ? '+' : ''}{crore(f.netFlow)}
                {f.netFlowPct !== null ? ` · ${f.netFlowPct >= 0 ? '+' : ''}${f.netFlowPct}% of the book` : ''}
              </span>
            </div>
          ))}
          {flows.length > 0 && (
            <span className="note">
              Largest net inflows in the month SEBI last published, {monthLabel(flows[0].flowAsOn)} — a month behind the
              return figures above.
            </span>
          )}
        </RailBlock>

        {error && (
          <RailBlock label="Problem">
            <span className="note" style={{ color: 'var(--neg)' }}>{String(error.message || error)}</span>
          </RailBlock>
        )}
      </aside>
    </div>
  )
}
