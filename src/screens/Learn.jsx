import { Btn, Eyebrow, RailBlock } from '../components/ui.jsx'
import { GLOSSARY, GUIDES } from '../data/content.js'

export default function Learn() {
  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="stack" style={{ padding: '26px var(--gutter) 20px', borderBottom: '1px solid var(--line-strong)', gap: 8 }}>
          <Eyebrow tone="gold">Knowledge centre · six chapters, about an hour</Eyebrow>
          <h2 style={{ fontSize: 30, lineHeight: 1.1, textWrap: 'balance' }}>
            Everything you should know before ₹50 lakh leaves your account
          </h2>
          <span style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '70ch' }}>
            Written for first-time PMS investors and for advisors who have to explain it. No product pitch — each
            chapter ends with the questions to put to the manager.
          </span>
        </div>

        <div
          style={{ padding: '20px var(--gutter) 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}
        >
          {GUIDES.map((g) => (
            <article key={g.n} className="card">
              <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ghost)' }}>{g.n}</span>
              <span className="card__title">{g.title}</span>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>{g.body}</span>
              <span className="note" style={{ marginTop: 'auto' }}>{g.mins} read</span>
            </article>
          ))}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Glossary" style={{ gap: 14 }}>
          {GLOSSARY.map((g) => (
            <div key={g.term} className="stack" style={{ gap: 3 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>{g.term}</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>{g.body}</span>
            </div>
          ))}
        </RailBlock>

        <RailBlock label="Still unsure?" style={{ gap: 10 }}>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            An analyst will read a disclosure document with you, line by line, before you commit.
          </span>
          <Btn block>Book a 20-minute call</Btn>
        </RailBlock>
      </aside>
    </div>
  )
}
