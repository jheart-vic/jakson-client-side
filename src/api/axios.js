import axios from 'axios'
import toast from 'react-hot-toast'

// ── Dedup: prevent the same message from toasting twice within 800ms ──
const recentToasts = new Map()
const dedupedToastError = (msg, opts = {}) => {
  const now = Date.now()
  if (recentToasts.has(msg) && now - recentToasts.get(msg) < 800) return
  recentToasts.set(msg, now)
  toast.error(msg, opts)
}

// Global request counter
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

// ── Request interceptor ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    activeRequests++
    requestStartCallbacks.forEach((cb) => cb())
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach((cb) => cb())
    return Promise.reject(error)
  }
)

// ── Response interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach((cb) => cb())
    return response
  },
  (err) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach((cb) => cb())

    const status = err.response?.status
    const message = err.response?.data?.message || 'Something went wrong'

    // ── Network / timeout errors ─────────────────────────────────
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      err.isNetworkError = true
      err.isHandled = true
      dedupedToastError(
        'Network timeout or no connection. Please check your internet and try again.',
        { duration: 5000 }
      )
      return Promise.reject(err)
    }

    // ── Auth expired ─────────────────────────────────────────────
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      err.isHandled = true
      return Promise.reject(err)
    }

    // ── Forbidden ────────────────────────────────────────────────
    if (status === 403) {
      err.isHandled = true
      dedupedToastError(message)
      return Promise.reject(err)
    }

    // ── Rate limited ─────────────────────────────────────────────
    if (status === 429) {
      err.isHandled = true
      dedupedToastError('Too many requests. Please slow down.')
      return Promise.reject(err)
    }

    // ── All other server errors: mark handled so pages don't re-toast ──
    if (status) {
      err.isHandled = true
      dedupedToastError(message)
    }

    return Promise.reject(err)
  }
)

export default api
