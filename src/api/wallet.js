import api from './axios'

export const getBalance      = ()       => api.get('/wallet/balance')
export const getTransactions = (params) => api.get('/wallet/transactions', { params })
