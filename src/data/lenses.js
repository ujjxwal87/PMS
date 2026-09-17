// Weighting lenses for the live leaderboard. Three metrics, in this order:
// [period return, Sharpe, max drawdown]. Capture ratios are gone — see
// src/lib/scoring.js for why.

export const PERIODS = ['1M', '1Y', '3Y', '5Y']

export const PERIOD_LABEL = {
  '1M': '1-month return',
  '1Y': '1-year return',
  '3Y': '3-year CAGR',
  '5Y': '5-year CAGR',
}

export const METRIC_LABELS = ['Sharpe', 'Max drawdown']

export const LENSES = {
  Balanced: {
    weights: [40, 35, 25],
    blurb:
      'Return and risk-adjusted return carry three-quarters between them, with drawdown making up the rest. The default for a first pass.',
  },
  'Downside-first': {
    weights: [20, 30, 50],
    blurb:
      'Half the weight sits on the worst fall from a peak. Books that held up through the 2024 correction rise; high-volatility compounders fall several places.',
  },
  Growth: {
    weights: [60, 25, 15],
    blurb:
      'Return dominates. Use it when the holding period is long enough to sit through a 30% drawdown without selling.',
  },
}
