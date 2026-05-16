import api from './axios'

export const createWithdrawal  = (data)   => api.post('/withdraw', data)
export const getWithdrawalLog  = (params) => api.get('/withdraw/log', { params })
