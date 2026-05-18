// import axios from 'axios'
// import toast from 'react-hot-toast'

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 15000,
// })

// // ── Request: attach token ────────────────────────────────
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // ── Response: handle global errors ──────────────────────
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status  = err.response?.status
//     const message = err.response?.data?.message || 'Something went wrong'

//     if (status === 401) {
//       // Token expired or invalid — clear and redirect to login
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//       return Promise.reject(err)
//     }

//     if (status === 403) {
//       toast.error(message)
//       return Promise.reject(err)
//     }

//     if (status === 429) {
//       toast.error('Too many requests. Please slow down.')
//       return Promise.reject(err)
//     }

//     // All other errors are handled by the calling function
//     return Promise.reject(err)
//   }
// )

// export default api

import axios from 'axios'
import toast from 'react-hot-toast'

// Global request counter (can be connected to LoadingContext)
let activeRequests = 0
const requestStartCallbacks = []
const requestEndCallbacks = []

export const onRequestStart = (cb) => requestStartCallbacks.push(cb)
export const onRequestEnd = (cb) => requestEndCallbacks.push(cb)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor
api.interceptors.request.use((config) => {
  activeRequests++
  requestStartCallbacks.forEach(cb => cb())

  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => {
  activeRequests = Math.max(0, activeRequests - 1)
  requestEndCallbacks.forEach(cb => cb())
  return Promise.reject(error)
})

// Response interceptor
api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())
    return response
  },
  (err) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())

    const status = err.response?.status
    const message = err.response?.data?.message || 'Something went wrong'

    // Network error (offline / timeout)
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      toast.error('Network timeout or no connection. Please check your internet and try again.', {
        duration: 5000,
      })
      return Promise.reject(err)
    }

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    if (status === 403) {
      toast.error(message)
      return Promise.reject(err)
    }

    if (status === 429) {
      toast.error('Too many requests. Please slow down.')
      return Promise.reject(err)
    }

    // For other errors, show the message
    if (message && status !== 401) {
      toast.error(message)
    }

    return Promise.reject(err)
  }
)

export default api