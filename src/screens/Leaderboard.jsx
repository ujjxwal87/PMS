import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, Meter, RailBlock, Segmented } from '../components/ui.jsx'
import StrategyPicker from '../components/StrategyPicker.jsx'
import MetricGuide from '../components/MetricGuide.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { useApp } from '../state.jsx'
import { BUDGETS, LENSES, PERIODS, PERIOD_LABEL, STRATEGIES } from '../data/strategies.js'
import { lensMovers, scoreUniverse } from '../lib/scoring.js'
import { CUSTOM_LENS, describeWeights } from '../lib/weights.js'
import { pct, rank2, shortRupees } from '../lib/format.js'

const GRID = '44px minmax(208px, 1.9fr) 136px 84px 72px 82px 100px 86px 88px'

export default function Leaderboard() {
  const navigate = useNavigate()
  const {
    period, setPeriod, lens, setLens, basket, dropFromBasket,
    customWeights, setCustomWeight, resetCustomWeights,
    budget, setBudget,
  } = useApp()

  const isCustom = lens === CUSTOM_LENS
  const weightLabels = [PERIOD_LABEL[period], 'Sharpe', 'Upside capture', 'Downside capture']
  const weights = isCustom ? customWeights : LENSES[lens].weights
  const blurb = isCustom ? describeWeights(customWeights, weightLabels) : LENSES[lens].blurb

  const scored = scoreUniverse(weights, period)
  // Rank the whole universe, then drop what the reader cannot actually open.
  const ranked = scored.filter((r) => r.minInvestment <= budget)
  const movers = lensMovers(weights, period)
  const budgetOn = budget !== Infinity
  const hidden = scored.length - ranked.length
  const periodShort = period === '1M' ? '1M ret' : period === '1Y' ? '1Y ret' : `${period} CAGR`

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="banner-panel" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div className="stack" style={{ gap: 7, minWidth: 320, maxWidth: '62ch' }}>
            <Eyebrow tone="gold">Composite ranking · 36-month window</Eyebrow>
            <h2 style={{ fontSize: 30, lineHeight: 1.1 }}>A strategy earns its place on four metrics at once</h2>
            <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
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
          className="row wrap"
          style={{ padding: '12px var(--gutter)', gap: '10px 18px', alignItems: 'center', borderBottom: '1px solid var(--line)' }}
        >
          <Eyebrow>I can invest</Eyebrow>
          <Segmented
            items={BUDGETS.map((b) => ({ label: b.label, value: b.value }))}
            value={budget}
            onChange={setBudget}
          />
          <span className="note" style={{ flex: 1, minWidth: 200 }}>
            {budgetOn
              ? `${ranked.length} of ${scored.length} strategies take ${BUDGETS.find((b) => b.value === budget).label} or less${hidden ? ` · ${hidden} hidden` : ''}`
              : 'SEBI sets a ₹50 lakh floor on any PMS account, so nothing here opens for less.'}
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
          <div style={{ minWidth: 900 }}>
            <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: GRID }}>
              <div style={{ paddingLeft: 14 }}>#</div>
              <div style={{ padding: '10px' }}>Strategy · firm</div>
              <div>Score</div>
              <div className="right">{periodShort}</div>
              <div className="right">Sharpe</div>
              <div className="right">Upside</div>
              <div className="right">Downside</div>
              <div className="right">Max DD</div>
              <div className="right" style={{ paddingRight: 16 }}>Minimum</div>
            </div>

            {ranked.length === 0 && (
              <div className="stack" style={{ padding: '32px 16px', gap: 6, alignItems: 'center', textAlign: 'center' }}>
                <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>Nothing opens at that size</span>
                <span className="note">Raise the amount, or read the Learn chapter on minimums.</span>
              </div>
            )}
            {ranked.map((r, i) => (
              <div
                key={r.name}
                className={`tbl-row ${i % 2 ? 'tbl-row--alt' : 'tbl-row--plain'}`}
                style={{ display: 'grid', gridTemplateColumns: GRID }}
              >
                <div className="num" style={{ padding: '0 0 0 14px', fontSize: 13.5, fontWeight: 700, color: 'var(--gold-ink)' }}>
                  {rank2(i)}
                </div>
                <div className="row" style={{ padding: '12px 10px', gap: 10, minWidth: 0 }}>
                  <FirmMark firm={r.firm} size={30} />
                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <span className="truncate" style={{ fontWeight: 700 }}>{r.name}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{r.firm}</span>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Meter value={((r.score - 55) / 45) * 100} style={{ flex: 1 }} />
                  <span className="num" style={{ fontSize: 15, fontWeight: 700 }}>{r.score.toFixed(1)}</span>
                </div>
                <div className="right num">{pct(r.ret)}</div>
                <div className="right num">{r.sharpe.toFixed(2)}</div>
                <div className="right num">{r.upside}%</div>
                <div className="right num" style={{ fontWeight: 700, color: r.downside > 95 ? 'var(--neg)' : 'var(--ink)' }}>
                  {r.downside}%
                </div>
                <div className="right num" style={{ color: 'var(--neg)' }}>{pct(r.maxDD)}</div>
                <div className="right num" style={{ paddingRight: 16 }}>{shortRupees(r.minInvestment)}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{ padding: '13px var(--gutter)', background: 'var(--panel)', display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13.5, color: 'var(--muted)', flexWrap: 'wrap' }}
        >
          <span>
            Note: capture ratios against the S&amp;P BSE 500 TRI; excludes strategies with under 36 months of audited
            history.
          </span>
          <span>
            {ranked.length} of {scored.length} shown · {lens} lens
            {budgetOn && ` · min ≤ ${BUDGETS.find((b) => b.value === budget).label}`}
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
            const min = STRATEGIES.find((s) => s.name === b)?.minInvestment
            const overBudget = min > budget
            return (
              <div key={b} className="basket-row">
                <span className="stack truncate" style={{ gap: 2 }}>
                  <span className="truncate">{b}</span>
                  {overBudget && (
                    <span style={{ fontSize: 12.5, color: 'var(--neg)' }}>
                      Needs {shortRupees(min)}
                    </span>
                  )}
                </span>
                <button type="button" className="basket-row__drop" aria-label={`Remove ${b}`} onClick={() => dropFromBasket(b)}>
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
