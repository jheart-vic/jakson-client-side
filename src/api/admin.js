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


// ── Deposits ───────────────────────────────────────────────
export const adminGetDeposits = (params) => api.get('/admin/deposits', { params })
export const adminApproveDeposit = (id) => api.put(`/admin/deposits/${id}/approve`)
export const adminRejectDeposit = (id, reason) => api.put(`/admin/deposits/${id}/reject`, { reason })

// ── Withdrawals ────────────────────────────────────────────
export const adminGetWithdrawals = (params) => api.get('/admin/withdrawals', { params })
export const adminApproveWithdrawal = (id) => api.put(`/admin/withdrawals/${id}/approve`)
export const adminRejectWithdrawal = (id, reason) => api.put(`/admin/withdrawals/${id}/reject`, { reason })

// ── Settings ───────────────────────────────────────────────
export const adminGetSettings = () => api.get('/admin/settings')
export const adminUpdateSetting = (key, value) => api.put('/admin/settings', { key, value })

// Wealth Funds
export const adminGetWealthFunds = (params) => api.get('/admin/wealth-funds', { params })
export const adminCreateWealthFund = (data) => api.post('/admin/wealth-funds', data)
export const adminUpdateWealthFund = (id, data) => api.put(`/admin/wealth-funds/${id}`, data)
export const adminDeleteWealthFund = (id) => api.delete(`/admin/wealth-funds/${id}`)
export const adminExitImpersonation = () => api.post('/admin/users/exit-impersonation')
// export const adminDeactivateWealthFund = (id) => api.patch(`/admin/wealth-funds/${id}/deactivate`)

// ── Bonus Codes ────────────────────────────────────────────
export const adminGetBonusCodes    = ()        => api.get('/admin/bonus-codes')
export const adminCreateBonusCode  = (data)    => api.post('/admin/bonus-codes', data)
export const adminToggleBonusCode  = (id)      => api.put(`/admin/bonus-codes/${id}/toggle`)
export const adminDeleteBonusCode  = (id)      => api.delete(`/admin/bonus-codes/${id}`)

// ── Notifications / Announcements ─────────────────────────
export const adminGetNotifications    = ()          => api.get('/admin/notifications')
export const adminCreateNotification  = (data)      => api.post('/admin/notifications', data)
export const adminUpdateNotification  = (id, data)  => api.put(`/admin/notifications/${id}`, data)
export const adminDeleteNotification  = (id)        => api.delete(`/admin/notifications/${id}`)