import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, RailBlock } from '../components/ui.jsx'
import { useApp } from '../state.jsx'
import { STEPS } from '../data/content.js'
import { RETURNS, STRATEGIES } from '../data/strategies.js'
import { pct } from '../lib/format.js'
import FirmMark from '../components/FirmMark.jsx'

const Field = ({ label, value, onChange }) => (
  <label className="field">
    <span className="field__label">{label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
)

export default function Invest() {
  const navigate = useNavigate()
  const { pick, setPick, period } = useApp()

  const [step, setStep] = useState(0)
  const [signed, setSigned] = useState(false)
  const [investor, setInvestor] = useState({
    name: 'Priya Sundaram',
    pan: 'AFZPS4821K',
    demat: 'IN301549 · 18442907',
    residency: 'Resident individual',
  })
  const [funding, setFunding] = useState({
    amount: '₹1,00,00,000',
    mode: 'RTGS from HDFC ··4417',
    kind: 'Cash',
    fee: 'Hybrid · 1.5% + 10% over 10%',
  })

  const rets = RETURNS[period]
  const set = (obj, fn) => (key) => (val) => fn({ ...obj, [key]: val })
  const setInv = set(investor, setInvestor)
  const setFund = set(funding, setFunding)

  const next = () => (step === 3 ? setSigned(true) : setStep(Math.min(3, step + 1)))

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-panel stack" style={{ gap: 7 }}>
          <Eyebrow tone="gold">Onboarding · about 12 minutes</Eyebrow>
          <h2 style={{ fontSize: 30 }}>Open a PMS account</h2>
          <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '70ch' }}>
            Four steps, no paper. The mandate is signed with Aadhaar e-sign; funds move straight to the manager’s
            designated account.
          </span>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', borderBottom: '1px solid var(--line)', background: 'var(--panel-deep)' }}
        >
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textAlign: 'left',
                borderLeft: i ? '1px solid var(--line)' : 'none',
                background: i === step ? 'var(--surface)' : 'transparent',
              }}
            >
              <span
                style={{
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flex: 'none',
                  background: i < step ? 'var(--accent)' : i === step ? 'var(--ink)' : '#e4ddd3',
                  color: i <= step ? 'var(--surface)' : 'var(--muted)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: i === step ? 700 : 400, color: i <= step ? 'var(--ink)' : 'var(--muted)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="stack" style={{ padding: '24px var(--gutter) 28px', gap: 18 }}>
          {step === 0 && (
            <div className="stack" style={{ gap: 12 }}>
              <span style={{ fontSize: 16.5, fontWeight: 700 }}>Which strategy are you funding?</span>
              {STRATEGIES.slice(0, 4).map((s, i) => {
                const on = s.name === pick
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setPick(s.name)}
                    style={{
                      display: 'grid', gridTemplateColumns: '22px 34px minmax(0, 1fr) 100px 140px', gap: 14, alignItems: 'center',
                      padding: '14px 16px', textAlign: 'left',
                      border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                      background: on ? '#f1f6f2' : 'var(--surface)',
                    }}
                  >
                    <span
                      style={{
                        width: 14, height: 14, borderRadius: 999, display: 'block',
                        border: `1px solid ${on ? 'var(--accent)' : '#b9c0b4'}`,
                        background: on ? 'var(--accent)' : 'transparent',
                      }}
                    />
                    <FirmMark firm={s.firm} size={34} />
                    <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</span>
                      <span className="note" style={{ fontSize: 13.5 }}>{s.firm}</span>
                    </span>
                    <span className="num" style={{ fontSize: 16, fontWeight: 700, textAlign: 'right' }}>{pct(rets[i])}</span>
                    <span className="note" style={{ textAlign: 'right' }}>Min ₹50,00,000</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 1 && (
            <div className="stack" style={{ gap: 16 }}>
              <span style={{ fontSize: 16.5, fontWeight: 700 }}>Investor details</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <Field label="Full name, as on PAN" value={investor.name} onChange={setInv('name')} />
                <Field label="PAN" value={investor.pan} onChange={setInv('pan')} />
                <Field label="Demat account (DP ID · client ID)" value={investor.demat} onChange={setInv('demat')} />
                <Field label="Residency" value={investor.residency} onChange={setInv('residency')} />
              </div>
              <div className="stack" style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: 14, gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>KYC fetched from CVL KRA · verified 11 Sep 2026</span>
                <span className="note">
                  Address, bank and FATCA declarations pulled through. Only the demat mapping needs your confirmation.
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack" style={{ gap: 16 }}>
              <span style={{ fontSize: 16.5, fontWeight: 700 }}>Funding</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <Field label="Amount" value={funding.amount} onChange={setFund('amount')} />
                <Field label="Mode" value={funding.mode} onChange={setFund('mode')} />
                <Field label="Contribution type" value={funding.kind} onChange={setFund('kind')} />
                <Field label="Fee option" value={funding.fee} onChange={setFund('fee')} />
              </div>
              <span className="linkish" onClick={() => navigate('/fees')}>
                Compare what each fee option would cost →
              </span>
            </div>
          )}

          {step === 3 && (
            <div className="stack" style={{ gap: 14 }}>
              <span style={{ fontSize: 16.5, fontWeight: 700 }}>Review and sign</span>
              <div style={{ border: '1px solid var(--line)' }}>
                {[
                  ['Strategy', pick],
                  ['Amount', funding.amount],
                  ['Fee', '1.5% + 10% over a 10% hurdle'],
                  ['Exit load', '1% before 12 months'],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className="kv"
                    style={{ padding: '12px 16px', fontSize: 15, borderBottom: i < 3 ? '1px solid var(--line-soft)' : 'none', background: i % 2 ? 'var(--panel)' : 'transparent' }}
                  >
                    <span style={{ color: 'var(--ink-2)' }}>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--muted)', maxWidth: '76ch' }}>
                By signing you accept the disclosure document dated 1 Jul 2026 and the PMS agreement. Investments are
                subject to market risk; past performance is not indicative of future returns.
              </span>
              {signed && (
                <div className="toast">
                  <b>Mandate signed.</b> The manager’s operations desk will confirm the account within two working days;
                  funding instructions have been emailed to you.
                </div>
              )}
            </div>
          )}

          <div className="row" style={{ gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <Btn variant="quiet" lg onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              Back
            </Btn>
            <Btn lg onClick={next} disabled={signed}>
              {signed ? 'Signed ✓' : step === 3 ? 'Sign the mandate' : 'Continue'}
            </Btn>
          </div>
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="What you’re signing up to" style={{ gap: 10 }}>
          <p className="card__body">
            A PMS is not a pooled fund. The securities sit in your demat account and capital gains are yours in the year
            they are realised — a churn-heavy year has a tax cost even if you never withdraw.
          </p>
        </RailBlock>

        <RailBlock label="Need a second pair of eyes?" style={{ gap: 11 }}>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            An analyst can walk the disclosure document with you before you sign. No commission on either side.
          </span>
          <Btn block>Book a 20-minute call</Btn>
        </RailBlock>
      </aside>
    </div>
  )
}
