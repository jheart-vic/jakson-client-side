/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'
import { storage } from '../utils/storage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => storage.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      // ── KEY FIX: if nothing is cached there is no session to validate.
      // Skip getMe() entirely — avoids triggering the 401 → refresh → loop
      // on public pages (login, register, forgot-password).
      if (!storage.getUser()) {
        setLoading(false)
        return
      }

      try {
        const { data } = await getMe()
        setUser(data.user)
        storage.setUser(data.user)
      } catch (err) {
        const isAuthError = err?.response?.status === 401 || err?.response?.status === 403
        if (isAuthError) {
          storage.removeUser()
          setUser(null)
        }
        // Network errors: keep cached user — don't log them out
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line

  const login = useCallback((user) => {
    storage.setUser(user)
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    try { await apiLogout() } catch { /* cookies may already be gone */ }
    storage.removeUser()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe()
      setUser(data.user)
      storage.setUser(data.user)
      return data.user
    } catch { /* interceptor handles */ }
  }, [])

  const isAuthenticated = !!user
  const isAdmin         = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperAdmin    = user?.role === 'superadmin'

  return (
    <AuthContext.Provider value={{
      user, loading,
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