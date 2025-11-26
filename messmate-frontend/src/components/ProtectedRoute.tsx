import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: Array<'student' | 'staff' | 'admin'>
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="muted">Checking permissions…</p>
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, requiredRole: allowedRoles?.[0] }}
      />
    )
  }

  return <>{children}</>
}

