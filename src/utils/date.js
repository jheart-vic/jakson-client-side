/**
 * Format ISO date strings for display
 */
export const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export const fmtDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const fmtDateShort = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    month: 'short', day: 'numeric',
  })
}

/** Days remaining from now until an expiry date */
export const daysRemaining = (expiryIso) => {
  if (!expiryIso) return 0
  const diff = new Date(expiryIso) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
