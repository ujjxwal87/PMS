// Distribution of 3-year CAGR across the live universe, in 5-point buckets.
// Bars are bucketed in the database (v_universe_hist), so this draws whatever
// the filings actually say rather than a hand-tuned shape.

export default function UniverseChart({ buckets = [], median = null }) {
  if (!buckets.length) {
    return <div style={{ height: 88 }} aria-hidden="true" />
  }

  const max = Math.max(...buckets.map((b) => b.n), 1)
  const w = 256 / buckets.length
  // width_bucket puts everything below the low edge in bucket 0 and everything
  // above the high edge in the last bucket, so those two are open-ended.
  const medianBucket =
    median === null ? -1 : buckets.findIndex((b) => median >= b.lo && median <= b.hi)

  return (
    <svg
      viewBox="0 0 256 88"
      style={{ width: '100%', height: 88, display: 'block' }}
      role="img"
      aria-label={`Distribution of three-year returns across ${buckets.reduce((a, b) => a + b.n, 0)} strategies`}
    >
      {buckets.map((b, i) => {
        const h = Math.max(2, (b.n / max) * 80)
        return (
          <rect
            key={b.bucket}
            x={i * w + 1.5}
            y={84 - h}
            width={Math.max(2, w - 3)}
            height={h}
            fill={i === medianBucket ? 'var(--accent)' : '#afc6be'}
          >
            <title>{`${b.n} strategies, ${b.lo?.toFixed(1)}% to ${b.hi?.toFixed(1)}%`}</title>
          </rect>
        )
      })}
    </svg>
  )
}
