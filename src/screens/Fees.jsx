import { useState } from 'react'
import { Eyebrow, NoteCard, Segmented } from '../components/ui.jsx'
import { FEE_AMOUNTS, FEE_RETURNS } from '../data/content.js'
import { cheapestOf, priceFeeModels } from '../lib/fees.js'
import { rupees } from '../lib/format.js'

const GRID = 'minmax(0, 1.6fr) 92px 162px 132px 104px 142px'

export default function Fees() {
  const [amountIdx, setAmountIdx] = useState(1)
  const [gross, setGross] = useState(18)

  const amount = FEE_AMOUNTS[amountIdx].value
  const rows = priceFeeModels(amount, gross)
  const cheapest = cheapestOf(rows)

  // Does another gross-return setting flip which structure is cheapest?
  const flip = FEE_RETURNS.filter((g) => g !== gross)
    .map((g) => ({ g, win: cheapestOf(priceFeeModels(amount, g)) }))
    .find((x) => x.win.model.name !== cheapest.model.name)

  const article = (n) => (String(n)[0] === '8' || [8, 11, 18].includes(n) ? 'an' : 'a')

  const verdict =
    `At ${FEE_AMOUNTS[amountIdx].label} and ${article(gross)} ${gross}% gross year, ` +
    `${cheapest.model.name.toLowerCase()} costs ${rupees(cheapest.total)} — the cheapest of the three.` +
    (flip
      ? ` At ${flip.g}% the ${flip.win.model.name.toLowerCase()} structure wins instead, at ${rupees(flip.win.total)}: ` +
        'a performance share scales with the gain, a flat fee bills the same either way.'
      : ' No setting in this range changes which structure is cheapest.')

  return (
    <div className="pad stack" style={{ gap: 18, paddingBottom: 30 }}>
      <div className="stack" style={{ gap: 7, maxWidth: '72ch' }}>
        <Eyebrow tone="gold">Fee workings · one year, one account</Eyebrow>
        <h2 style={{ fontSize: 30 }}>A profit-only fee is not always the cheap one</h2>
        <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)' }}>
          Set the amount and the gross year, and the three structures are priced side by side — fixed fee, performance
          share above a hurdle, and the effective cost on the whole account.
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
            items={FEE_AMOUNTS.map((a, i) => ({ label: a.label, value: i }))}
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
      </div>

      <div style={{ border: '1px solid var(--line-strong)', overflowX: 'auto' }}>
        <div style={{ minWidth: 844 }}>
          <div className="tbl-head" style={{ display: 'grid', gridTemplateColumns: GRID }}>
            <div style={{ padding: '10px 16px' }}>Structure</div>
            <div className="right">Fixed</div>
            <div className="right">Performance share</div>
            <div className="right">Fee for the year</div>
            <div className="right">Effective</div>
            <div className="right" style={{ paddingRight: 16 }}>Net gain to you</div>
          </div>

          {rows.map((f, i) => {
            const best = f === cheapest
            return (
              <div
                key={f.model.name}
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
                  <span className="note" style={{ fontSize: 13.5 }}>{f.model.detail}</span>
                </div>
                <div className="right num" style={{ padding: '0 8px', fontSize: 15 }}>
                  {f.model.fixed ? `${f.model.fixed.toFixed(2)}%` : '—'}
                </div>
                <div className="right num" style={{ padding: '0 8px', fontSize: 15 }}>
                  {f.model.share ? `${f.model.share}% over ${f.model.hurdle}%` : '—'}
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
        <NoteCard label="What this working ignores">
          Brokerage, GST at 18% on the fee, custody and the exit load. Together they add roughly 0.3–0.6 points a year —
          ask the manager for the all-in number in writing.
        </NoteCard>
        <NoteCard label="High-water mark">
          Both performance structures here carry one, so a recovery year pays no share until the previous peak is
          passed. Without it, you can pay twice for the same gain.
        </NoteCard>
      </div>
    </div>
  )
}
