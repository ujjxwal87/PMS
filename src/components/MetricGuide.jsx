import { METRIC_GUIDE } from '../data/content.js'

// Plain-language definitions for the four leaderboard columns, each with a
// worked example from the strategies on screen.
export default function MetricGuide() {
  return (
    <dl className="glossary">
      {METRIC_GUIDE.map((m) => (
        <div key={m.term} className="glossary__item">
          <dt className="glossary__term">{m.term}</dt>
          <dd className="glossary__body">
            {m.body}
            <span className="glossary__eg">
              <span className="glossary__eg-label">For example</span>
              {m.example}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
