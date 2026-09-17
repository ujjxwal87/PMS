import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, Eyebrow, KV, RailBlock, SectionHead, Stat } from '../components/ui.jsx'
import FirmMark from '../components/FirmMark.jsx'
import { loadManager, loadManagerStrategies } from '../lib/universe.js'
import { pct } from '../lib/format.js'

const crore = (n) => {
  if (n === null || n === undefined) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L Cr`
  return `₹${Math.round(n).toLocaleString('en-IN')} Cr`
}
const dp2 = (n) => (n === null || n === undefined ? '—' : n.toFixed(2))
const maybePct = (n) => (n === null || n === undefined ? '—' : pct(n))
const monthLabel = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'
const dateLabel = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function ManagerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: null, m: null, books: [] })

  useEffect(() => {
    let live = true
    setState({ loading: true, error: null, m: null, books: [] })

    loadManager(id)
      .then(async (m) => {
        if (!m) return { loading: false, error: null, m: null, books: [] }
        const books = await loadManagerStrategies(m.id).catch(() => [])
        return { loading: false, error: null, m, books }
      })
      .then((next) => { if (live) setState(next) })
      .catch((error) => { if (live) setState({ loading: false, error, m: null, books: [] }) })

    return () => { live = false }
  }, [id])

  const { loading, error, m, books } = state

  if (loading) {
    return (
      <div className="stack" style={{ padding: '60px var(--gutter)', alignItems: 'center' }}>
        <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>Loading the register…</span>
      </div>
    )
  }

  if (error || !m) {
    return (
      <div className="stack" style={{ padding: '60px var(--gutter)', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <span className="serif" style={{ fontSize: 21.5, fontWeight: 700 }}>
          {error ? 'Could not load this firm' : 'No such firm on the register'}
        </span>
        <span className="note">{error ? String(error.message || error) : 'The id is not one we hold.'}</span>
        <Link className="linkish" to="/managers">Back to the firm list →</Link>
      </div>
    )
  }

  const epfoShare = m.aumEpfo && m.aumGross ? m.aumEpfo / m.aumGross : 0

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-dark" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FirmMark firm={m.firm} domain={m.domain} size={64} tone="dark" />
          <div className="stack" style={{ flex: 1, minWidth: 280, gap: 8 }}>
            <Eyebrow tone="on-dark">
              {m.regNo || 'registration not on file'}
              {m.registeredOn ? ` · registered ${dateLabel(m.registeredOn)}` : ''}
            </Eyebrow>
            <h2 style={{ fontSize: 34.5, lineHeight: 1.05 }}>{m.firm}</h2>
            <span style={{ fontSize: 16, color: 'var(--on-dark-2)' }}>
              {m.strategies} {m.strategies === 1 ? 'strategy' : 'strategies'} filed with APMI
              {m.clients ? ` · ${m.clients.toLocaleString('en-IN')} clients` : ''}
            </span>
          </div>
          <div className="row wrap" style={{ gap: 24 }}>
            <Stat dark label="AUM ex-EPFO" value={crore(m.aum)} />
            <Stat dark label="AW Sharpe" value={dp2(m.awSharpe)} />
            <Stat dark label="AW 3Y" value={maybePct(m.awRet3y)} />
          </div>
        </div>

        {epfoShare > 0.5 && (
          <div className="stack" style={{ padding: '18px var(--gutter)', gap: 6, borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
            <Eyebrow>Read the size figure carefully</Eyebrow>
            <p className="card__body" style={{ maxWidth: '76ch' }}>
              This firm's gross PMS book is {crore(m.aumGross)}, of which {crore(m.aumEpfo)} —{' '}
              {(epfoShare * 100).toFixed(0)}% — is EPFO or provident-fund money. That is filed as discretionary
              portfolio management and legally is, but it is a retirement-administration mandate, not a book an
              individual investor joins. The headline above excludes it.
            </p>
          </div>
        )}

        <SectionHead
          title={books.length === 1 ? 'The one book it runs' : `The ${books.length} books it runs`}
          right={<span className="note">latest filed month</span>}
        />

        <div style={{ padding: '0 var(--gutter) 26px' }}>
          {books.length === 0 && (
            <p className="card__body" style={{ paddingTop: 12 }}>
              Nothing filed with APMI for the latest month.
            </p>
          )}
          {books.map((b) => (
            <div key={b.id} className="list-row" style={{ borderTop: '1px solid var(--line)', padding: '13px 0', flexWrap: 'wrap' }}>
              <div className="stack" style={{ flex: 1, minWidth: 200, gap: 2 }}>
                <Link to={`/strategy/${b.id}`} className="row-link" style={{ fontSize: 16.5, fontWeight: 700 }}>
                  {b.name}
                </Link>
                <span className="note">
                  {b.assetClass || 'unclassified'}
                  {b.benchmark ? ` · ${b.benchmark}` : ''}
                  {b.months ? ` · ${b.months} mo filed` : ''}
                </span>
              </div>
              <span className="num" style={{ fontSize: 15, color: 'var(--ink-2)', width: 112, textAlign: 'right' }}>
                {crore(b.aum)}
              </span>
              <span className="num" style={{ fontSize: 18.5, fontWeight: 700, width: 92, textAlign: 'right', color: 'var(--accent)' }}>
                {maybePct(b.returns['3Y'])}
              </span>
              <span className="num" style={{ width: 96, textAlign: 'right' }}>{dp2(b.sharpe)}</span>
            </div>
          ))}
          <span className="note" style={{ display: 'block', paddingTop: 10 }}>
            Columns are AUM, 3-year CAGR and Sharpe. A dash means the strategy has too little filed history for that
            figure.
          </span>
        </div>

        <div className="stack" style={{ padding: '20px var(--gutter) 26px', gap: 10, borderTop: '1px solid var(--line)', background: 'var(--panel)' }}>
          <Eyebrow>What is not here</Eyebrow>
          <p className="card__body" style={{ maxWidth: '76ch' }}>
            Neither SEBI nor APMI publishes a firm's investment philosophy, team biographies, CIO tenure or media
            appearances. This page carries only what is filed.
          </p>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="On the register" style={{ gap: 10 }}>
          <KV label="Registration" value={m.regNo || '—'} />
          <KV label="Registered" value={dateLabel(m.registeredOn)} />
          <KV label="Principal officer" value={m.principalOfficer || '—'} />
          <KV label="Compliance officer" value={m.complianceOfficer || '—'} lined={false} />
        </RailBlock>

        <RailBlock label="Client mix" style={{ gap: 10 }}>
          <KV label="Total clients" value={m.clients?.toLocaleString('en-IN') ?? '—'} />
          <KV label="Corporate" value={m.clientsCorp?.toLocaleString('en-IN') ?? '—'} />
          <KV label="Non-corporate" value={m.clientsNonCorp?.toLocaleString('en-IN') ?? '—'} />
          <KV label="NRI" value={m.clientsNri?.toLocaleString('en-IN') ?? '—'} />
          <KV label="EPFO / PF" value={m.clientsEpfo?.toLocaleString('en-IN') ?? '—'} lined={false} />
          <span className="note">As filed for {monthLabel(m.sebiAsOn)}.</span>
        </RailBlock>

        <RailBlock label="Complaints" style={{ gap: 10 }}>
          <KV label="Received" value={m.complaintsReceived ?? '—'} />
          <KV label="Resolved" value={m.complaintsResolved ?? '—'} />
          <KV label="Pending" value={m.complaintsPending ?? '—'} lined={false} />
        </RailBlock>

        <RailBlock style={{ gap: 10 }}>
          <Btn block variant="ghost" onClick={() => navigate('/compare')}>Compare its books</Btn>
          <Btn block variant="ghost" onClick={() => navigate('/managers')}>All firms</Btn>
        </RailBlock>
      </aside>
    </div>
  )
}
