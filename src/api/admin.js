import api from './axios'

// Dashboard
export const getDashboard      = ()      => api.get('/admin/dashboard')

// Products
export const adminGetProducts  = (p)     => api.get('/admin/products', { params: p })
export const adminCreateProduct= (data)  => api.post('/admin/products', data)
export const adminUpdateProduct= (id, d) => api.put(`/admin/products/${id}`, d)
export const adminDeleteProduct= (id)    => api.delete(`/admin/products/${id}`)

// Users
export const adminGetUsers     = (p)     => api.get('/admin/users', { params: p })
export const adminGetUser      = (id)    => api.get(`/admin/users/${id}`)
export const adminSuspendUser  = (id, r) => api.put(`/admin/users/${id}/suspend`, { reason: r })
export const adminUnsuspendUser= (id)    => api.put(`/admin/users/${id}/unsuspend`)
export const adminLoginAsUser  = (id)    => api.post(`/admin/users/${id}/login-as`)
export const adminAssignRole   = (id, r) => api.put(`/admin/users/${id}/role`, { role: r })
export const adminCreditWallet = (id, d) => api.post(`/admin/users/${id}/credit`, d)
export const adminDeductWallet = (id, d) => api.post(`/admin/users/${id}/deduct`, d)

// Deposits
export const adminGetDeposits  = (p)     => api.get('/admin/deposits', { params: p })
export const adminApproveDeposit=(id)    => api.put(`/admin/deposits/${id}/approve`)
export const adminRejectDeposit= (id, r) => api.put(`/admin/deposits/${id}/reject`, { reason: r })

// Withdrawals
export const adminApproveWithdrawal=(id) => api.put(`/admin/withdraw/${id}/approve`)
export const adminRejectWithdrawal=(id,r)=> api.put(`/admin/withdraw/${id}/reject`, { reason: r })

// Settings
export const adminGetSettings  = ()      => api.get('/admin/settings')
export const adminUpdateSetting= (k, v)  => api.put('/admin/settings', { key: k, value: v })
