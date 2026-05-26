import api from './axios'

export const getCaptcha           = ()       => api.get('/auth/captcha')
export const getSecurityQuestions = ()       => api.get('/auth/security-questions')
export const getSecurityQuestion  = (phone)  => api.get(`/auth/security-question/${phone}`)

export const register   = (data) => api.post('/auth/register', data)
export const login      = (data) => api.post('/auth/login', data)
export const adminLogin = (data) => api.post('/auth/admin/login', data)

export const getMe                  = ()     => api.get('/auth/me')
export const updateProfile          = (data) => api.put('/auth/profile', data)
export const changePassword         = (data) => api.put('/auth/change-password', data)
export const changeWithdrawPassword = (data) => api.put('/auth/withdraw-password', data)
export const forgotPassword         = (data) => api.post('/auth/forgot-password', data)
export const resetPassword          = (data) => api.post('/auth/reset-password', data)
export const verifyPassword = (data) => api.post('/auth/verify-password', data)


export const refreshToken = () => api.post('/auth/refresh')
export const logout       = () => api.post('/auth/logout')