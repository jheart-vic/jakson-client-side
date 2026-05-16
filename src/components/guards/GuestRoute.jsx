import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Blocks already-logged-in users from seeing login/register
 * → redirects them to their appropriate home
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return null

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/main/dashboard'} replace />
  }

  return children
}

export default GuestRoute
