import api from './axios'

export const redeemCode   = (code)  => api.post('/reward/redeem', { code })
export const dailyCheckin = ()      => api.post('/checkin')
