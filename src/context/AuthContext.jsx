import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMe } from '../api/auth'
import { storage } from '../utils/storage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => storage.getUser())
  const [token,   setToken]   = useState(() => storage.getToken())
  const [loading, setLoading] = useState(true)  // initial auth check

  // ── Sync user from server on mount if token exists ──────
  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return }
      try {
        const { data } = await getMe()
        const fresh = data.user
        setUser(fresh)
        storage.setUser(fresh)
      } catch {
        // Token invalid — clear everything
        storage.clear()
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line

  // ── Login ────────────────────────────────────────────────
  const login = useCallback((token, user) => {
    storage.setToken(token)
    storage.setUser(user)
    setToken(token)
    setUser(user)
  }, [])

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    storage.clear()
    setToken(null)
    setUser(null)
  }, [])

  // ── Refresh user from server ─────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe()
      setUser(data.user)
      storage.setUser(data.user)
      return data.user
    } catch { /* handled by interceptor */ }
  }, [])

  // ── Role helpers ─────────────────────────────────────────
  const isAuthenticated = !!token && !!user
  const isAdmin         = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperAdmin    = user?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, refreshUser,
      isAuthenticated, isAdmin, isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const useAuth = useAuthContext
