import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../context/store'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={`/login?next=${location.pathname}`} replace />
  }
  return children
}
