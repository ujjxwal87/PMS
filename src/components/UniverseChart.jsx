// Distribution of 5-yr CAGR across the universe. Highlighted bars are the median buckets.
const BARS = [10, 22, 38, 58, 74, 54, 31, 16]

export default function UniverseChart() {
  return (
    <svg viewBox="0 0 256 88" style={{ width: '100%', height: 88, display: 'block' }} role="img"
      aria-label="Distribution of five-year returns across the universe">
      {BARS.map((v, i) => (
        <rect
          key={i}
          x={i * 32 + 4}
          y={84 - v}
          width={22}
          height={v}
          fill={i === 3 || i === 4 ? 'var(--accent)' : '#afc6be'}
        />
      ))}
    </svg>
  )
}
