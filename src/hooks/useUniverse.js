import { useEffect, useState } from 'react'
import { loadUniverse } from '../lib/universe.js'

// Fetches the live strategy universe once per mount. The three states are kept
// distinct on purpose: an empty universe and a failed query look identical to a
// spinner, and the screen needs to say which one happened.
export function useUniverse(options) {
  const [state, setState] = useState({ loading: true, error: null, asOn: null, strategies: [] })

  const assetClass = options?.assetClass
  const minAum = options?.minAum

  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true, error: null }))

    loadUniverse({ assetClass, minAum })
      .then(({ asOn, strategies }) => {
        if (live) setState({ loading: false, error: null, asOn, strategies })
      })
      .catch((err) => {
        if (live) setState({ loading: false, error: err, asOn: null, strategies: [] })
      })

    // A resolved fetch from a previous options value must not overwrite the
    // current one, so the stale response is dropped rather than applied.
    return () => { live = false }
  }, [assetClass, minAum])

  return state
}
