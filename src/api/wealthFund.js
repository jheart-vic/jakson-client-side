import api from './axios'

export const getWealthFunds = async () => {
  const { data } = await api.get('/wealth-fund')
  // The API returns: { success: true, funds: [...] }
  return data.funds   // ← important: return the array directly
}

export const buyWealthFund = async (fundId) => {
  const { data } = await api.post(`/wealth-fund/buy/${fundId}`)
  return data
}

export const getMyWealthFunds = async () => {
  const { data } = await api.get('/wealth-fund/my')
  return data.funds
}

export const claimWealthFund = async (investmentId) => {
  const { data } = await api.post(`/wealth-fund/claim/${investmentId}`)
  return data
}