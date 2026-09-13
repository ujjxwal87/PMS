import { createContext, useContext, useMemo, useState } from 'react'
import { COMPARE_SET, LENSES } from './data/strategies.js'
import { redistribute } from './lib/weights.js'

const AppContext = createContext(null)

// The compare table is laid out for three columns.
export const MAX_COMPARE = 3

export function AppProvider({ children }) {
  const [period, setPeriod] = useState('5Y')
  const [lens, setLens] = useState('Balanced')
  const [chips, setChips] = useState(['Multi-cap', 'Min ≤ ₹50 L'])
  const [basket, setBasket] = useState(COMPARE_SET)
  const [pick, setPick] = useState('Northwick Emerging Leaders')
  const [plan, setPlan] = useState('Investor')
  // Which minimum-ticket band to show; 'any' shows everything.
  const [band, setBand] = useState('any')
  // The Custom lens starts from Balanced so the first drag has somewhere to move from.
  const [customWeights, setCustomWeights] = useState(LENSES.Balanced.weights)

  const value = useMemo(
    () => ({
      period, setPeriod,
      lens, setLens,
      chips,
      toggleChip: (c) =>
        setChips((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : cur.concat(c))),
      basket,
      basketFull: basket.length >= MAX_COMPARE,
      dropFromBasket: (name) => setBasket((cur) => cur.filter((b) => b !== name)),
      // Adds until the comparison is full; the picker hides when there is no room.
      addToBasket: (name) =>
        setBasket((cur) =>
          cur.includes(name) || cur.length >= MAX_COMPARE ? cur : cur.concat(name),
        ),
      pick, setPick,
      plan, setPlan,
      band, setBand,
      customWeights,
      setCustomWeight: (index, value) =>
        setCustomWeights((cur) => redistribute(cur, index, value)),
      resetCustomWeights: () => setCustomWeights(LENSES.Balanced.weights),
    }),
    [period, lens, chips, basket, pick, plan, customWeights, band],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
