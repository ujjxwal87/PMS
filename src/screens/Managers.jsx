import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, KV, RailBlock, Stat } from '../components/ui.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { loadManagers } from '../lib/universe.js'
import { pct } from '../lib/format.js'

const crore = (n) => {
  if (n === null || n === undefined) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L Cr`
  return `₹${Math.round(n).toLocaleString('en-IN')} Cr`
}

export default function Managers() {
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: null, firms: [] })

  useEffect(() => {
    let live = true
    loadManagers()
      .then((firms) => { if (live) setState({ loading: false, error: null, firms }) })
      .catch((error) => { if (live) setState({ loading: false, error, firms: [] }) })
    return () => { live = false }
  }, [])

  const { loading, error, firms } = state
  const epfoHeavy = firms.filter((f) => f.aumEpfo && f.aumGross && f.aumEpfo / f.aumGross > 0.5)
  const clean = firms.filter((f) => f.complaintsPending === 0).length
  const withComplaints = firms.filter((f) => f.complaintsPending > 0).length

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="stack" style={{ padding: '24px var(--gutter) 18px', borderBottom: '1px solid var(--line-strong)', gap: 7 }}>
          <Eyebrow tone="gold">
            {loading ? 'Loading…' : `${firms.length} firms · asset-weighted`}
          </Eyebrow>
          <h2 style={{ fontSize: 30 }}>Ranked by the firm, not the flagship</h2>
          <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '70ch' }}>
            Each firm's Sharpe and return are weighted by the size of every book it runs, so one good strategy cannot
            carry the record. Ranked on assets <b>excluding EPFO and provident-fund mandates</b> — those are filed as
            discretionary PMS and for the largest AMCs are most of the book, but they are not something you can invest
            alongside.
          </span>
        </div>

        {loading && (
          <div className="stack" style={{ padding: '40px 16px', alignItems: 'center' }}>
            <span className="note">Reading the register…</span>
          </div>
        )}

        {error && (
          <div className="stack" style={{ padding: '40px 16px', alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <span className="serif" style={{ fontSize: 19, fontWeight: 700, color: 'var(--neg)' }}>
              Could not load the firm register
            </span>
            <span className="note">{String(error.message || error)}</span>
          </div>
        )}

        {firms.map((f, i) => (
          <div
            key={f.id}
            style={{ padding: '20px var(--gutter)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}
          >
            <FirmMark firm={f.firm} domain={f.domain} size={52} />
            <div className="stack" style={{ flex: 1, minWidth: 280, gap: 9 }}>
              <div className="row" style={{ alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span className="serif" style={{ fontSize: 21.5, fontWeight: 700 }}>{f.firm}</span>
                <span
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--on-dark-gold)', padding: '3px 9px' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <span className="note">
                {f.regNo || 'no registration on file'}
                {f.strategies ? ` · ${f.strategies} ${f.strategies === 1 ? 'strategy' : 'strategies'}` : ''}
                {f.clients ? ` · ${f.clients.toLocaleString('en-IN')} clients` : ''}
              </span>
              {f.aumEpfo > 0 && (
                <span className="note">
                  Gross book {crore(f.aumGross)}, of which {crore(f.aumEpfo)} is EPFO or provident-fund money.
                </span>
              )}
              <div className="row wrap" style={{ gap: 9 }}>
                <Btn onClick={() => navigate(`/managers/${f.id}`)}>View profile</Btn>
                {f.complaintsPending > 0 && (
                  <span className="btn btn--quiet">{f.complaintsPending} complaints pending</span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 104px)', border: '1px solid var(--line)', flex: 'none' }}>
              <div style={{ padding: 12, borderRight: '1px solid var(--line)' }}>
                <Stat label="AUM" value={crore(f.aum)} />
              </div>
              <div style={{ padding: 12, borderRight: '1px solid var(--line)' }}>
                <Stat label="AW Sharpe" value={f.awSharpe === null ? '—' : f.awSharpe.toFixed(2)} />
              </div>
              <div style={{ padding: 12 }}>
                <Stat label="AW 3Y" value={f.awRet3y === null ? '—' : pct(f.awRet3y)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rail">
        <RailBlock label="Complaints on file" style={{ gap: 11 }}>
          <KV label="Firms with none pending" value={loading ? '—' : String(clean)} />
          <KV label="Firms with one or more" value={loading ? '—' : String(withComplaints)} />
          <KV label="Source" value="SEBI monthly report" lined={false} />
          <span className="note">
            Complaint counts are as filed for the manager's latest SEBI month, across its whole business — not per
            strategy.
          </span>
        </RailBlock>

        <RailBlock label="Where the money actually is" style={{ gap: 11 }}>
          <span className="note">
            {loading
              ? 'Loading…'
              : `${epfoHeavy.length} of these firms have more than half their book in EPFO or provident-fund mandates. Ranked on gross assets they would fill the top of this list; that is a retirement-administration business, not a book an investor here can join.`}
          </span>
        </RailBlock>
      </aside>
    </div>
  )
}
