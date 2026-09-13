// The house mark: a bunker cut into a hillside, with the money stacked inside.
// `tone="dark"` is the version for the deep-green masthead; the default reads on
// the ivory surfaces.

export default function BunkerLogo({ size = 44, tone = 'light', title }) {
  const onDark = tone === 'dark'
  const hill = onDark ? '#F4F0E4' : '#12312F'
  const mouth = onDark ? '#12312F' : '#F4F0E4'
  const cash = '#C9A756'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      style={{ display: 'block', flex: 'none' }}
    >
      {title && <title>{title}</title>}

      {/* the hillside the bunker is cut into — straight flanks, not a dome */}
      <path d="M2 36 L2 23 C2 5, 38 5, 38 23 L38 36 Z" fill={hill} />

      {/* the vault mouth, cut deep enough to hold the stack */}
      <path d="M13.5 36 L13.5 23 C13.5 14.5, 26.5 14.5, 26.5 23 L26.5 36 Z" fill={mouth} />

      {/* door surround */}
      <path
        d="M15 36 L15 23 C15 16.4, 25 16.4, 25 23 L25 36"
        fill="none"
        stroke={cash}
        strokeWidth="1.1"
        opacity="0.6"
      />

      {/* the money, stacked inside */}
      <rect x="16.6" y="32.6" width="6.8" height="2.3" fill={cash} />
      <rect x="16.6" y="29.6" width="6.8" height="2.3" fill={cash} opacity="0.86" />
      <rect x="16.6" y="26.6" width="6.8" height="2.3" fill={cash} opacity="0.66" />

      {/* ground */}
      <rect x="2" y="36" width="36" height="2" fill={hill} />
    </svg>
  )
}
