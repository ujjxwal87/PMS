// Starting points for the fee calculator, not facts about anyone.
//
// NEITHER SEBI NOR APMI PUBLISHES WHAT A PORTFOLIO MANAGER CHARGES. These are
// the three structures the industry commonly offers, at rates within the usual
// range, so the calculator opens with something recognisable. Every number is
// editable, because the only fee that matters is the one in your own agreement.
export const FEE_DEFAULTS = [
  { id: 'flat', name: 'Flat fee', fixed: 2.5, share: 0, hurdle: 0 },
  { id: 'hybrid', name: 'Hybrid', fixed: 1.5, share: 10, hurdle: 10 },
  { id: 'profit', name: 'Profit-only', fixed: 0, share: 20, hurdle: 8 },
]

// GST on investment-management fees. Statutory, not an estimate.
export const GST_PCT = 18

export const FEE_RETURNS = [6, 12, 18, 24]
