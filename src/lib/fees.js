import { GST_PCT } from '../data/fee-defaults.js'

/**
 * Price each fee structure for one year on one account.
 *
 * Convention, which agreements genuinely differ on: the performance share is
 * charged on the gross gain above the hurdle, and the fixed fee is charged
 * separately on assets. Some agreements instead compute the share on the gain
 * NET of the fixed fee, which is slightly cheaper for the investor — pass
 * `shareOnNet` to price it that way. The page says which convention is in use
 * rather than leaving it implicit.
 */
export function priceFeeModels(models, amount, grossPct, { gst = true, shareOnNet = false } = {}) {
  const grossGain = (amount * grossPct) / 100

  return models.map((m) => {
    const fixed = (amount * m.fixed) / 100
    const base = shareOnNet ? grossGain - fixed : grossGain
    const overHurdle = Math.max(0, base - (amount * m.hurdle) / 100)
    const performance = (overHurdle * m.share) / 100
    const beforeTax = fixed + performance
    const tax = gst ? (beforeTax * GST_PCT) / 100 : 0
    const total = beforeTax + tax

    return {
      model: m,
      fixed,
      performance,
      tax,
      total,
      net: grossGain - total,
      // Cost as a share of the whole account, which is how it is felt, rather
      // than as a share of the gain.
      effective: amount > 0 ? (total / amount) * 100 : 0,
    }
  })
}

export const cheapestOf = (rows) => rows.reduce((a, b) => (b.total < a.total ? b : a))

/** The gross return at which the ranking changes, to the nearest 0.5 point. */
export function crossoverPoint(models, amount, opts, lo = 0, hi = 40) {
  const winnerAt = (g) => cheapestOf(priceFeeModels(models, amount, g, opts)).model.id
  const start = winnerAt(lo)
  for (let g = lo; g <= hi; g += 0.5) {
    if (winnerAt(g) !== start) return { at: g, from: start, to: winnerAt(g) }
  }
  return null
}
