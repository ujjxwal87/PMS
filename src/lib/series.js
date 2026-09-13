import { RETURNS } from '../data/strategies.js'
import { rng, seedFrom } from './seed.js'

// Growth of ₹100 over the selected window, for the strategy and the benchmark.
// The path wanders, but it is scaled to land exactly on the return the tables
// quote — the chart and the leaderboard can never disagree.

const SHAPE = {
  '1M': { steps: 22, years: 1 / 12, tick: 'day' },
  '1Y': { steps: 12, years: 1, tick: 'month' },
  '3Y': { steps: 36, years: 3, tick: 'month' },
  '5Y': { steps: 60, years: 5, tick: 'month' },
}

// The benchmark's own record, in the same terms as RETURNS.
const BENCHMARK_RETURN = { '1M': 1.2, '1Y': 11.4, '3Y': 13.1, '5Y': 14.2 }

// A 1M figure is the month's return; the longer windows are annualised.
const totalGrowth = (pct, period) =>
  period === '1M' || period === '1Y' ? 1 + pct / 100 : Math.pow(1 + pct / 100, SHAPE[period].years)

function walk(steps, volatility, random) {
  const path = [0]
  for (let i = 1; i <= steps; i += 1) {
    // Box-Muller, for a normal step rather than a uniform one.
    const u = Math.max(random(), 1e-9)
    const v = random()
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    path.push(path[i - 1] + z * volatility)
  }
  return path
}

// Scale and tilt the walk so it starts at 100 and ends exactly on target.
// `amplify` stretches the wobble around that trend without moving either end.
function fit(path, target, amplify = 1) {
  const steps = path.length - 1
  const end = path[steps]
  return path.map((v, i) => {
    const detrended = (v - (end * i) / steps) * amplify
    return 100 * Math.exp(detrended + (Math.log(target) * i) / steps)
  })
}

function maxDrawdown(values) {
  let peak = values[0]
  let worst = 0
  values.forEach((v) => {
    peak = Math.max(peak, v)
    worst = Math.min(worst, v / peak - 1)
  })
  return worst * 100
}

// Over a long window the path should bottom out near the drawdown the tables
// quote; a chart that never dips more than 8% under a stated -28% is a lie.
// Drawdown deepens faster than the amplitude that causes it, so solve for the
// amplitude by bisection rather than scaling once and hoping.
function calibrate(walkPath, target, targetDD) {
  if (!targetDD) return fit(walkPath, target)

  let lo = 0.05
  let hi = 4
  let best = fit(walkPath, target)

  for (let n = 0; n < 24; n += 1) {
    const mid = (lo + hi) / 2
    best = fit(walkPath, target, mid)
    const got = maxDrawdown(best)
    if (Math.abs(got - targetDD) < 0.15) break
    // A bigger amplitude digs a deeper hole.
    if (got > targetDD) lo = mid
    else hi = mid
  }

  return best
}

export function growthSeries(strategy, period, index) {
  const { steps } = SHAPE[period]
  const random = rng(seedFrom(`${strategy.name}:${period}`))
  const benchRandom = rng(seedFrom(`benchmark:${period}`))

  // Annual volatility implied by the Sharpe: excess return over risk-free,
  // divided by Sharpe. Then scaled to one step of this window's frequency, so a
  // month of daily marks does not wander like five years of monthly ones.
  const riskFree = 0.06
  const annualVol = Math.max(0.07, (strategy.cagr / 100 - riskFree) / Math.max(strategy.sharpe, 0.4))
  const stepsPerYear = steps / SHAPE[period].years
  const vol = annualVol / Math.sqrt(stepsPerYear)
  const benchVol = 0.13 / Math.sqrt(stepsPerYear)

  const ret = index != null ? RETURNS[period][index] : strategy.cagr
  // Only the long windows are expected to contain the worst drawdown on record.
  const targetDD = period === '3Y' || period === '5Y' ? strategy.maxDD : null
  const stratLine = calibrate(walk(steps, vol, random), totalGrowth(ret, period), targetDD)
  const benchLine = fit(walk(steps, benchVol, benchRandom), totalGrowth(BENCHMARK_RETURN[period], period))

  return {
    points: stratLine.map((value, i) => ({ i, strategy: value, benchmark: benchLine[i] })),
    labels: tickLabels(period, steps),
    strategyReturn: ret,
    benchmarkReturn: BENCHMARK_RETURN[period],
    endStrategy: stratLine[steps],
    endBenchmark: benchLine[steps],
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Windows end at the stated data date, Aug 2026.
function tickLabels(period, steps) {
  if (period === '1M') {
    // 22 trading days spread across the calendar month ending 31 Aug 2026.
    return Array.from({ length: steps + 1 }, (_, i) => `${1 + Math.round((i * 30) / steps)} Aug`)
  }
  const endMonth = 7 // August, zero-indexed
  const endYear = 2026
  return Array.from({ length: steps + 1 }, (_, i) => {
    const back = steps - i
    const m = ((endMonth - back) % 12 + 12) % 12
    const y = endYear + Math.floor((endMonth - back) / 12)
    return `${MONTHS[m]} ${String(y).slice(2)}`
  })
}

export { BENCHMARK_RETURN }
