export const clamp01 = (v) => Math.max(0, Math.min(1, v))

export const norm = (v, lo, hi) => clamp01((v - lo) / (hi - lo))

export const pct = (n, dp = 1) => `${n.toFixed(dp)}%`

export const signedPct = (n, dp = 1) => `${n > 0 ? '+' : ''}${n.toFixed(dp)}%`

export const rupees = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

export const lakhs = (n) => `₹${(n / 100000).toFixed(2)} L`

export const crores = (n) => `₹${n.toLocaleString('en-IN')} cr`

export const rank2 = (i) => String(i + 1).padStart(2, '0')

// ₹75,00,000 reads better as ₹75 L, and ₹5,00,00,000 as ₹5 cr.
export const shortRupees = (n) =>
  n >= 10000000 ? `₹${+(n / 10000000).toFixed(2)} cr` : `₹${+(n / 100000).toFixed(0)} L`
