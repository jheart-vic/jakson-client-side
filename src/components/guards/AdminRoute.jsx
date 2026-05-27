import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'

/**
 * Blocks non-admin users.
 * - Unauthenticated        → /admin/login
 * - Authenticated non-admin → /main/dashboard (not /admin/login — that caused the loop)
 * Accepts both 'admin' and 'superadmin' roles.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <Spinner fullscreen />

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  // Regular user on an admin route → send them to their own dashboard,
  // NOT to /admin/login (that caused the "login → admin login" loop)
  if (!isAdmin) return <Navigate to="/main/dashboard" replace />

  return children
}

export default AdminRoute