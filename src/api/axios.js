import axios from 'axios'
import toast from 'react-hot-toast'

// Global request counter (only for requests that count)
let activeRequests = 0
const requestStartCallbacks = []
const requestEndCallbacks = []

export const onRequestStart = (cb) => requestStartCallbacks.push(cb)
export const onRequestEnd = (cb) => requestEndCallbacks.push(cb)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  // Only count this request if it should trigger the global loader
  if (!config.skipGlobalLoader) {
    config._counted = true
    activeRequests++
    requestStartCallbacks.forEach(cb => cb())
  } else {
    config._counted = false
  }

  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => {
  // If the error happened before the request was sent, we can't check config
  // but in practice this rarely happens. We'll just decrement safely.
  if (error.config?._counted) {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())
  }
  return Promise.reject(error)
})

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.config?._counted) {
      activeRequests = Math.max(0, activeRequests - 1)
      requestEndCallbacks.forEach(cb => cb())
    }
    return response
  },
  (err) => {
    // Only decrement if this request was counted
    if (err.config?._counted) {
      activeRequests = Math.max(0, activeRequests - 1)
      requestEndCallbacks.forEach(cb => cb())
    }

    const status = err.response?.status
    const message = err.response?.data?.message || 'Something went wrong'

    // Network error (offline / timeout) – mark it so components can skip their own toast
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      err.isNetworkError = true   // <-- add flag
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

    // For other errors, show the message (only if it's not a network error)
    if (message && status !== 401) {
      toast.error(message)
    }

    return Promise.reject(err)
  }
)

export default api