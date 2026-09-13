import { FEE_MODELS } from '../data/content.js'

export function priceFeeModels(amount, grossPct) {
  const grossGain = (amount * grossPct) / 100

  return FEE_MODELS.map((m) => {
    const fixed = (amount * m.fixed) / 100
    const overHurdle = Math.max(0, grossGain - (amount * m.hurdle) / 100)
    const performance = (overHurdle * m.share) / 100
    const total = fixed + performance

    return {
      model: m,
      fixed,
      performance,
      total,
      net: grossGain - total,
      effective: (total / amount) * 100,
    }
  })
}

export const cheapestOf = (rows) => rows.reduce((a, b) => (b.total < a.total ? b : a))
