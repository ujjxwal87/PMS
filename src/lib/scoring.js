import { norm } from './format.js'

// Composite scoring over the REAL universe.
//
// Three metrics, not four: return, Sharpe and max drawdown. Upside and downside
// capture were dropped when the data went live — computing them needs a monthly
// benchmark series that is not ingested yet, and a capture ratio cannot be
// honestly faked. Weight arrays are therefore length 3.
export const METRIC_KEYS = ['return', 'sharpe', 'drawdown']

// Each metric is normalised against the universe it is ranked in, not a fixed
// band: real PMS dispersion is far wider than the sample data assumed, and a
// hardcoded 0.9–1.5 Sharpe band would flatten most of the field to 0 or 1.
// The 5th/95th percentiles bound it so a single outlier cannot squash the rest.
function bounds(values) {
  const xs = values.filter((v) => v !== null && Number.isFinite(v)).sort((a, b) => a - b)
  if (xs.length === 0) return [0, 1]
  const at = (p) => xs[Math.min(xs.length - 1, Math.max(0, Math.round(p * (xs.length - 1))))]
  const lo = at(0.05)
  const hi = at(0.95)
  return lo === hi ? [lo, lo + 1] : [lo, hi]
}

/**
 * Ranks `universe` (from loadUniverse) and returns a new sorted array, each row
 * carrying `ret` for the chosen period and a 55–100 `score`.
 *
 * A strategy missing the period's return is ranked last rather than dropped:
 * the caller asked for this universe, and silently shrinking it would make the
 * count in the footer lie.
 */
export function scoreUniverse(universe, weights, period) {
  if (!universe?.length) return []

  const [retLo, retHi] = bounds(universe.map((s) => s.returns?.[period] ?? null))
  const [shLo, shHi] = bounds(universe.map((s) => s.sharpe))
  // Drawdown is negative and less-negative is better, so the scale is inverted
  // below rather than here.
  const [ddLo, ddHi] = bounds(universe.map((s) => s.maxDD))

  const [wRet, wSharpe, wDd] = weights

  return universe
    .map((s) => {
      const ret = s.returns?.[period] ?? null
      const raw =
        (wRet / 100) * (ret === null ? 0 : norm(ret, retLo, retHi)) +
        (wSharpe / 100) * (s.sharpe === null ? 0 : norm(s.sharpe, shLo, shHi)) +
        (wDd / 100) * (s.maxDD === null ? 0 : norm(s.maxDD, ddLo, ddHi))

      return { ...s, ret, score: 55 + raw * 100 * 0.45, scorable: ret !== null }
    })
    .sort((a, b) => {
      if (a.scorable !== b.scorable) return a.scorable ? -1 : 1
      return b.score - a.score
    })
}

// How far each strategy moved against the Balanced ordering.
export function lensMovers(universe, weights, period, baseWeights) {
  const ranked = scoreUniverse(universe, weights, period)
  const basePos = {}
  scoreUniverse(universe, baseWeights, period).forEach((s, i) => {
    basePos[s.id] = i
  })

  return ranked
    .map((s, i) => ({ name: s.name, delta: basePos[s.id] - i }))
    .filter((m) => m.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)
}
