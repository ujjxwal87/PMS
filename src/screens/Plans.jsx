import { useState } from 'react'
import { Btn, Eyebrow, NoteCard } from '../components/ui.jsx'
import { useApp } from '../state.jsx'
import { PLANS, USER } from '../data/content.js'

export default function Plans() {
  const { plan, setPlan } = useApp()
  const [email, setEmail] = useState(USER.email)
  const [sent, setSent] = useState(false)

  return (
    <div className="pad stack" style={{ gap: 20, paddingBottom: 30 }}>
      <div className="row wrap" style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 28 }}>
        <div className="stack" style={{ gap: 7, maxWidth: '66ch' }}>
          <Eyebrow tone="gold">Access · billed annually, cancel any time</Eyebrow>
          <h2 style={{ fontSize: 28 }}>Three ways in, depending on who you are</h2>
          <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            The data is the same for everyone. What changes is how many seats, whether outputs are client-ready, and
            whether you are listing strategies rather than buying them.
          </span>
        </div>

        <div
          className="stack"
          style={{ border: '1px solid var(--line-strong)', background: 'var(--panel)', padding: '16px 18px', gap: 9, minWidth: 260 }}
        >
          <Eyebrow>Already a member</Eyebrow>
          <label className="field">
            <input value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
          </label>
          <Btn block onClick={() => setSent(true)}>{sent ? 'Link sent ✓' : 'Email me a sign-in link'}</Btn>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>No passwords. The link lasts 15 minutes.</span>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 16, alignItems: 'stretch' }}>
        {PLANS.map((p) => {
          const on = p.name === plan
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(p.name)}
              className="stack"
              style={{
                flex: 1, minWidth: 260, textAlign: 'left', padding: 20, gap: 12,
                border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                background: on ? 'var(--surface)' : 'var(--panel)',
              }}
            >
              <Eyebrow>{p.name}</Eyebrow>
              <div className="row wrap" style={{ alignItems: 'baseline', gap: 8, minHeight: 41 }}>
                <span className="serif" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                  {p.price}
                </span>
                <span className="note">{p.per}</span>
              </div>
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{p.who}</span>
              <div className="stack" style={{ gap: 7, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                {p.feats.map((f) => (
                  <span key={f} style={{ fontSize: 14, lineHeight: 1.45 }}>· {f}</span>
                ))}
              </div>
              <span className={`btn btn--${on ? 'primary' : 'ghost'} btn--block btn--lg`} style={{ marginTop: 'auto' }}>
                {p.cta}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <NoteCard label="We are a distributor, and we say so" panel>
          Commission from a manager never changes a ranking or a score. The composite weights are published, and you can
          re-weight them yourself on the leaderboard.
        </NoteCard>
        <NoteCard label="Advisor seats">
          Five seats included; additional seats ₹30,000 each. Client-facing exports carry your firm’s mark, not ours.
        </NoteCard>
        <NoteCard label="Listing a strategy">
          Monthly data by the 7th, in the published template, audited annually. Listings with stale data are marked as
          such on the leaderboard.
        </NoteCard>
      </div>
    </div>
  )
}
