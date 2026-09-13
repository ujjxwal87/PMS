// Editorial, firm, event and account sample data.

export const FIRMS = [
  {
    name: 'Northwick Capital', rank: '#1', meta: 'Mumbai · SEBI PMS since 2014 · 4 strategies',
    blurb: 'One process across all four books. Lowest strategy dispersion of any firm on this page — 3.1 points between best and worst.',
    aum: '₹12,410 cr', sharpe: '1.38', tenure: '11 yr', funds: '4 funds',
  },
  {
    name: 'Vireo Capital', rank: '#2', meta: 'Bengaluru · SEBI PMS since 2016 · 3 strategies',
    blurb: 'Quality-biased and unhurried. Turnover under 20% a year, and the only firm here whose downside capture is below 75% across every book.',
    aum: '₹4,780 cr', sharpe: '1.42', tenure: '9 yr', funds: '3 funds',
  },
  {
    name: 'Sevenhill Advisors', rank: '#3', meta: 'Mumbai · SEBI PMS since 2012 · 5 strategies',
    blurb: 'Concentrated, high-conviction, and honest about it. Two of five books are closed; the flagship closes to new money in November.',
    aum: '₹6,240 cr', sharpe: '1.31', tenure: '13 yr', funds: '5 funds',
  },
  {
    name: 'Marlowe Asset Mgmt', rank: '#4', meta: 'Delhi · SEBI PMS since 2011 · 6 strategies',
    blurb: 'Widest strategy range on the platform and the widest dispersion with it — 9.4 points between the best and worst book over five years.',
    aum: '₹9,860 cr', sharpe: '1.24', tenure: '6 yr', funds: '6 funds',
  },
]

export const CIO_MOVES = [
  { title: 'Aldern Partners · new CIO from Sep 2026', meta: 'Internal promotion; 4-yr deputy' },
  { title: 'Karanth Investments · co-CIO added', meta: 'Hired from a listed AMC' },
  { title: 'Rukmini Capital · founder steps back', meta: 'Remains on investment committee' },
]

export const NEWS = [
  { title: 'Marlowe PMS reopens flagship after 14 months', meta: '11 Sep · 3 min' },
  { title: 'SEBI tightens PMS performance disclosure', meta: '9 Sep · 5 min' },
  { title: 'Two CIO exits in the small-cap bucket', meta: '4 Sep · 2 min' },
  { title: 'Fee structures converge on 1.5% + 10%', meta: '1 Sep · 4 min' },
]

export const ARCHIVE = [
  { date: '11 Sep', title: 'What downside capture tells you that drawdown does not', kind: 'Method note', pages: '12 pages' },
  { date: '28 Aug', title: 'Anaya Rao on running an 18-name book', kind: 'Manager interview', pages: '9 pages' },
  { date: '14 Aug', title: 'The fee step-up nobody prices: performance shares at ₹1 cr minimums', kind: 'Method note', pages: '7 pages' },
  { date: '31 Jul', title: 'SEBI’s disclosure circular, read line by line', kind: 'Regulation', pages: '11 pages' },
  { date: '17 Jul', title: 'Dispersion within firms is wider than dispersion between them', kind: 'Method note', pages: '14 pages' },
  { date: '3 Jul', title: 'Five small-cap books that closed, and what happened next', kind: 'Method note', pages: '10 pages' },
]

export const ARCHIVE_FILTERS = ['All', 'Manager interviews', 'Method notes', 'Regulation']

export const MOST_READ = [
  { n: '01', title: 'Dispersion within firms is wider than between them' },
  { n: '02', title: 'The fee step-up nobody prices' },
  { n: '03', title: 'Anaya Rao on running an 18-name book' },
]

