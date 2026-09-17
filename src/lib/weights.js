// Weight sets always total 100. When one slider moves, the others absorb the
// difference in proportion to where they already sit, so the user only ever thinks
// about the metric they are dragging. Length-agnostic: the live leaderboard runs
// three metrics, but nothing here assumes that.

export const CUSTOM_LENS = 'Custom'

export const WEIGHT_TOTAL = 100

export function redistribute(weights, index, next) {
  const value = Math.max(0, Math.min(WEIGHT_TOTAL, Math.round(next)))
  const others = weights.filter((_, i) => i !== index)
  const othersTotal = others.reduce((a, b) => a + b, 0)
  const remaining = WEIGHT_TOTAL - value

  const raw = weights.map((w, i) => {
    if (i === index) return value
    // All the others are at zero: split what is left evenly rather than dividing by zero.
    if (othersTotal === 0) return remaining / others.length
    return (w * remaining) / othersTotal
  })

  const out = raw.map(Math.round)

  // Rounding can leave the total a point or two off; settle it on the largest
  // weight that the user is not currently dragging.
  const drift = WEIGHT_TOTAL - out.reduce((a, b) => a + b, 0)
  if (drift !== 0) {
    let target = -1
    out.forEach((w, i) => {
      if (i !== index && (target === -1 || w > out[target])) target = i
    })
    if (target !== -1) out[target] = Math.max(0, out[target] + drift)
  }

  return out
}

// Plain-English description of a custom weighting, for the rail.
export function describeWeights(weights, labels) {
  const ranked = weights
    .map((w, i) => ({ w, label: labels[i] }))
    .sort((a, b) => b.w - a.w)
  const [top, second] = ranked
  const ignored = ranked.filter((r) => r.w === 0).map((r) => r.label)

  if (top.w === 0) return 'Every weight is at zero — the ranking is arbitrary until you raise one.'
  if (weights.every((w) => w === weights[0])) {
    return `Evenly weighted — each of the ${weights.length} metrics carries ${weights[0]}% of the score.`
  }

  const lead =
    top.w >= 60
      ? `${top.label} takes ${top.w}% of the score on its own, so the order reads close to a straight ranking on it.`
      : `${top.label} leads at ${top.w}%, with ${second.label} next at ${second.w}%.`

  const caveat = ignored.length
    ? ` ${list(ignored)} ${ignored.length > 1 ? 'count' : 'counts'} for nothing at all.`
    : ' Every metric still counts for something.'

  return lead + caveat
}

// "a", "a and b", "a, b and c"
function list(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
