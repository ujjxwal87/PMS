// Per-strategy facts that only the detail page needs, plus who runs each book.

export const MANAGERS = {
  'Northwick Capital': {
    name: 'Anaya Rao',
    role: 'Chief Investment Officer · 11 years in the seat',
    note: 'Buys businesses that can fund their own growth, when the market is bored of them, and holds until the thesis breaks rather than until the price is right.',
  },
  'Vireo Capital': {
    name: 'Kabir Menon',
    role: 'Chief Investment Officer · 9 years in the seat',
    note: 'Quality first and unhurried with it: turnover under 20% a year, and a written rule that a position is cut on the business, never on the price.',
  },
  'Sevenhill Advisors': {
    name: 'Ira Deshpande',
    role: 'Chief Investment Officer · 13 years in the seat',
    note: 'Eighteen names, no more, and closes the book rather than dilute it. Has shut two of the firm’s five strategies to new money.',
  },
  'Rukmini Capital': {
    name: 'Meera Iyer',
    role: 'Chief Investment Officer · 7 years in the seat',
    note: 'Runs for cash yield and balance-sheet safety. The book has never held a business with net debt above twice operating profit.',
  },
  'Marlowe Asset Mgmt': {
    name: 'Rohan Barua',
    role: 'Chief Investment Officer · 6 years in the seat',
    note: 'The widest mandate on the platform, and candid that the range costs consistency — dispersion across the firm’s books is 9.4 points.',
  },
  'Bhatia & Co': {
    name: 'Nikhil Bhatia',
    role: 'Founder and CIO · 16 years in the seat',
    note: 'A ten-year holding period stated in the mandate, not just the pitch. Sells only on thesis failure or a mandate breach.',
  },
  'Karanth Investments': {
    name: 'Sanjana Karanth',
    role: 'Co-Chief Investment Officer · 4 years in the seat',
    note: 'Mid-cap specialist hired from a listed AMC, running the highest turnover of any book here and open about why.',
  },
  'Aldern Partners': {
    name: 'Farhan Qureshi',
    role: 'Chief Investment Officer · from September 2026',
    note: 'Promoted from four years as deputy. Inherits the most volatile book on the platform and has said the risk budget will not change.',
  },
}

export const DETAILS = {
  'Vireo Quality Compounders': {
    category: 'Multi-cap · quality',
    inception: 'April 2017',
    turnover: '18% a year',
    exitLoad: '1% before 12 months',
    fee: '1.5% + 10% over a 10% hurdle',
    status: 'Open',
    objective:
      'Owns cash-generative businesses at unexciting prices and sits still. The lowest downside capture in the universe, bought at the cost of a few points of return in strong years.',
  },
  'Northwick Emerging Leaders': {
    category: 'Mid & small cap',
    inception: 'January 2014',
    turnover: '24% a year',
    exitLoad: '1% before 12 months',
    fee: '1.5% + 10% over a 10% hurdle',
    status: 'Open',
    objective:
      'Eighteen mid-cap businesses the manager expects to be large-cap within a decade. Concentrated by design — the top five are about 41% of the book.',
  },
  'Sevenhill Focused 18': {
    category: 'Concentrated multi-cap',
    inception: 'June 2015',
    turnover: '21% a year',
    exitLoad: '1.5% before 18 months',
    fee: '1.5% + 12.5% over a 10% hurdle',
    status: 'Closes in November',
    objective:
      'A deliberately capped book of eighteen names. The firm closes strategies rather than let size dictate what it can own.',
  },
  'Rukmini Dividend Yield': {
    category: 'Income · large cap',
    inception: 'March 2019',
    turnover: '14% a year',
    exitLoad: '1% before 12 months',
    fee: '2.0% flat, no performance share',
    status: 'Open',
    objective:
      'Dividend payers with conservative balance sheets. The quietest book on the platform: the smallest drawdown outside Vireo, and the lowest upside capture with it.',
  },
  'Marlowe India Flagship': {
    category: 'Multi-cap · go-anywhere',
    inception: 'November 2011',
    turnover: '37% a year',
    exitLoad: '2% before 12 months',
    fee: '1.25% + 15% over a 12% hurdle',
    status: 'Reopened August 2026',
    objective:
      'The firm’s oldest book and its widest mandate. Reopened after fourteen months closed, with the manager explicit that capacity, not conviction, drove the closure.',
  },
  'Bhatia Long Horizon': {
    category: 'Multi-cap · long hold',
    inception: 'August 2013',
    turnover: '9% a year',
    exitLoad: '2% before 24 months',
    fee: '1.75% flat, no performance share',
    status: 'Open',
    objective:
      'A ten-year holding period written into the mandate. The lowest turnover here by a distance, and an exit load that says so.',
  },
  'Karanth Mid-Cap Alpha': {
    category: 'Mid cap · high turnover',
    inception: 'February 2018',
    turnover: '52% a year',
    exitLoad: '1% before 12 months',
    fee: '1.5% + 15% over a 10% hurdle',
    status: 'Open',
    objective:
      'Trades around positions far more than its peers. Captures 127% of the market’s rise and 108% of its fall — a book for investors who will not sell in a bad quarter.',
  },
  'Aldern Small-Cap Select': {
    category: 'Small cap',
    inception: 'July 2016',
    turnover: '44% a year',
    exitLoad: '2% before 18 months',
    fee: '1.5% + 15% over a 10% hurdle',
    status: 'Open',
    objective:
      'The most aggressive book on the platform: the highest upside capture, the highest downside capture, and a 28% worst drawdown. New CIO from September 2026.',
  },
}

export const detailFor = (name) => DETAILS[name] || {}
