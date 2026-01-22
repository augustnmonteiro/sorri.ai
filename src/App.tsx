import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { TrafegoPage } from '@/pages/TrafegoPage'
import { HelpPage } from '@/pages/HelpPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ScriptPage } from '@/pages/ScriptPage'
import { VideoUploadPage } from '@/pages/VideoUploadPage'
import { RecordingGuidePage } from '@/pages/RecordingGuidePage'
import { RecordingChecklistPage } from '@/pages/RecordingChecklistPage'
import { Settings } from '@/pages/Settings'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { PaymentSuccess } from '@/pages/PaymentSuccess'
import { LoadingScreen } from '@/components/ui'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // Redirect logged-in users to appropriate page
  if (user) {
    // Admins go to admin dashboard
    if (profile?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    if (profile?.onboarding_completed) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Require Authentication */}
      <Route element={<AuthGuard />}>
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App Routes - Require Auth AND completed onboarding */}
        <Route element={<OnboardingGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/trafego" element={<TrafegoPage />} />
          <Route path="/dashboard/ajuda" element={<HelpPage />} />
          <Route path="/dashboard/:category" element={<Dashboard />} />
          <Route path="/script/:id" element={<ScriptPage />} />
          <Route path="/script/:id/upload" element={<VideoUploadPage />} />
          <Route path="/guia-gravacao" element={<RecordingGuidePage />} />
          <Route path="/checklist-gravacao" element={<RecordingChecklistPage />} />
          <Route path="/checklist-gravacao/:scriptId" element={<RecordingChecklistPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
        </Route>

        {/* Admin Routes - Require Admin role */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
