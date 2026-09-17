import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eyebrow, KV, RailBlock, SectionHead, Segmented, Stat } from '../components/ui.jsx'
import FirmMark from '../components/FirmMark.jsx'
import PerformanceChart from '../components/PerformanceChart.jsx'
import { loadPeers, loadSebiDetail, loadSeries, loadStrategy } from '../lib/universe.js'
import { growthFromMonthly, WINDOW_MONTHS } from '../lib/growth.js'
import { pct } from '../lib/format.js'

const PERIODS = ['1M', '1Y', '3Y', '5Y']
const CHART_PERIODS = Object.keys(WINDOW_MONTHS)

const crore = (n) => (n === null || n === undefined ? '—' : `₹${Math.round(n).toLocaleString('en-IN')} Cr`)
const maybePct = (n, dp = 1) => (n === null || n === undefined ? '—' : pct(n, dp))
const dp2 = (n) => (n === null || n === undefined ? '—' : n.toFixed(2))

const monthLabel = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'

export default function StrategyDetail() {
  const { id } = useParams()
  const [state, setState] = useState({ loading: true, error: null, s: null, rows: [], sebi: null, peers: [] })
  const [chartPeriod, setChartPeriod] = useState('3Y')

  useEffect(() => {
    let live = true
    setState({ loading: true, error: null, s: null, rows: [], sebi: null, peers: [] })

    loadStrategy(id)
      .then(async (s) => {
        if (!s) return { loading: false, error: null, s: null, rows: [], sebi: null, peers: [] }
        // The three follow-ups are independent, so they go together rather than
        // in series — and a missing SEBI row or peer set must not lose the page.
        const [rows, sebi, peers] = await Promise.all([
          loadSeries(s.id).catch(() => []),
          loadSebiDetail(s.id).catch(() => null),
          loadPeers(s).catch(() => []),
        ])
        return { loading: false, error: null, s, rows, sebi, peers }
      })
      .then((next) => { if (live) setState(next) })
      .catch((err) => { if (live) setState({ loading: false, error: err, s: null, rows: [], sebi: null, peers: [] }) })

    return () => { live = false }
  }, [id])

  const { loading, error, s, rows, sebi, peers } = state

  if (loading) {
    return (
      <div className="pad stack" style={{ gap: 8, padding: '60px var(--gutter)', alignItems: 'center' }}>
        <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>Loading filings…</span>
      </div>
    )
  }

  if (error || !s) {
    return (
      <div className="pad stack" style={{ gap: 10, padding: '60px var(--gutter)', alignItems: 'center', textAlign: 'center' }}>
        <span className="serif" style={{ fontSize: 21.5, fontWeight: 700 }}>
          {error ? 'Could not load this strategy' : 'No filing for this strategy'}
        </span>
        <span className="note" style={{ maxWidth: '48ch' }}>
          {error
            ? String(error.message || error)
            : 'It did not report in the most recent month, or the id is not one we hold.'}
        </span>
        <Link className="linkish" to="/leaderboard">Back to the leaderboard →</Link>
      </div>
    )
  }

  const series = growthFromMonthly(rows, chartPeriod)
  // The benchmark's own windows come from SEBI, which lags APMI by a month, so
  // the comparison is dated separately rather than implied to be same-month.
  const hasBench = Boolean(s.benchmark) && s.excess && s.excess['3Y'] !== null

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-dark" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FirmMark firm={s.firm} domain={s.domain} size={62} tone="dark" />
          <div className="stack" style={{ flex: 1, minWidth: 280, gap: 7 }}>
            <Eyebrow tone="on-dark">
              {s.firm}
              {s.assetClass ? ` · ${s.assetClass}` : ''}
              {s.serviceType === 'D' ? ' · Discretionary' : s.serviceType === 'N' ? ' · Non-discretionary' : ''}
            </Eyebrow>
            <h2 style={{ fontSize: 33, lineHeight: 1.06 }}>{s.name}</h2>
            <span style={{ fontSize: 15, color: 'var(--on-dark-2)', maxWidth: '68ch', lineHeight: 1.5 }}>
              {s.benchmark ? `Benchmarked to ${s.benchmark}. ` : ''}
              {s.months} months of returns filed with APMI, to {monthLabel(s.asOn)}.
              {s.trackBreak ? ' Its strategy or benchmark was re-tagged during this period, which breaks comparability with the earlier record.' : ''}
            </span>
          </div>
          <div className="row wrap" style={{ gap: 24 }}>
            <Stat dark label="3-yr CAGR" value={maybePct(s.returns['3Y'])} />
            <Stat dark label="Sharpe" value={dp2(s.sharpe)} />
            <Stat dark label="AUM" value={crore(s.aum)} />
            <Stat dark label="Max DD" value={maybePct(s.maxDD)} />
          </div>
        </div>

        <SectionHead
          title="Growth of ₹100"
          right={<Segmented items={CHART_PERIODS} value={chartPeriod} onChange={setChartPeriod} />}
        />

        <div style={{ padding: '0 var(--gutter) 8px' }}>
          {series ? (
            <>
              <PerformanceChart series={series} strategyName={s.name} benchmarkName={null} height={310} />
              <p className="card__body" style={{ paddingTop: 10, maxWidth: '80ch' }}>
                ₹100 became <b>₹{series.endStrategy.toFixed(0)}</b> over {series.months} months
                {series.short ? ' — the whole record, which is shorter than this window' : ''}, compounded from the
                monthly returns as filed. No benchmark line: SEBI publishes the benchmark's name but its return series
                is not yet ingested.
              </p>
            </>
          ) : (
            <p className="card__body" style={{ maxWidth: '72ch' }}>
              Not enough filed history to draw this window.
            </p>
          )}
        </div>

        <div style={{ padding: '8px var(--gutter) 22px' }}>
          <div className="tbl-scroll">
            <div style={{ minWidth: 460 }}>
              <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}>
                <div style={{ paddingLeft: 14 }}>Return</div>
                {PERIODS.map((p) => (
                  <div key={p} className="right">{p}</div>
                ))}
              </div>
              <div className="tbl-row tbl-row--plain" style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}>
                <div style={{ padding: '11px 14px', fontWeight: 700 }}>This strategy</div>
                {PERIODS.map((p) => (
                  <div key={p} className="right num" style={{ padding: '11px 8px' }}>
                    {maybePct(s.returns[p])}
                  </div>
                ))}
              </div>
              {hasBench && (
                <>
                  <div className="tbl-row tbl-row--alt" style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}>
                    <div style={{ padding: '11px 14px', fontWeight: 700 }}>{s.benchmark}</div>
                    {PERIODS.map((p) => (
                      <div key={p} className="right num" style={{ padding: '11px 8px' }}>
                        {maybePct(s.benchReturns[p])}
                      </div>
                    ))}
                  </div>
                  <div className="tbl-row tbl-row--plain" style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}>
                    <div style={{ padding: '11px 14px', fontWeight: 700 }}>Difference</div>
                    {PERIODS.map((p) => {
                      const d = s.excess[p]
                      return (
                        <div
                          key={p}
                          className="right num"
                          style={{ padding: '11px 8px', fontWeight: 700,
                                   color: d === null ? 'var(--ink)' : d >= 0 ? 'var(--accent)' : 'var(--neg)' }}
                        >
                          {d === null ? '—' : `${d > 0 ? '+' : ''}${d.toFixed(1)}`}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          <span className="note" style={{ display: 'block', paddingTop: 8 }}>
            1M is the month's return; 1Y and longer are annualised. Strategy figures as filed with APMI for{' '}
            {monthLabel(s.asOn)}; a blank means no history for that window, never zero.
            {hasBench ? ` Benchmark figures are as filed with SEBI for ${monthLabel(s.benchAsOn)}, so the two rows are a month apart.` : ''}
          </span>
        </div>

        <SectionHead title="The numbers behind the ranking" />
        <div className="metric-grid" style={{ margin: '0 var(--gutter) 24px' }}>
          {[
            ['Sharpe, 36-mo', dp2(s.sharpe), 'excess return per unit of risk'],
            ['Volatility', maybePct(s.vol, 0), 'annualised, from monthly returns'],
            ['Max drawdown', maybePct(s.maxDD), 'worst peak to trough on record'],
            ['Filed history', `${s.months} mo`, 'monthly returns available'],
            ['Portfolio turnover', maybePct(sebi?.turnover1y, 0), sebi ? `12 months to ${monthLabel(sebi.asOn)}` : 'not filed'],
            ['Net flow', crore(sebi?.netFlow), sebi ? `month of ${monthLabel(sebi.asOn)}` : 'not filed'],
            ['Net flow, FY to date', crore(sebi?.netFlowFytd), sebi ? `to ${monthLabel(sebi.asOn)}` : 'not filed'],
            ['Inception', s.inception ? monthLabel(s.inception) : '—', 'as recorded'],
          ].map(([label, value, note]) => (
            <div key={label} className="stack metric-grid__cell" style={{ gap: 4 }}>
              <Eyebrow>{label}</Eyebrow>
              <span className="num" style={{ fontSize: 18, fontWeight: 700 }}>{value}</span>
              <span className="note" style={{ fontSize: 12.5 }}>{note}</span>
            </div>
          ))}
        </div>

        <div className="stack" style={{ padding: '20px var(--gutter) 26px', gap: 10, borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
          <Eyebrow>What is not here</Eyebrow>
          <p className="card__body" style={{ maxWidth: '76ch' }}>
            Holdings, sector weights, fees, exit load and the minimum ticket are not published by SEBI or APMI at any
            frequency. They were shown on this page when it ran on sample data; they are gone rather than guessed. Ask
            the manager for the disclosure document and factsheet directly.
          </p>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Where these numbers come from" style={{ gap: 10 }}>
          <KV label="Returns, AUM" value={`APMI · ${monthLabel(s.asOn)}`} />
          <KV label="Flows, turnover" value={sebi ? `SEBI · ${monthLabel(sebi.asOn)}` : 'SEBI · not filed'} />
          <KV label="Registration" value={s.regNo || '—'} lined={false} />
          <Link className="linkish" to={`/managers/${s.managerId}`}>
            The firm's profile →
          </Link>
          <span className="note">
            Sharpe, volatility and drawdown are computed from the filed monthly series, not published by either source.
          </span>
        </RailBlock>

        <RailBlock label="Closest on the numbers" style={{ gap: 11 }}>
          {peers.length === 0 && <span className="note">No peer within three points of this record.</span>}
          {peers.map((p) => (
            <Link key={p.id} to={`/strategy/${p.id}`} className="stack" style={{ gap: 2 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</span>
              <span className="note">
                {p.firm} · 3Y {maybePct(p.returns['3Y'])} · Sharpe {dp2(p.sharpe)}
              </span>
            </Link>
          ))}
        </RailBlock>
      </aside>
    </div>
  )
}
