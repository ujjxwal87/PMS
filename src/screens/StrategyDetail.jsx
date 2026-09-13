import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Btn, Eyebrow, KV, Meter, RailBlock, SectionHead, Segmented, Stat } from '../components/ui.jsx'
import FirmMark from '../components/FirmMark.jsx'
import PerformanceChart from '../components/PerformanceChart.jsx'
import { useApp } from '../state.jsx'
import { PERIODS, PERIOD_LABEL, STRATEGIES } from '../data/strategies.js'
import { BENCHMARK } from '../data/holdings-pool.js'
import { MANAGERS, detailFor } from '../data/strategy-detail.js'
import { bookFor } from '../lib/portfolio.js'
import { growthSeries } from '../lib/series.js'
import { slugify } from '../lib/slug.js'
import { crores, pct, shortRupees } from '../lib/format.js'

export default function StrategyDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { period, setPeriod, basket, addToBasket, setPick } = useApp()

  const index = STRATEGIES.findIndex((s) => slugify(s.name) === slug)
  if (index === -1) return <Navigate to="/leaderboard" replace />

  const s = STRATEGIES[index]
  const d = detailFor(s.name)
  const manager = MANAGERS[s.firm]
  const book = bookFor(s)
  const series = growthSeries(s, period, index)
  const inBasket = basket.includes(s.name)

  const peers = STRATEGIES.filter((p) => p.name !== s.name)
    .map((p) => ({ p, gap: Math.abs(p.cagr - s.cagr) + Math.abs(p.downside - s.downside) / 10 }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3)
    .map((x) => x.p)

  const lead = series.endStrategy - series.endBenchmark

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-dark" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FirmMark firm={s.firm} size={62} tone="dark" />
          <div className="stack" style={{ flex: 1, minWidth: 280, gap: 7 }}>
            <Eyebrow tone="on-dark">
              {s.firm} · {d.category} · {d.status}
            </Eyebrow>
            <h2 style={{ fontSize: 33, lineHeight: 1.06 }}>{s.name}</h2>
            <span style={{ fontSize: 15, color: 'var(--on-dark-2)', maxWidth: '68ch', lineHeight: 1.5 }}>
              {d.objective}
            </span>
          </div>
          <div className="row wrap" style={{ gap: 24 }}>
            <Stat dark label="5-yr CAGR" value={pct(s.cagr)} />
            <Stat dark label="Sharpe" value={s.sharpe.toFixed(2)} />
            <Stat dark label="AUM" value={crores(s.aum)} />
            <Stat dark label="Minimum" value={shortRupees(s.minInvestment)} />
          </div>
        </div>

        <SectionHead
          title={`Growth of ₹100 · ${PERIOD_LABEL[period]}`}
          right={<Segmented items={PERIODS} value={period} onChange={setPeriod} />}
        />

        <div style={{ padding: '0 var(--gutter) 8px' }}>
          <PerformanceChart
            series={series}
            strategyName={s.name}
            benchmarkName={BENCHMARK}
            height={310}
          />
          <p className="card__body" style={{ paddingTop: 10, maxWidth: '80ch' }}>
            ₹100 became <b>₹{series.endStrategy.toFixed(0)}</b> against <b>₹{series.endBenchmark.toFixed(0)}</b> in the
            benchmark — {lead >= 0 ? 'ahead by' : 'behind by'} ₹{Math.abs(lead).toFixed(0)} over the window.
          </p>
        </div>

        {/* the same numbers as text, for anyone who cannot read the lines */}
        <div style={{ padding: '8px var(--gutter) 22px' }}>
          <div className="tbl-scroll">
            <div style={{ minWidth: 460 }}>
              <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}>
                <div style={{ paddingLeft: 14 }}>Return</div>
                {PERIODS.map((p) => (
                  <div key={p} className="right">{p}</div>
                ))}
              </div>
              {[
                ['This strategy', (p, i) => pct(growthSeries(s, p, index).strategyReturn)],
                [BENCHMARK, (p) => pct(growthSeries(s, p, index).benchmarkReturn)],
              ].map(([label, get], ri) => (
                <div
                  key={label}
                  className={`tbl-row ${ri % 2 ? 'tbl-row--alt' : 'tbl-row--plain'}`}
                  style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 92px)' }}
                >
                  <div style={{ padding: '11px 14px', fontWeight: 700 }}>{label}</div>
                  {PERIODS.map((p) => (
                    <div key={p} className="right num" style={{ padding: '11px 8px' }}>{get(p)}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <span className="note" style={{ display: 'block', paddingTop: 8 }}>
            1M and 1Y are period returns; 3Y and 5Y are annualised. Net of fees, against the {BENCHMARK}.
          </span>
        </div>

        <SectionHead title="The numbers behind the ranking" />
        <div
          className="metric-grid"
          style={{ margin: '0 var(--gutter) 24px' }}
        >
          {[
            ['Upside capture', `${s.upside}%`, 'of the benchmark’s rise'],
            ['Downside capture', `${s.downside}%`, 'of its fall'],
            ['Max drawdown', pct(s.maxDD), 'worst peak to trough'],
            ['Holdings', String(s.holdings), `top five ${book.topFive.toFixed(0)}%`],
            ['Turnover', d.turnover, 'of the book, annually'],
            ['Fee', d.fee, 'plus GST at 18%'],
            ['Exit load', d.exitLoad, 'on early redemption'],
            ['Inception', d.inception, `benchmark ${BENCHMARK}`],
          ].map(([label, value, note]) => (
            <div key={label} className="stack metric-grid__cell" style={{ gap: 4 }}>
              <Eyebrow>{label}</Eyebrow>
              <span className="num" style={{ fontSize: 18, fontWeight: 700 }}>{value}</span>
              <span className="note" style={{ fontSize: 12.5 }}>{note}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0, borderTop: '1px solid var(--line)' }}>
          <div className="stack" style={{ padding: '20px var(--gutter)', gap: 12, borderRight: '1px solid var(--line)' }}>
            <Eyebrow>Top ten holdings</Eyebrow>
            {book.holdings.slice(0, 10).map((h) => (
              <div key={h.name} className="stack" style={{ gap: 4 }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, fontSize: 14.5 }}>
                  <span className="truncate">
                    {h.name} <span className="note">· {h.sector}</span>
                  </span>
                  <b className="num">{h.weight.toFixed(1)}%</b>
                </div>
                <Meter value={(h.weight / book.holdings[0].weight) * 100} />
              </div>
            ))}
            <span className="note">Ten of {s.holdings} names · {book.cash.toFixed(1)}% in cash</span>
          </div>

          <div className="stack" style={{ padding: '20px var(--gutter)', gap: 12 }}>
            <Eyebrow>Sector exposure</Eyebrow>
            {book.sectorRows.map((r) => (
              <div key={r.name} className="stack" style={{ gap: 4 }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, fontSize: 14.5 }}>
                  <span className="truncate">{r.name}</span>
                  <b className="num">{r.weight.toFixed(1)}%</b>
                </div>
                <Meter value={(r.weight / book.sectorRows[0].weight) * 100} />
              </div>
            ))}
            <span className="note">Weights as at 31 Aug 2026 · sums to 100% with cash</span>
          </div>
        </div>

        <div className="stack" style={{ padding: '20px var(--gutter) 26px', gap: 10, borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
          <Eyebrow>Who runs it</Eyebrow>
          <div className="row wrap" style={{ gap: 16, alignItems: 'flex-start' }}>
            <FirmMark firm={s.firm} size={46} />
            <div className="stack" style={{ flex: 1, minWidth: 260, gap: 6 }}>
              <span className="serif" style={{ fontSize: 21, fontWeight: 700 }}>{manager.name}</span>
              <span className="note">{manager.role} · {s.firm}</span>
              <p className="card__body" style={{ maxWidth: '72ch' }}>{manager.note}</p>
              <Link className="linkish" to={`/managers/${slugify(s.firm)}`}>
                Read the manager profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Open an account" style={{ gap: 10 }}>
          <KV label="Minimum" value={shortRupees(s.minInvestment)} />
          <KV label="Fee" value={d.fee} />
          <KV label="Status" value={d.status} lined={false} />
          <Btn
            block
            onClick={() => {
              setPick(s.name)
              navigate('/invest')
            }}
          >
            Invest in this strategy
          </Btn>
          <Btn block variant="ghost" onClick={() => (inBasket ? navigate('/compare') : addToBasket(s.name))}>
            {inBasket ? 'In your comparison — view' : 'Add to comparison'}
          </Btn>
        </RailBlock>

        <RailBlock label="Documents" style={{ gap: 11 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Disclosure document</span>
          <span className="note" style={{ marginTop: -8 }}>PDF · dated 1 Jul 2026</span>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Monthly factsheet</span>
          <span className="note" style={{ marginTop: -8 }}>PDF · Aug 2026</span>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>Fee schedule and hurdle</span>
          <span className="note" style={{ marginTop: -8 }}>PDF · dated 1 Jul 2026</span>
        </RailBlock>

        <RailBlock label="Closest on the numbers" style={{ gap: 11 }}>
          {peers.map((p) => (
            <Link key={p.name} to={`/strategy/${slugify(p.name)}`} className="stack" style={{ gap: 2 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</span>
              <span className="note">
                {p.firm} · {pct(p.cagr)} · downside {p.downside}%
              </span>
            </Link>
          ))}
        </RailBlock>
      </aside>
    </div>
  )
}
