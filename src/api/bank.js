import api from './axios'

export const getBankList     = ()     => api.get('/bank/list')
export const getBankAccounts = ()     => api.get('/bank/accounts')
export const bindBankAccount = (data) => api.post('/bank/bind', data)
