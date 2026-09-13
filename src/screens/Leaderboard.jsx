import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, Meter, RailBlock, Segmented } from '../components/ui.jsx'
import StrategyPicker from '../components/StrategyPicker.jsx'
import MetricGuide from '../components/MetricGuide.jsx'
import { useApp } from '../state.jsx'
import { LENSES, PERIODS, PERIOD_LABEL } from '../data/strategies.js'
import { lensMovers, scoreUniverse } from '../lib/scoring.js'
import { CUSTOM_LENS, describeWeights } from '../lib/weights.js'
import { pct, rank2 } from '../lib/format.js'

const GRID = '40px minmax(160px, 1.9fr) 128px 76px 64px 76px 92px 78px'

export default function Leaderboard() {
  const navigate = useNavigate()
  const {
    period, setPeriod, lens, setLens, basket, dropFromBasket,
    customWeights, setCustomWeight, resetCustomWeights,
  } = useApp()

  const isCustom = lens === CUSTOM_LENS
  const weightLabels = [PERIOD_LABEL[period], 'Sharpe', 'Upside capture', 'Downside capture']
  const weights = isCustom ? customWeights : LENSES[lens].weights
  const blurb = isCustom ? describeWeights(customWeights, weightLabels) : LENSES[lens].blurb

  const ranked = scoreUniverse(weights, period)
  const movers = lensMovers(weights, period)
  const periodShort = period === '1M' ? '1M ret' : period === '1Y' ? '1Y ret' : `${period} CAGR`

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="banner-panel" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 7, minWidth: 320, maxWidth: '62ch' }}>
            <Eyebrow tone="gold">Composite ranking · 36-month window</Eyebrow>
            <h2 style={{ fontSize: 28, lineHeight: 1.1 }}>A strategy earns its place on four metrics at once</h2>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              Return alone flatters leveraged books. Upside and downside capture show what was paid for it — switch the
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
                <span style={{ fontSize: 12.5, lineHeight: 1.25, color: 'var(--ink-2)', textWrap: 'pretty' }}>
                  {weightLabels[i]}
                </span>
                <span className="num" style={{ fontSize: 15, fontWeight: 700 }}>{w}%</span>
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
                  <Meter thin value={w * 2} tone={i === 3 ? 'gold' : undefined} />
                )}
              </div>
            ))}
          </div>

          {isCustom && (
            <span className="note">
              The other three adjust as you drag, so the weights always total 100%.
            </span>
          )}
        </div>

        <div className="tbl-scroll">
          <div style={{ minWidth: 714 }}>
            <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: GRID }}>
              <div style={{ paddingLeft: 14 }}>#</div>
              <div style={{ padding: '10px' }}>Strategy · firm</div>
              <div>Score</div>
              <div className="right">{periodShort}</div>
              <div className="right">Sharpe</div>
              <div className="right">Upside</div>
              <div className="right">Downside</div>
              <div className="right" style={{ paddingRight: 16 }}>Max DD</div>
            </div>

            {ranked.map((r, i) => (
              <div
                key={r.name}
                className={`tbl-row ${i % 2 ? 'tbl-row--alt' : 'tbl-row--plain'}`}
                style={{ display: 'grid', gridTemplateColumns: GRID }}
              >
                <div className="num" style={{ padding: '0 0 0 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--gold-ink)' }}>
                  {rank2(i)}
                </div>
                <div className="stack" style={{ padding: '12px 10px', gap: 2, minWidth: 0 }}>
                  <span className="truncate" style={{ fontWeight: 700 }}>{r.name}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.firm}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Meter value={((r.score - 55) / 45) * 100} style={{ flex: 1 }} />
                  <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{r.score.toFixed(1)}</span>
                </div>
                <div className="right num">{pct(r.ret)}</div>
                <div className="right num">{r.sharpe.toFixed(2)}</div>
                <div className="right num">{r.upside}%</div>
                <div className="right num" style={{ fontWeight: 700, color: r.downside > 95 ? 'var(--neg)' : 'var(--ink)' }}>
                  {r.downside}%
                </div>
                <div className="right num" style={{ paddingRight: 16, color: 'var(--neg)' }}>{pct(r.maxDD)}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ padding: '13px var(--gutter)', background: 'var(--panel)', display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap' }}
        >
          <span>
            Note: capture ratios against the S&amp;P BSE 500 TRI; excludes strategies with under 36 months of audited
            history.
          </span>
          <span>8 of 47 shown · {lens} lens</span>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label={isCustom ? 'Your weighting' : 'What the lens does'} style={{ gap: 10 }}>
          <p className="card__body">{blurb}</p>
        </RailBlock>

        <RailBlock label="Biggest moves on this lens">
          {movers.length === 0 && (
            <div className="row" style={{ justifyContent: 'space-between', gap: 10, fontSize: 14 }}>
              <span>No change on this lens</span>
              <span className="delta delta--flat">Balanced order</span>
            </div>
          )}
          {movers.map((m) => (
            <div key={m.name} className="row" style={{ justifyContent: 'space-between', gap: 10, fontSize: 14 }}>
              <span className="truncate">{m.name}</span>
              <span className={`delta delta--${m.delta > 0 ? 'up' : 'down'}`}>
                {m.delta > 0 ? '↑ ' : '↓ '}
                {Math.abs(m.delta)} {Math.abs(m.delta) === 1 ? 'place' : 'places'}
              </span>
            </div>
          ))}
        </RailBlock>

        <RailBlock label="Selected for comparison" style={{ gap: 10 }}>
          {basket.map((b) => (
            <div key={b} className="basket-row">
              <span className="truncate">{b}</span>
              <button type="button" className="basket-row__drop" aria-label={`Remove ${b}`} onClick={() => dropFromBasket(b)}>
                ×
              </button>
            </div>
          ))}
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
