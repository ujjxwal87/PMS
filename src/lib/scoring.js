import { LENSES, RETURNS, STRATEGIES } from '../data/strategies.js'
import { norm } from './format.js'

// Composite score: the four weighted metrics, re-based onto a 55-100 band so the
// bar chart reads as a ranking rather than an absolute quality measure.
export function scoreUniverse(lensName, period) {
  const weights = LENSES[lensName].weights
  const rets = RETURNS[period]
  const lo = Math.min(...rets)
  const hi = Math.max(...rets)

  return STRATEGIES.map((s, i) => {
    const ret = rets[i]
    const raw =
      (weights[0] / 100) * norm(ret, lo, hi) +
      (weights[1] / 100) * norm(s.sharpe, 0.9, 1.5) +
      (weights[2] / 100) * norm(s.upside, 85, 135) +
      (weights[3] / 100) * (1 - norm(s.downside, 60, 125))

    return { ...s, ret, score: 55 + raw * 100 * 0.42 }
  }).sort((a, b) => b.score - a.score)
}

// How far each strategy moved against the Balanced ordering.
export function lensMovers(lensName, period) {
  const ranked = scoreUniverse(lensName, period)
  const basePos = {}
  scoreUniverse('Balanced', period).forEach((s, i) => {
    basePos[s.name] = i
  })

  return ranked
    .map((s, i) => ({ name: s.name, delta: basePos[s.name] - i }))
    .filter((m) => m.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)
}
