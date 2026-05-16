import api from './axios'

export const createDeposit  = (data)   => api.post('/deposit', data)
export const getDepositLog  = (params) => api.get('/deposit/log', { params })
