import axios from 'axios'
import toast from 'react-hot-toast'

// ── Dedup toasts ──────────────────────────────────────────────────────────
const recentToasts = new Map()
const dedupedToastError = (msg, opts = {}) => {
  const now = Date.now()
  if (recentToasts.has(msg) && now - recentToasts.get(msg) < 3000) return
  recentToasts.set(msg, now)
  toast.error(msg, opts)
}

// ── Request counter (for GlobalLoader) ───────────────────────────────────
let activeRequests = 0
const requestStartCallbacks = []
const requestEndCallbacks   = []
export const onRequestStart = (cb) => requestStartCallbacks.push(cb)
export const onRequestEnd   = (cb) => requestEndCallbacks.push(cb)

// ── Auth pages ────────────────────────────────────────────────────────────
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/admin/login']
const onAuthPage = () => AUTH_PATHS.some(p => window.location.pathname.startsWith(p))

const redirectToLogin = () => {
  if (onAuthPage()) return
  localStorage.removeItem('user')
  const isAdmin = window.location.pathname.startsWith('/admin')
  window.location.href = isAdmin ? '/admin/login' : '/login'
}

// ── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL:         import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
  timeout:         30000,
})

// ── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    activeRequests++
    requestStartCallbacks.forEach(cb => cb())
    return config
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())
    return Promise.reject(error)
  }
)

// ── Silent refresh state ──────────────────────────────────────────────────
let isRefreshing = false
let failedQueue  = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve())
  failedQueue = []
}

// ── Response interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())
    return response
  },
  async (err) => {
    activeRequests = Math.max(0, activeRequests - 1)
    requestEndCallbacks.forEach(cb => cb())

    const status          = err.response?.status
    const message         = err.response?.data?.message || 'Something went wrong'
    const originalRequest = err.config

    // ── Network / timeout ─────────────────────────────────────────────────
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      err.isNetworkError = true
      err.isHandled      = true
      dedupedToastError(
        'Network timeout or no connection. Please check your internet and try again.',
        { duration: 5000 }
      )
      return Promise.reject(err)
    }

    // ── 401 handling ──────────────────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {

      // On auth pages — toast the error, skip refresh
      if (onAuthPage()) {
        err.isHandled = true
        dedupedToastError(message)
        return Promise.reject(err)
      }

      // No cached user — not logged in, skip refresh
      if (!localStorage.getItem('user')) {
        return Promise.reject(err)
      }

      // Don't refresh the refresh endpoint itself
      const url = originalRequest.url || ''
      if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
        redirectToLogin()
        return Promise.reject(err)
      }

      // Another refresh already in flight — queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch(e  => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing           = true

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        processQueue(null)
        isRefreshing = false
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr)
        isRefreshing = false
        localStorage.removeItem('user')
        redirectToLogin()
        return Promise.reject(refreshErr)
      }
    }

    // ── 403 ───────────────────────────────────────────────────────────────
    if (status === 403) {
      err.isHandled = true
      dedupedToastError(message)
      return Promise.reject(err)
    }

    // ── 429 ───────────────────────────────────────────────────────────────
    if (status === 429) {
      err.isHandled = true
      if (!onAuthPage()) {
        dedupedToastError(message || 'Too many requests. Please slow down.')
      }
      return Promise.reject(err)
    }

    // ── Other errors ──────────────────────────────────────────────────────
    if (status) {
      err.isHandled = true
      dedupedToastError(message)
    }

    return Promise.reject(err)
  }
)

export default api