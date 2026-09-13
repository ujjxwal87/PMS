import { createContext, useContext, useMemo, useState } from 'react'
import { COMPARE_SET } from './data/strategies.js'

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
    }),
    [period, lens, chips, basket, pick, plan],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
