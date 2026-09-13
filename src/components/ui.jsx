// Small presentational building blocks shared across screens.

export const Eyebrow = ({ children, tone }) => (
  <span className={`eyebrow${tone ? ` eyebrow--${tone}` : ''}`}>{children}</span>
)

export const Btn = ({ variant = 'primary', block, lg, className = '', ...rest }) => (
  <button
    type="button"
    className={`btn btn--${variant}${block ? ' btn--block' : ''}${lg ? ' btn--lg' : ''} ${className}`}
    {...rest}
  />
)

export const Segmented = ({ items, value, onChange, lg }) => (
  <div className={`segmented${lg ? ' segmented--lg' : ''}`} role="tablist">
    {items.map((item) => {
      const val = item.value ?? item
      const label = item.label ?? item
      const on = val === value
      return (
        <button
          key={String(val)}
          type="button"
          role="tab"
          aria-selected={on}
          className={`segmented__item${on ? ' segmented__item--on' : ''}`}
          onClick={() => onChange(val)}
        >
          {label}
        </button>
      )
    })}
  </div>
)

export const Meter = ({ value, tone, thin, style }) => (
  <span className={`meter${thin ? ' meter--thin' : ''}`} style={style}>
    <span
      className={`meter__fill${tone === 'gold' ? ' meter__fill--gold' : ''}`}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </span>
)

export const Stat = ({ label, value, dark }) => (
  <div className={`stat${dark ? ' stat--dark' : ''}`}>
    <span className="stat__label">{label}</span>
    <span className="stat__value num">{value}</span>
  </div>
)

export const KV = ({ label, value, lined = true }) => (
  <div className={`kv${lined ? ' kv--lined' : ''}`}>
    <span>{label}</span>
    <b className="num">{value}</b>
  </div>
)

export const TitleMeta = ({ title, meta }) => (
  <div className="stack" style={{ gap: 3 }}>
    <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3 }}>{title}</span>
    <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{meta}</span>
  </div>
)

export const RailBlock = ({ label, children, style }) => (
  <section className="rail__block" style={style}>
    {label && <Eyebrow>{label}</Eyebrow>}
    {children}
  </section>
)

export const SectionHead = ({ title, right }) => (
  <div className="section-head">
    <h3>{title}</h3>
    {right}
  </div>
)

export const NoteCard = ({ label, children, panel }) => (
  <div className={`card${panel ? ' card--panel' : ''}`}>
    <Eyebrow>{label}</Eyebrow>
    <p className="card__body">{children}</p>
  </div>
)
