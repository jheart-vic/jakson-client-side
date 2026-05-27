import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return null

  if (isAuthenticated) {
    const isAdminPage = pathname.startsWith('/admin')

    // Admin visiting any admin guest page (login) → admin dashboard
    if (isAdmin && isAdminPage)  return <Navigate to="/admin/dashboard" replace />

    // Admin visiting a user guest page (login/register) → admin dashboard
    if (isAdmin && !isAdminPage) return <Navigate to="/admin/dashboard" replace />

    // Regular user visiting a user guest page → user dashboard
    if (!isAdmin && !isAdminPage) return <Navigate to="/main/dashboard" replace />

    // Regular user visiting an admin guest page → user dashboard
    // (previously fell through to `return children`, showing them AdminLogin)
    if (!isAdmin && isAdminPage) return <Navigate to="/main/dashboard" replace />
  }

  return children
}

export default GuestRoute