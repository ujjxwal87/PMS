// Sample universe. Everything here is illustrative demo data, not real PMS performance.

export const PERIODS = ['1M', '1Y', '3Y', '5Y']

export const PERIOD_LABEL = {
  '1M': '1-month return',
  '1Y': '1-year return',
  '3Y': '3-year CAGR',
  '5Y': '5-year CAGR',
}

export const STRATEGIES = [
  { name: 'Vireo Quality Compounders', firm: 'Vireo Capital', cagr: 20.9, sharpe: 1.42, upside: 104, downside: 71, maxDD: -13.8, aum: 4780, holdings: 26 },
  { name: 'Northwick Emerging Leaders', firm: 'Northwick Capital', cagr: 24.6, sharpe: 1.38, upside: 118, downside: 84, maxDD: -18.4, aum: 12410, holdings: 18 },
  { name: 'Sevenhill Focused 18', firm: 'Sevenhill Advisors', cagr: 22.4, sharpe: 1.31, upside: 109, downside: 79, maxDD: -16.2, aum: 6240, holdings: 18 },
  { name: 'Rukmini Dividend Yield', firm: 'Rukmini Capital', cagr: 18.4, sharpe: 1.21, upside: 92, downside: 63, maxDD: -15.1, aum: 2280, holdings: 31 },
  { name: 'Marlowe India Flagship', firm: 'Marlowe Asset Mgmt', cagr: 23.1, sharpe: 1.24, upside: 124, downside: 96, maxDD: -21.0, aum: 9860, holdings: 22 },
  { name: 'Bhatia Long Horizon', firm: 'Bhatia & Co', cagr: 20.2, sharpe: 1.17, upside: 101, downside: 86, maxDD: -19.9, aum: 3940, holdings: 24 },
  { name: 'Karanth Mid-Cap Alpha', firm: 'Karanth Investments', cagr: 21.8, sharpe: 1.09, upside: 127, downside: 108, maxDD: -24.6, aum: 5120, holdings: 29 },
  { name: 'Aldern Small-Cap Select', firm: 'Aldern Partners', cagr: 19.7, sharpe: 0.98, upside: 131, downside: 119, maxDD: -28.3, aum: 2610, holdings: 33 },
]

// Returns per period, index-aligned with STRATEGIES.
export const RETURNS = {
  '1M': [2.1, 3.4, 1.6, 0.9, 4.2, 1.8, 5.1, 6.3],
  '1Y': [14.2, 21.6, 17.8, 11.4, 24.9, 13.7, 26.4, 29.8],
  '3Y': [18.6, 23.1, 20.4, 15.9, 21.8, 18.1, 19.7, 17.2],
  '5Y': [20.9, 24.6, 22.4, 18.4, 23.1, 20.2, 21.8, 19.7],
}

// Composite lenses: weights are [return, sharpe, upside capture, downside capture].
export const LENSES = {
  Balanced: {
    weights: [30, 25, 20, 25],
    blurb: 'Equal footing: return and risk-adjusted return carry 55% between them, with capture ratios making up the rest. The default for a first pass.',
  },
  'Downside-first': {
    weights: [15, 25, 10, 50],
    blurb: 'Half the weight sits on downside capture. Books that sized down in falling quarters rise; high-beta compounders fall several places.',
  },
  Growth: {
    weights: [50, 15, 25, 10],
    blurb: 'Return and upside capture dominate. Use it when the holding period is long enough to sit through a 25% drawdown without selling.',
  },
}

export const SCREEN_CHIPS = ['Multi-cap', 'Mid-cap', 'Min ≤ ₹50 L', 'Low drawdown', 'CIO tenure ≥ 5 yr']

export const DISCOVER_NOTES = [
  '18 holdings, top five 41%',
  'reopened Aug 2026',
  'closes to new money in Nov',
  'lowest drawdown of the ten',
  'highest turnover in the screen',
  'fee step-up above 10%',
]

export const COMPARE_SET = [
  'Northwick Emerging Leaders',
  'Vireo Quality Compounders',
  'Sevenhill Focused 18',
]
