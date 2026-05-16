import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request: attach token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: handle global errors ──────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const message = err.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      // Token expired or invalid — clear and redirect to login
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

    // All other errors are handled by the calling function
    return Promise.reject(err)
  }
)

export default api
