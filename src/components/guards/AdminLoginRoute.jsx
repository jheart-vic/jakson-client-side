import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'

/**
 * Guard specifically for /admin/login.
 * - Loading                  → spinner
 * - Authenticated admin      → /admin/dashboard
 * - Authenticated regular user → /main/dashboard  ← the bug (was showing AdminLogin)
 * - Unauthenticated          → renders children (AdminLogin form)
 */
const AdminLoginRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <Spinner fullscreen />
  if (isAuthenticated && isAdmin)  return <Navigate to="/admin/dashboard" replace />
  if (isAuthenticated && !isAdmin) return <Navigate to="/main/dashboard" replace />

  return children
}

export default AdminLoginRoute