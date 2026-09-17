import { useState } from 'react'
import { Eyebrow, NoteCard, Segmented } from '../components/ui.jsx'
import { FEE_DEFAULTS, FEE_RETURNS, GST_PCT } from '../data/fee-defaults.js'
import { cheapestOf, crossoverPoint, priceFeeModels } from '../lib/fees.js'
import { rupees } from '../lib/format.js'

const GRID = 'minmax(0, 1.5fr) 210px 132px 104px 142px'

const AMOUNTS = [
  { label: '₹50 L', value: 5000000 },
  { label: '₹1 cr', value: 10000000 },
  { label: '₹5 cr', value: 50000000 },
]

// A fee input: percent, one decimal, never negative.
function PctInput({ value, onChange, label, max = 100 }) {
  return (
    <label className="stack" style={{ gap: 3, minWidth: 0 }}>
      <span className="note" style={{ fontSize: 12 }}>{label}</span>
      <input
        className="search"
        type="number"
        min="0"
        max={max}
        step="0.1"
        value={value}
        aria-label={label}
        style={{ width: 62, padding: '5px 7px', fontSize: 14 }}
        onChange={(e) => {
          const n = Number(e.target.value)
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0)
        }}
      />
    </label>
  )
}

export default function Fees() {
  const [amountIdx, setAmountIdx] = useState(1)
  const [gross, setGross] = useState(18)
  const [models, setModels] = useState(FEE_DEFAULTS)
  const [gst, setGst] = useState(true)
  const [shareOnNet, setShareOnNet] = useState(false)

  const amount = AMOUNTS[amountIdx].value
  const opts = { gst, shareOnNet }
  const rows = priceFeeModels(models, amount, gross, opts)
  const cheapest = cheapestOf(rows)
  const cross = crossoverPoint(models, amount, opts)

  const setField = (id, field, value) =>
    setModels((cur) => cur.map((m) => (m.id === id ? { ...m, [field]: value } : m)))

  const edited = JSON.stringify(models) !== JSON.stringify(FEE_DEFAULTS)

  const verdict =
    `At ${AMOUNTS[amountIdx].label} and a ${gross}% gross year, ${cheapest.model.name.toLowerCase()} ` +
    `costs ${rupees(cheapest.total)}${gst ? ' including GST' : ' before GST'} — the cheapest of the three as set. ` +
    (cross
      ? `The ranking changes at about ${cross.at}% gross: below that one structure wins, above it another. ` +
        'A performance share scales with the gain; a flat fee bills the same either way.'
      : 'Nothing between 0% and 40% gross changes which is cheapest.')

  return (
    <div className="pad stack" style={{ gap: 18, paddingBottom: 30 }}>
      <div className="stack" style={{ gap: 7, maxWidth: '72ch' }}>
        <Eyebrow tone="gold">Fee workings · one year, one account</Eyebrow>
        <h2 style={{ fontSize: 30 }}>A profit-only fee is not always the cheap one</h2>
        <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
          Set the amount, the gross year and the terms you have actually been quoted. The three structures are priced
          side by side, including GST.
        </span>
      </div>

      <div
        className="stack"
        style={{ gap: 6, background: 'var(--panel-deep)', border: '1px solid var(--line-strong)', padding: '14px 16px' }}
      >
        <Eyebrow>Where these rates come from</Eyebrow>
        <span style={{ fontSize: 14.5, lineHeight: 1.55, maxWidth: '76ch' }}>
          Nowhere. <b>Neither SEBI nor APMI publishes what a portfolio manager charges</b>, so unlike every other
          number on this site these are not filed figures. They open at rates the industry commonly offers so the
          calculator starts somewhere recognisable — <b>type your own in</b>, and price the offer in front of you.
        </span>
      </div>

      <div
        className="row wrap"
        style={{ gap: 26, alignItems: 'flex-end', background: 'var(--panel)', border: '1px solid var(--line)', padding: '16px 18px' }}
      >
        <div className="stack" style={{ gap: 7 }}>
          <Eyebrow>Amount invested</Eyebrow>
          <Segmented
            lg
            items={AMOUNTS.map((a, i) => ({ label: a.label, value: i }))}
            value={amountIdx}
            onChange={setAmountIdx}
          />
        </div>
        <div className="stack" style={{ gap: 7 }}>
          <Eyebrow>Gross return for the year</Eyebrow>
          <Segmented
            lg
            items={FEE_RETURNS.map((r) => ({ label: `${r}%`, value: r }))}
            value={gross}
            onChange={setGross}
          />
        </div>
        <div className="stack" style={{ gap: 7 }}>
          <Eyebrow>Assumptions</Eyebrow>
          <div className="row wrap" style={{ gap: 7 }}>
            <button type="button" className={`chip${gst ? ' chip--on' : ''}`} onClick={() => setGst((v) => !v)}>
              GST {GST_PCT}%{gst ? ' ×' : ''}
            </button>
            <button
              type="button"
              className={`chip${shareOnNet ? ' chip--on' : ''}`}
              onClick={() => setShareOnNet((v) => !v)}
            >
              Share on net of fixed{shareOnNet ? ' ×' : ''}
            </button>
          </div>
        </div>
        {edited && (
          <button type="button" className="linkish" onClick={() => setModels(FEE_DEFAULTS)}>
            Reset the rates
          </button>
        )}
      </div>

      <div style={{ border: '1px solid var(--line-strong)', overflowX: 'auto' }}>
        <div style={{ minWidth: 844 }}>
          <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: GRID }}>
            <div style={{ padding: '10px 16px' }}>Structure</div>
            <div>Terms — edit these</div>
            <div className="right">Fee for the year</div>
            <div className="right">Effective</div>
            <div className="right" style={{ paddingRight: 16 }}>Net gain to you</div>
          </div>

          {rows.map((f, i) => {
            const best = f === cheapest
            return (
              <div
                key={f.model.id}
                style={{
                  display: 'grid', gridTemplateColumns: GRID, alignItems: 'center',
                  borderTop: '1px solid var(--line-soft)',
                  background: best ? '#f1f6f2' : i % 2 ? 'var(--panel)' : 'var(--surface)',
                }}
              >
                <div className="stack" style={{ padding: '14px 16px', gap: 3, minWidth: 0 }}>
                  <span className="row" style={{ gap: 9, fontSize: 16, fontWeight: 700 }}>
                    {f.model.name}
                    {best && (
                      <span
                        style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--accent)', color: 'var(--surface)', padding: '3px 8px' }}
                      >
                        Cheapest here
                      </span>
                    )}
                  </span>
                  <span className="note" style={{ fontSize: 13 }}>
                    fixed {rupees(f.fixed)} · performance {rupees(f.performance)}
                    {gst ? ` · GST ${rupees(f.tax)}` : ''}
                  </span>
                </div>
                <div className="row" style={{ gap: 8, padding: '8px 0' }}>
                  <PctInput label="Fixed %" value={f.model.fixed} onChange={(v) => setField(f.model.id, 'fixed', v)} max={10} />
                  <PctInput label="Share %" value={f.model.share} onChange={(v) => setField(f.model.id, 'share', v)} max={50} />
                  <PctInput label="Hurdle %" value={f.model.hurdle} onChange={(v) => setField(f.model.id, 'hurdle', v)} max={30} />
                </div>
                <div className="right num" style={{ padding: '0 8px', fontSize: 16, fontWeight: 700 }}>{rupees(f.total)}</div>
                <div className="right num" style={{ padding: '0 8px', fontSize: 15 }}>{f.effective.toFixed(2)}%</div>
                <div className="right num" style={{ padding: '0 16px 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--accent-dark)' }}>
                  {rupees(f.net)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <NoteCard label="Verdict" panel>{verdict}</NoteCard>
        <NoteCard label="Which convention this uses">
          The performance share is charged on the gross gain above the hurdle, with the fixed fee billed separately.
          Some agreements instead take the share on the gain <i>net</i> of the fixed fee, which costs you slightly
          less — the toggle above prices it that way. Check which one your agreement says.
        </NoteCard>
        <NoteCard label="Still not counted">
          Brokerage, custody, exit load, and any high-water mark. A high-water mark means a recovery year pays no
          performance share until the previous peak is passed; without one you can pay twice for the same gain. Ask for
          the all-in number in writing.
        </NoteCard>
      </div>
    </div>
  )
}