export const EVENTS = [
  { day: '17', month: 'Sep', title: 'Anaya Rao on concentrated books', meta: 'Manager session · 6:30 pm · 412 registered', tag: 'Registered', registered: true },
  { day: '24', month: 'Sep', title: 'Reading a PMS disclosure document', meta: 'Method clinic · 5:00 pm · seats open', tag: 'Reserve', registered: false },
  { day: '30', month: 'Sep', title: 'Capture ratios, step by step', meta: 'Method clinic · 6:00 pm · waitlist', tag: 'Waitlisted', registered: false },
  { day: '09', month: 'Oct', title: 'Quarterly universe review · Q3 2026', meta: 'Research desk · 6:30 pm', tag: 'Reserve', registered: false },
  { day: '22', month: 'Oct', title: 'Sevenhill on closing a fund deliberately', meta: 'Manager session · 6:30 pm', tag: 'Reserve', registered: false },
]

export const REPLAYS = [
  { title: 'Vireo Capital on turnover discipline', meta: '28 Aug · 46 min · subscribers' },
  { title: 'How we score composite rankings', meta: '14 Aug · 38 min · open' },
  { title: 'Marlowe on reopening the flagship', meta: '31 Jul · 51 min · subscribers' },
  { title: 'Small-cap closures, one year on', meta: '17 Jul · 42 min · subscribers' },
]

export const GUIDES = [
  { n: '01', title: 'What a PMS actually is', body: 'Discretionary, non-discretionary and advisory mandates — who holds the demat account, and who decides.', mins: '8 min' },
  { n: '02', title: 'Reading a disclosure document', body: 'The five pages that matter: fees, related-party dealing, past penalties, and the performance methodology.', mins: '12 min' },
  { n: '03', title: 'How fees are really charged', body: 'Fixed, hybrid and profit-only, with the hurdle, catch-up and high-water mark worked through on ₹1 cr.', mins: '10 min' },
  { n: '04', title: 'Capture ratios and drawdown', body: 'Why two books with the same return can behave nothing alike in a falling quarter.', mins: '9 min' },
  { n: '05', title: 'Taxation of a PMS account', body: 'Capital gains flow to you, not to a fund. What that means at the end of a churn-heavy year.', mins: '11 min' },
  { n: '06', title: 'Accreditation and minimums', body: 'The ₹50 lakh statutory minimum, and where accredited-investor status changes what you can access.', mins: '6 min' },
]

export const GLOSSARY = [
  { term: 'Upside capture', body: 'Share of the benchmark’s gain the strategy captured in rising quarters. Above 100% means it outran the index on the way up.' },
  { term: 'Downside capture', body: 'Share of the benchmark’s fall the strategy took in falling quarters. Lower is better; under 80% is rare.' },
  { term: 'High-water mark', body: 'The peak value the performance fee has already been charged on. No fee until the account exceeds it again.' },
  { term: 'Catch-up', body: 'A clause letting the manager take a larger share once the hurdle is cleared. Read it before the headline rate.' },
]

export const PLANS = [
  {
    name: 'Investor', price: '₹24,000', per: 'a year', who: 'One HNI investor, one login',
    cta: 'Start free for 14 days',
    feats: ['Every note since 2021', 'Screener exports as CSV', 'Composite leaderboard, all lenses', 'Analyst call, twice a quarter'],
  },
  {
    name: 'Advisor', price: '₹1,80,000', per: 'a year, five seats', who: 'RIAs and distributors',
    cta: 'Talk to sales',
    feats: ['Everything in Investor', 'Client-ready comparison PDFs', 'White-labelled fee workings', 'Shared watchlists across seats'],
  },
  {
    name: 'Asset manager', price: 'On request', per: 'listing', who: 'AMCs listing strategies',
    cta: 'Request a listing',
    feats: ['Verified strategy listing', 'Monthly data upload window', 'Webinar and summit slots', 'Enquiry routing to your desk'],
  },
]

