/**
 * Format USD amounts consistently across the app
 * e.g.  fmtUSD(12.5)   → "$12.5000"
 *       fmtUSD(0)       → "$0.0000"
 */
export const fmtUSD = (amount = 0) =>
  `$${Number(amount).toFixed(2)}`

export const fmtUSDShort = (amount = 0) =>
  `$${Number(amount).toFixed(2)}`

/**
 * Format NGN amounts
 * e.g.  fmtNGN(136500) → "₦136,500.00"
 */
export const fmtNGN = (amount = 0) =>
  `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

/**
 * Convert USD → NGN using a given rate
 */
export const toNGN = (usd = 0, rate = 1365) =>
  +(usd * rate).toFixed(2)
