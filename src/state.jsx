import { createContext, useContext, useMemo, useState } from 'react'
import { LENSES } from './data/lenses.js'
import { redistribute } from './lib/weights.js'

const AppContext = createContext(null)

// The compare table is laid out for three columns.
export const MAX_COMPARE = 3

export function AppProvider({ children }) {
  const [period, setPeriod] = useState('5Y')
  const [lens, setLens] = useState('Balanced')
  // Screener facets are asset classes -- the only facet either source files.
  const [chips, setChips] = useState([])
  // Entries are { id, name, firm } from the live universe. The name rides along
  // so the rail can label a pick without re-querying; the id is what Compare
  // refetches on, since that is the only stable handle across months.
  const [basket, setBasket] = useState([])
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
      dropFromBasket: (id) => setBasket((cur) => cur.filter((b) => b.id !== id)),
      // Adds until the comparison is full; the picker hides when there is no room.
      addToBasket: (s) =>
        setBasket((cur) =>
          cur.some((b) => b.id === s.id) || cur.length >= MAX_COMPARE
            ? cur
            : cur.concat({ id: s.id, name: s.name, firm: s.firm }),
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
