// Bands over a strategy's book size, in INR crore. Each band is (lo, hi] so they
// tile the range without overlapping. Replaces the old minimum-ticket bands:
// neither APMI nor SEBI publishes a minimum investment, so that filter could not
// survive the move to real data.

export const AUM_BANDS = [
  { id: 'any', label: 'Any', lo: -1, hi: Infinity },
  { id: 'small', label: 'Under ₹500 Cr', lo: -1, hi: 500 },
  { id: 'mid', label: '₹500 Cr – ₹2,000 Cr', lo: 500, hi: 2000 },
  { id: 'large', label: '₹2,000 Cr +', lo: 2000, hi: Infinity },
]

export const bandFor = (id) => AUM_BANDS.find((b) => b.id === id) || AUM_BANDS[0]

// An approach with no filed AUM sits outside every band but "Any" — it cannot be
// placed, and guessing which band it belongs in would be inventing the number.
export const inBand = (strategy, id) => {
  const b = bandFor(id)
  if (b.id === 'any') return true
  return strategy.aum !== null && strategy.aum > b.lo && strategy.aum <= b.hi
}
