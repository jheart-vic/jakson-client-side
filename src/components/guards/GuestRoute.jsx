import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'


const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return null

  if (isAuthenticated) {
    const isAdminPage = pathname.startsWith('/admin')

    // Admin on admin login → already logged in, go to admin dashboard
    if (isAdmin && isAdminPage) {
      return <Navigate to="/admin/dashboard" replace />
    }

    // Regular user on user login → go to user dashboard
    if (!isAdmin && !isAdminPage) {
      return <Navigate to="/main/dashboard" replace />
    }

  }

  return children
}

export default GuestRoute