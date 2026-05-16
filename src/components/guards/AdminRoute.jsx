import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../common/Spinner'

/**
 * Blocks non-admin users → redirects to /main/dashboard
 * Accepts both 'admin' and 'superadmin' roles
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <Spinner fullscreen />

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    if (!isAdmin) return <Navigate to="/admin/login" replace />

  return children
}

export default AdminRoute
