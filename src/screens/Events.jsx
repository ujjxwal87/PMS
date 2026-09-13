import { useState } from 'react'
import { Btn, Eyebrow, RailBlock, SectionHead, TitleMeta } from '../components/ui.jsx'
import { EVENTS, REPLAYS } from '../data/content.js'

export default function Events() {
  const [registered, setRegistered] = useState(() => EVENTS.filter((e) => e.registered).map((e) => e.title))
  const featureOn = registered.includes(EVENTS[0].title)

  const toggle = (title) =>
    setRegistered((cur) => (cur.includes(title) ? cur.filter((t) => t !== title) : cur.concat(title)))

  return (
    <div className="body-grid">
      <div className="main-col">
        <div className="banner-dark" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="stack" style={{ flex: 1, minWidth: 320, gap: 10 }}>
            <Eyebrow tone="on-dark">Live · Thursday 17 September · 6:30 pm IST</Eyebrow>
            <h2 style={{ fontSize: 32.5, lineHeight: 1.1, textWrap: 'balance' }}>
              Anaya Rao on holding concentrated books through a drawdown
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: 'var(--on-dark-2)', maxWidth: '66ch' }}>
              Northwick’s CIO takes questions on position sizing when the top five names are 41% of the book. Moderated
              by our research desk; 40 minutes plus open Q&amp;A.
            </p>
            <div className="row wrap" style={{ gap: 9 }}>
              <Btn variant="onDark" onClick={() => toggle(EVENTS[0].title)}>
                {featureOn ? 'Seat reserved ✓' : 'Reserve a seat'}
              </Btn>
              <Btn variant="outlineDark" lg>Add to calendar</Btn>
            </div>
          </div>
          <div className="stack" style={{ fontSize: 14, color: 'var(--on-dark-4)', gap: 5, flex: 'none' }}>
            <span>{412 + (featureOn ? 1 : 0)} registered</span>
            <span>Seats capped at 600</span>
            <span>Replay for subscribers</span>
          </div>
        </div>

        <SectionHead title="The next six weeks" right={<span className="note">All times IST</span>} />

        <div style={{ padding: '0 var(--gutter) 24px' }}>
          {EVENTS.map((e) => {
            const on = registered.includes(e.title)
            return (
              <div key={e.title} className="list-row" style={{ borderTop: '1px solid var(--line)', gap: 20, flexWrap: 'wrap' }}>
                <div className="stack" style={{ width: 76, flex: 'none' }}>
                  <span className="serif" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{e.day}</span>
                  <Eyebrow>{e.month}</Eyebrow>
                </div>
                <div className="stack" style={{ flex: 1, minWidth: 240, gap: 3 }}>
                  <span style={{ fontSize: 17.5, fontWeight: 700, lineHeight: 1.3 }}>{e.title}</span>
                  <span className="note">{e.meta}</span>
                </div>
                <button type="button" className={`tag${on ? ' tag--on' : ''}`} onClick={() => toggle(e.title)}>
                  {on ? 'Registered' : e.tag}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Recent replays">
          {REPLAYS.map((r) => (
            <TitleMeta key={r.title} title={r.title} meta={r.meta} />
          ))}
        </RailBlock>

        <RailBlock label="Your registrations" style={{ gap: 10 }}>
          {registered.length === 0 && <span className="note">No sessions reserved yet.</span>}
          {registered.map((title) => (
            <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', padding: 14 }}>
              <TitleMeta title={title} meta="Joining link sent by email" />
            </div>
          ))}
        </RailBlock>
      </aside>
    </div>
  )
}
