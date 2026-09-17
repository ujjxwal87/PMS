// Growth of ₹100 from the monthly returns a manager actually filed.
//
// This replaces the synthetic random walk in series.js for live strategies.
// Nothing is modelled: each point is the previous one compounded by that
// month's filed return, so the end of the line and the CAGR in the table come
// from the same numbers and cannot disagree.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Months of history each period wants. 1M is absent on purpose: a single
// monthly observation is one number, not a path, and drawing it as a line
// would imply detail the filings do not carry.
export const WINDOW_MONTHS = { '1Y': 12, '3Y': 36, '5Y': 60 }

const label = (iso) => {
  const d = new Date(`${iso}T00:00:00`)
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

/**
 * @param rows  ascending [{ asOn, ret }] from loadSeries()
 * @param period one of WINDOW_MONTHS
 * @returns {{points, labels, endStrategy, months, from, to}} or null when the
 *          window has too little history to draw honestly.
 */
export function growthFromMonthly(rows, period) {
  const want = WINDOW_MONTHS[period]
  if (!want || !rows?.length) return null

  const usable = rows.filter((r) => r.ret !== null && Number.isFinite(r.ret))
  const window = usable.slice(-want)
  // Two points is a line between two numbers, not a track record.
  if (window.length < 3) return null

  // The opening ₹100 sits one month before the first return, so the first
  // filed month is a move rather than a flat start.
  const points = [{ i: 0, strategy: 100, benchmark: null }]
  const labels = ['Start']

  let nav = 100
  window.forEach((r, i) => {
    nav *= 1 + r.ret / 100
    points.push({ i: i + 1, strategy: nav, benchmark: null })
    labels.push(label(r.asOn))
  })

  return {
    points,
    labels,
    endStrategy: nav,
    endBenchmark: null,
    months: window.length,
    from: window[0].asOn,
    to: window[window.length - 1].asOn,
    // True when the window is shorter than asked for — the caller must say so
    // rather than labelling 19 months as a five-year chart.
    short: window.length < want,
  }
}