// Investor account (demo)
export const HOLDINGS = [
  { name: 'Northwick Emerging Leaders', firm: 'Northwick Capital', invested: 6240000, value: 8115000, xirr: 18.4, since: 'Mar 2024' },
  { name: 'Vireo Quality Compounders', firm: 'Vireo Capital', invested: 5000000, value: 6090000, xirr: 14.1, since: 'Aug 2024' },
  { name: 'Rukmini Dividend Yield', firm: 'Rukmini Capital', invested: 2500000, value: 2795000, xirr: 9.2, since: 'Jan 2026' },
]

export const STATEMENTS = [
  { title: 'Consolidated statement · Aug 2026', meta: 'PDF · issued 3 Sep' },
  { title: 'Capital gains report · FY 2025-26', meta: 'PDF · issued 12 Apr' },
  { title: 'Fee workings · Q1 FY27', meta: 'XLSX · issued 3 Jul' },
]

// Onboarding
export const STEPS = ['Choose the strategy', 'Investor details', 'Funding', 'Review & sign']

// Fees
export const FEE_MODELS = [
  { name: 'Flat fee', detail: '2.50% of assets, no performance share', fixed: 2.5, share: 0, hurdle: 0 },
  { name: 'Hybrid', detail: '1.50% + 10% of gains over a 10% hurdle', fixed: 1.5, share: 10, hurdle: 10 },
  { name: 'Profit-only', detail: 'No fixed fee, 20% of gains over an 8% hurdle', fixed: 0, share: 20, hurdle: 8 },
]

export const FEE_AMOUNTS = [
  { label: '₹50 L', value: 5000000 },
  { label: '₹1 cr', value: 10000000 },
  { label: '₹5 cr', value: 50000000 },
]

export const FEE_RETURNS = [6, 12, 18, 24]

// Manager profile (Northwick / Anaya Rao)
export const MANAGER = {
  firm: 'Northwick Capital',
  meta: 'Northwick Capital · Mumbai · SEBI PMS since 2014',
  name: 'Anaya Rao',
  role: 'Chief Investment Officer, 11 years in the seat · 4 strategies · ₹12,410 cr under management',
  stats: [
    { label: 'AW Sharpe', value: '1.38' },
    { label: 'Dispersion', value: '3.1 pts' },
    { label: 'SEBI actions', value: 'None' },
  ],
  approach:
    'One process across all four books: businesses that can fund their own growth, bought when the market is bored of them, held until the thesis breaks rather than until the price is right. Eighteen holdings in the flagship, top five at 41%, and turnover under 25% a year.',
  quote: '“If I cannot explain why a position is in the book in two sentences, it should not be in the book.”',
  funds: [
    { name: 'Emerging Leaders', cat: 'Mid & small cap', aum: '₹6,420 cr', ret: '24.6%', since: '2014', status: 'Open' },
    { name: 'Core Equity', cat: 'Multi-cap', aum: '₹3,880 cr', ret: '19.8%', since: '2016', status: 'Open' },
    { name: 'Focused 12', cat: 'Concentrated', aum: '₹1,640 cr', ret: '22.1%', since: '2019', status: 'Closed' },
    { name: 'Dividend Compounders', cat: 'Income', aum: '₹470 cr', ret: '16.4%', since: '2022', status: 'Open' },
  ],
  team: [
    { name: 'Anaya Rao · CIO', meta: '11 yr at Northwick · 19 yr in markets' },
    { name: 'Devan Iyer · Head of research', meta: '7 yr · 4 analysts reporting' },
    { name: 'Shalini Bose · Risk', meta: '5 yr · independent of the desk' },
  ],
  appearances: [
    { title: 'Anaya Rao on running an 18-name book', meta: 'Interview · 28 Aug · 9 pages' },
    { title: 'Live: holding concentrated books through a drawdown', meta: 'Thu 17 Sep · 6:30 pm' },
  ],
}

export const USER = { name: 'Priya S.', role: 'Investor', email: 'priya.s@example.in' }

export const ISSUE = {
  dateLine: 'Sunday, 13 September 2026',
  issue: 'Issue 214',
  tracked: '312 strategies tracked',
  asAt: 'data as at 31 Aug 2026',
}
