import { useNavigate } from 'react-router-dom'
import { Btn, Eyebrow, RailBlock, SectionHead, Stat, TitleMeta } from '../components/ui.jsx'
import { MANAGER } from '../data/content.js'

export default function ManagerProfile() {
  const navigate = useNavigate()
  const m = MANAGER

  return (
    <div className="body-grid--fixed">
      <div className="main-col">
        <div className="banner-dark" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="stack" style={{ flex: 1, minWidth: 300, gap: 8 }}>
            <Eyebrow tone="on-dark">{m.meta}</Eyebrow>
            <h2 style={{ fontSize: 32, lineHeight: 1.05 }}>{m.name}</h2>
            <span style={{ fontSize: 15, color: 'var(--on-dark-2)' }}>{m.role}</span>
          </div>
          <div className="row wrap" style={{ gap: 24 }}>
            {m.stats.map((s) => (
              <Stat key={s.label} dark label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        <div className="stack" style={{ padding: '22px var(--gutter) 18px', borderBottom: '1px solid var(--line)', gap: 10 }}>
          <Eyebrow>How she invests</Eyebrow>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, maxWidth: '74ch', textWrap: 'pretty' }}>{m.approach}</p>
          <p
            className="serif"
            style={{ margin: 0, fontSize: 19, lineHeight: 1.4, borderLeft: '3px solid var(--gold-ink)', paddingLeft: 16, maxWidth: '66ch' }}
          >
            {m.quote}
          </p>
        </div>

        <SectionHead title="The four books she runs" right={<span className="note">5-yr CAGR, net of fees</span>} />

        <div style={{ padding: '0 var(--gutter) 26px' }}>
          {m.funds.map((f) => (
            <div key={f.name} className="list-row" style={{ borderTop: '1px solid var(--line)', padding: '13px 0', flexWrap: 'wrap' }}>
              <div className="stack" style={{ flex: 1, minWidth: 200, gap: 2 }}>
                <span style={{ fontSize: 15.5, fontWeight: 700 }}>{f.name}</span>
                <span className="note">{f.cat} · since {f.since}</span>
              </div>
              <span className="num" style={{ fontSize: 14, color: 'var(--ink-2)', width: 104, textAlign: 'right' }}>{f.aum}</span>
              <span className="num" style={{ fontSize: 17, fontWeight: 700, width: 84, textAlign: 'right', color: 'var(--accent)' }}>{f.ret}</span>
              <span className="tag" style={{ width: 88, textAlign: 'center' }}>{f.status}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="rail">
        <RailBlock label="Team" style={{ gap: 10 }}>
          {m.team.map((t) => (
            <TitleMeta key={t.name} title={t.name} meta={t.meta} />
          ))}
        </RailBlock>

        <RailBlock label="In her own words">
          {m.appearances.map((a) => (
            <TitleMeta key={a.title} title={a.title} meta={a.meta} />
          ))}
        </RailBlock>

        <RailBlock style={{ gap: 10 }}>
          <Btn block onClick={() => navigate('/invest')}>Invest with {m.firm.split(' ')[0]}</Btn>
          <Btn block variant="ghost" onClick={() => navigate('/compare')}>Compare against peers</Btn>
        </RailBlock>
      </aside>
    </div>
  )
}
