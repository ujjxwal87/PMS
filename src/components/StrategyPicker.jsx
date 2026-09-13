import { useEffect, useMemo, useRef, useState } from 'react'
import { STRATEGIES } from '../data/strategies.js'
import { useApp } from '../state.jsx'

// Type a strategy, firm or manager name and add it to the comparison.
// Anything already in the basket drops out of the suggestions.
export default function StrategyPicker({ placeholder = 'Add a strategy or firm…' }) {
  const { basket, addToBasket, basketFull } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const wrapRef = useRef(null)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STRATEGIES.filter((s) => !basket.includes(s.name))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.firm.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query, basket])

  useEffect(() => {
    setCursor(0)
  }, [query])

  // Close when focus or a click lands outside the combobox.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (basketFull) {
    return <span className="note">Comparison is full — remove one to add another.</span>
  }

  const add = (name) => {
    addToBasket(name)
    setQuery('')
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setCursor((c) => {
        const next = e.key === 'ArrowDown' ? c + 1 : c - 1
        return (next + matches.length) % Math.max(matches.length, 1)
      })
    } else if (e.key === 'Enter' && matches[cursor]) {
      e.preventDefault()
      add(matches[cursor].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="picker" ref={wrapRef}>
      <input
        className="search"
        value={query}
        placeholder={placeholder}
        aria-label="Add a strategy to the comparison"
        role="combobox"
        aria-expanded={open}
        aria-controls="picker-options"
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && (
        <ul className="picker__menu" id="picker-options" role="listbox">
          {matches.length === 0 && <li className="picker__empty">No strategy matches “{query}”.</li>}
          {matches.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                role="option"
                aria-selected={i === cursor}
                className={`picker__opt${i === cursor ? ' picker__opt--on' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => add(s.name)}
              >
                <span className="picker__name">{s.name}</span>
                <span className="picker__firm">{s.firm}</span>
                <span className="picker__plus" aria-hidden="true">+</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
