import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui'

export function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log('[AuthGuard] loading:', loading, 'user:', user?.id)

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
