import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/ui'

export function OnboardingGuard() {
  const { profile, loading } = useAuth()

  console.log('[OnboardingGuard] loading:', loading, 'profile:', profile?.id, 'onboarding_completed:', profile?.onboarding_completed)

  if (loading) {
    return <LoadingScreen />
  }

  if (!profile?.onboarding_completed) {
    console.log('[OnboardingGuard] Redirecting to onboarding - profile missing or onboarding not completed')
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
