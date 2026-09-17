import { useEffect, useMemo, useRef, useState } from 'react'
import { searchStrategies } from '../lib/universe.js'
import { useApp } from '../state.jsx'

// Type a strategy or firm name and add it to the comparison. The search runs
// against the live universe rather than a loaded page of it, so a small or
// debt book that never reaches the equity leaderboard is still reachable here.
// Anything already in the basket drops out of the suggestions.
export default function StrategyPicker({ placeholder = 'Add a strategy or firm…' }) {
  const { basket, addToBasket, basketFull } = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const wrapRef = useRef(null)

  const picked = useMemo(() => new Set(basket.map((b) => b.id)), [basket])

  // Debounced so a fast typist sends one request, not one per keystroke.
  useEffect(() => {
    if (!open) return undefined
    let live = true
    setBusy(true)
    const t = setTimeout(() => {
      searchStrategies(query, { limit: 8 })
        .then((hits) => { if (live) { setRows(hits); setBusy(false) } })
        .catch(() => { if (live) { setRows([]); setBusy(false) } })
    }, 180)

    return () => { live = false; clearTimeout(t) }
  }, [query, open])

  const matches = rows.filter((s) => !picked.has(s.id)).slice(0, 6)

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

  const add = (strategy) => {
    addToBasket(strategy)
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
      add(matches[cursor])
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
          {busy && matches.length === 0 && <li className="picker__empty">Searching…</li>}
          {!busy && matches.length === 0 && (
            <li className="picker__empty">
              {query.trim() ? `No strategy matches “${query}”.` : 'No strategies available.'}
            </li>
          )}
          {matches.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === cursor}
                className={`picker__opt${i === cursor ? ' picker__opt--on' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => add(s)}
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
