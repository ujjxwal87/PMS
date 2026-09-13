import { COMPANIES } from '../data/holdings-pool.js'
import { rng, seedFrom } from './seed.js'

// A strategy's book: names drawn from the pool, weights decaying from the top
// position. Concentrated books (fewer names) carry a heavier top five, which is
// what the copy elsewhere on the site claims.

export function bookFor(strategy) {
  const random = rng(seedFrom(strategy.name))
  const pool = COMPANIES.slice()

  // Fisher-Yates, so a name is never drawn twice.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const count = Math.min(strategy.holdings, pool.length)
  const picks = pool.slice(0, count)

  // Tighter books decay faster, so the top names carry more. 0.93 over 18 names
  // puts the top five near 41%, which is what the editorial copy claims of the
  // concentrated books.
  const decay = strategy.holdings <= 20 ? 0.93 : 0.96
  const raw = picks.map((_, i) => Math.pow(decay, i) * (0.85 + random() * 0.3))
  const rawTotal = raw.reduce((a, b) => a + b, 0)

  // Leave a little in cash, as a real book would.
  const cash = 1.5 + random() * 2.5
  const invested = 100 - cash

  const holdings = picks
    .map(([name, sector], i) => ({ name, sector, weight: (raw[i] / rawTotal) * invested }))
    .sort((a, b) => b.weight - a.weight)

  const sectors = {}
  holdings.forEach((h) => {
    sectors[h.sector] = (sectors[h.sector] || 0) + h.weight
  })

  const sectorRows = Object.entries(sectors)
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .concat({ name: 'Cash & equivalents', weight: cash })

  const topFive = holdings.slice(0, 5).reduce((a, h) => a + h.weight, 0)

  return { holdings, sectorRows, cash, topFive }
}
