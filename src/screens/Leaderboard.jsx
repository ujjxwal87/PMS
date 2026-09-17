import { Link, useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, Meter, RailBlock, Segmented } from '../components/ui.jsx'
import StrategyPicker from '../components/StrategyPicker.jsx'
import MetricGuide from '../components/MetricGuide.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { useApp } from '../state.jsx'
import { LENSES, METRIC_LABELS, PERIODS, PERIOD_LABEL } from '../data/lenses.js'
import { useUniverse } from '../hooks/useUniverse.js'
import { AUM_BANDS, bandFor, inBand } from '../lib/bands.js'
import { lensMovers, scoreUniverse } from '../lib/scoring.js'
import { CUSTOM_LENS, describeWeights } from '../lib/weights.js'
import { pct, rank2 } from '../lib/format.js'

const GRID = '44px minmax(208px, 1.9fr) 136px 84px 72px 88px 78px 104px'

// "2026-08-31" -> "August 2026"
const monthLabel = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''

const crore = (n) =>
  n === null || n === undefined ? '—' : `₹${Math.round(n).toLocaleString('en-IN')} Cr`

export default function Leaderboard() {
  const navigate = useNavigate()
  const {
    period, setPeriod, lens, setLens, basket, dropFromBasket,
    customWeights, setCustomWeight, resetCustomWeights,
    band, setBand,
  } = useApp()

  const { loading, error, asOn, strategies } = useUniverse({ assetClass: 'Equity', minAum: 25 })

  const isCustom = lens === CUSTOM_LENS
  const weightLabels = [PERIOD_LABEL[period], ...METRIC_LABELS]
  const weights = isCustom ? customWeights : LENSES[lens].weights
  const blurb = isCustom ? describeWeights(customWeights, weightLabels) : LENSES[lens].blurb

  const scored = scoreUniverse(strategies, weights, period)
  // Rank the whole universe, then show only the size band asked for.
  const ranked = scored.filter((r) => inBand(r, band))
  const movers = lensMovers(strategies, weights, period, LENSES.Balanced.weights)
  const bandOn = band !== 'any'
  const bandLabel = bandFor(band).label
  const periodShort = period === '1M' ? '1M ret' : period === '1Y' ? '1Y ret' : `${period} CAGR`

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="banner-panel" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 7, minWidth: 320, maxWidth: '62ch' }}>
            <Eyebrow tone="gold">
              {asOn ? `SEBI + APMI filings · ${monthLabel(asOn)}` : 'Composite ranking'}
            </Eyebrow>
            <h2 style={{ fontSize: 30, lineHeight: 1.1 }}>A strategy earns its place on three metrics at once</h2>
            <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              Return alone flatters leveraged books. Sharpe and the worst drawdown show what was paid for it — switch the
              lens and the order changes.
            </span>
          </div>
          <div className="stack" style={{ gap: 10, flex: 'none' }}>
            <div style={{ alignSelf: 'flex-end' }}>
              <Segmented items={PERIODS} value={period} onChange={setPeriod} />
            </div>
            <Segmented lg items={[...Object.keys(LENSES), CUSTOM_LENS]} value={lens} onChange={setLens} />
          </div>
        </div>

        <div
          className="row wrap"
          style={{ padding: '12px var(--gutter)', gap: '10px 18px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}
        >
          <Eyebrow>Book size</Eyebrow>
          <Segmented
            items={AUM_BANDS.map((b) => ({ label: b.label, value: b.id }))}
            value={band}
            onChange={setBand}
          />
          <span className="note" style={{ flex: 1, minWidth: 200 }}>
            {bandOn
              ? `${ranked.length} of ${scored.length} strategies manage ${bandLabel}`
              : 'Assets under management as filed with SEBI for the reported month.'}
          </span>
        </div>

        <div
          className="stack"
          style={{ padding: '14px var(--gutter)', gap: 10, borderBottom: '1px solid var(--line)', background: isCustom ? 'var(--panel)' : 'transparent' }}
        >
          <div className="row wrap" style={{ justifyContent: 'space-between', gap: 12 }}>
            <Eyebrow>{isCustom ? 'Weights · drag to re-score' : 'Weights'}</Eyebrow>
            {isCustom && (
              <div className="row wrap" style={{ gap: 14, alignItems: 'center' }}>
                <span className="note num">Total {customWeights.reduce((a, b) => a + b, 0)}%</span>
                <button type="button" className="linkish" onClick={resetCustomWeights}>
                  Reset to balanced
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: '14px 22px' }}>
            {weights.map((w, i) => (
              <div key={weightLabels[i]} className="stack" style={{ gap: 5, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, lineHeight: 1.25, color: 'var(--ink-2)', textWrap: 'pretty' }}>
                  {weightLabels[i]}
                </span>
                <span className="num" style={{ fontSize: 16, fontWeight: 700 }}>{w}%</span>
                {isCustom ? (
                  <input
                    className="weight-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={w}
                    aria-label={`${weightLabels[i]} weight, percent`}
                    onChange={(e) => setCustomWeight(i, Number(e.target.value))}
                  />
                ) : (
                  <Meter thin value={w * 2} tone={i === 2 ? 'gold' : undefined} />
                )}
              </div>
            ))}
          </div>

          {isCustom && (
            <span className="note">
              The other two adjust as you drag, so the weights always total 100%.
            </span>
          )}
        </div>

        <div className="tbl-scroll">
          <div style={{ minWidth: 900 }}>
            <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: GRID }}>
              <div style={{ paddingLeft: 14 }}>#</div>
              <div style={{ padding: '10px' }}>Strategy · firm</div>
              <div>Score</div>
              <div className="right">{periodShort}</div>
              <div className="right">Sharpe</div>
              <div className="right">Max DD</div>
              <div className="right">Vol</div>
              <div className="right" style={{ paddingRight: 16 }}>AUM</div>
            </div>

            {loading && (
              <div className="stack" style={{ padding: '32px 16px', gap: 6, alignItems: 'center', textAlign: 'center' }}>
                <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>Loading filings…</span>
                <span className="note">Reading the latest reported month from SEBI and APMI.</span>
              </div>
            )}

            {error && (
              <div className="stack" style={{ padding: '32px 16px', gap: 6, alignItems: 'center', textAlign: 'center' }}>
                <span className="serif" style={{ fontSize: 19, fontWeight: 700, color: 'var(--neg)' }}>
                  Could not reach the filings database
                </span>
                <span className="note">{String(error.message || error)}</span>
              </div>
            )}

            {!loading && !error && ranked.length === 0 && (
              <div className="stack" style={{ padding: '32px 16px', gap: 6, alignItems: 'center', textAlign: 'center' }}>
                <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>No strategy in this band</span>
                <span className="note">Try a different book size.</span>
              </div>
            )}

            {ranked.map((r, i) => (
              <div
                key={r.id}
                className={`tbl-row ${i % 2 ? 'tbl-row--alt' : 'tbl-row--plain'}`}
                style={{ display: 'grid', gridTemplateColumns: GRID }}
              >
                <div className="num" style={{ padding: '0 0 0 14px', fontSize: 13.5, fontWeight: 700, color: 'var(--gold-ink)' }}>
                  {rank2(i)}
                </div>
                <div className="row" style={{ padding: '12px 10px', gap: 10, minWidth: 0 }}>
                  <FirmMark firm={r.firm} domain={r.domain} size={30} />
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <Link to={`/strategy/${r.id}`} className="row-link truncate">{r.name}</Link>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{r.firm}</span>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Meter value={((r.score - 55) / 45) * 100} style={{ flex: 1 }} />
                  <span className="num" style={{ fontSize: 15, fontWeight: 700 }}>{r.score.toFixed(1)}</span>
                </div>
                <div className="right num">{r.ret === null ? '—' : pct(r.ret)}</div>
                <div className="right num">{r.sharpe === null ? '—' : r.sharpe.toFixed(2)}</div>
                <div className="right num" style={{ color: 'var(--neg)' }}>
                  {r.maxDD === null ? '—' : pct(r.maxDD)}
                </div>
                <div className="right num">{r.vol === null ? '—' : pct(r.vol, 0)}</div>
                <div className="right num" style={{ paddingRight: 16 }}>{crore(r.aum)}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ padding: '13px var(--gutter)', background: 'var(--panel)', display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13.5, color: 'var(--muted)', flexWrap: 'wrap' }}
        >
          <span>
            Sharpe, volatility and drawdown are computed from the monthly returns each manager files with APMI; the
            regulator publishes none of the three. Excludes strategies with under 24 months of filed history.
          </span>
          <span>
            {ranked.length} of {scored.length} shown · {lens} lens
            {bandOn && ` · ${bandLabel}`}
          </span>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label={isCustom ? 'Your weighting' : 'What the lens does'} style={{ gap: 10 }}>
          <p className="card__body">{blurb}</p>
        </RailBlock>

        <RailBlock label="Biggest moves on this lens">
          {movers.length === 0 && (
            <div className="row" style={{ justifyContent: 'space-between', gap: 10, fontSize: 15 }}>
              <span>No change on this lens</span>
              <span className="delta delta--flat">Balanced order</span>
            </div>
          )}
          {movers.map((m) => (
            <div key={m.name} className="row" style={{ justifyContent: 'space-between', gap: 10, fontSize: 15 }}>
              <span className="truncate">{m.name}</span>
              <span className={`delta delta--${m.delta > 0 ? 'up' : 'down'}`}>
                {m.delta > 0 ? '↑ ' : '↓ '}
                {Math.abs(m.delta)} {Math.abs(m.delta) === 1 ? 'place' : 'places'}
              </span>
            </div>
          ))}
        </RailBlock>

        <RailBlock label="Selected for comparison" style={{ gap: 10 }}>
          {basket.map((b) => {
            // The rail labels a pick from what the basket already carries, so a
            // strategy picked outside the current filter still reads correctly.
            const hit = strategies.find((s) => s.id === b.id)
            return (
              <div key={b.id} className="basket-row">
                <span className="stack truncate" style={{ gap: 2 }}>
                  <span className="truncate">{b.name}</span>
                  <span className="note" style={{ fontSize: 12.5 }}>{hit ? crore(hit.aum) : b.firm}</span>
                </span>
                <button type="button" className="basket-row__drop" aria-label={`Remove ${b.name}`} onClick={() => dropFromBasket(b.id)}>
                  ×
                </button>
              </div>
            )
          })}
          {basket.length === 0 && <span className="note">Nothing selected yet — search below.</span>}

          <StrategyPicker />

          <Btn block onClick={() => navigate('/compare')} disabled={basket.length < 2}>
            {basket.length < 2 ? 'Pick at least two' : `Compare these ${basket.length}`}
          </Btn>
        </RailBlock>

        <RailBlock label="How to read the columns" style={{ gap: 14 }}>
          <MetricGuide />
        </RailBlock>
      </aside>
    </div>
  )
}
