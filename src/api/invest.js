import api from './axios'

export const getProducts      = ()          => api.get('/invest/products')
export const buyProduct       = (productId) => api.post(`/invest/buy/${productId}`)
export const getMyInvestments = (params)    => api.get('/invest/my', { params })
export const claimDailyIncome = ()          => api.post('/invest/claim-income')