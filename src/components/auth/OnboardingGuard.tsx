import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui'

export function OnboardingGuard() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
