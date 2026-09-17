import { useEffect, useState } from 'react'
import { LOGO_DOMAINS } from '../data/logo-domains.js'

// A firm's own logo where we have one, and a generated geometric mark where we
// do not.
//
// Logos are served from our own /logos directory, keyed on the domain derived
// from the contact address in the firm's SEBI filing. About two thirds of firms
// have one; the rest fall back to a device and ground picked deterministically
// from the name, so every firm gets a stable mark either way. The fallback also
// catches a logo that 404s or fails to decode at render time.

const DEVICES = ['peak', 'leaf', 'hills', 'ring', 'bars', 'frame', 'zig', 'split', 'prism']

const GROUNDS = ['#12312F', '#12615A', '#7A2331', '#B08A4A', '#0C443F', '#3F5351']

function hash(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 9973
  return h
}

function markFor(firm) {
  const h = hash(firm || '')
  return [DEVICES[h % DEVICES.length], GROUNDS[h % GROUNDS.length]]
}

// Devices are drawn on a 32×32 ground, inset far enough to breathe at 26px.
function Device({ name, fg, accent }) {
  switch (name) {
    case 'peak':
      return (
        <>
          <path d="M7 22 L16 9 L25 22" fill="none" stroke={fg} strokeWidth="2.6" />
          <path d="M12 24 L16 18 L20 24" fill={accent} />
        </>
      )
    case 'leaf':
      return (
        <>
          <path d="M9 23 C9 13, 16 8, 24 8 C24 18, 17 23, 9 23 Z" fill={fg} />
          <path d="M10 23 C14 18, 18 14, 23 10" fill="none" stroke={accent} strokeWidth="1.5" />
        </>
      )
    case 'hills':
      return (
        <>
          <path d="M5 23 L12 12 L19 23 Z" fill={fg} />
          <path d="M15 23 L22 14 L28 23 Z" fill={accent} />
        </>
      )
    case 'ring':
      return (
        <>
          <circle cx="16" cy="16" r="8" fill="none" stroke={fg} strokeWidth="2.4" />
          <circle cx="16" cy="16" r="3" fill={accent} />
        </>
      )
    case 'bars':
      return (
        <>
          <path d="M8 22 L14 10" stroke={fg} strokeWidth="2.6" />
          <path d="M15 22 L21 10" stroke={accent} strokeWidth="2.6" />
          <path d="M22 22 L28 10" stroke={fg} strokeWidth="2.6" />
        </>
      )
    case 'frame':
      return (
        <>
          <rect x="7" y="7" width="18" height="18" fill="none" stroke={fg} strokeWidth="2.2" />
          <rect x="13" y="13" width="6" height="6" fill={accent} />
        </>
      )
    case 'zig':
      return (
        <path d="M6 21 L12 13 L16 18 L21 9 L26 15" fill="none" stroke={fg} strokeWidth="2.6" />
      )
    case 'split':
      return (
        <>
          <path d="M7 7 H25 L7 25 Z" fill={fg} />
          <path d="M25 11 V25 H11 Z" fill={accent} />
        </>
      )
    case 'prism':
    default:
      return (
        <>
          <path d="M16 7 L26 24 L6 24 Z" fill="none" stroke={fg} strokeWidth="2.2" />
          <path d="M16 14 L21 24 L11 24 Z" fill={accent} />
        </>
      )
  }
}

export default function FirmMark({ firm, domain, size = 28, tone }) {
  const [device, ground] = markFor(firm)
  const onDark = tone === 'dark'
  // Reset when the domain changes, so a recycled row does not keep the previous
  // firm's failure state and hide a logo we actually have.
  const [broken, setBroken] = useState(false)
  useEffect(() => { setBroken(false) }, [domain])

  if (domain && LOGO_DOMAINS.has(domain) && !broken) {
    return (
      <img
        src={`/logos/${domain}.png`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        onError={() => setBroken(true)}
        style={{
          display: 'block', flex: 'none', width: size, height: size,
          objectFit: 'contain',
          background: onDark ? 'rgba(244,240,228,0.92)' : 'var(--surface)',
          border: '1px solid var(--line)',
          padding: 2,
        }}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flex: 'none' }}
    >
      <rect width="32" height="32" fill={onDark ? 'rgba(244,240,228,0.12)' : ground} />
      <Device name={device} fg={onDark ? '#F4F0E4' : '#F4F0E4'} accent={onDark ? '#C9A756' : '#C9A756'} />
    </svg>
  )
}
