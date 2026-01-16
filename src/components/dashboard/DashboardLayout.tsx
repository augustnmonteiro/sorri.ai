import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_CONFIG } from '@/utils/constants'
import logo from '@/assets/images/logo.png'
import type { UserPlan } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, profile } = useAuth()

  const userPlan = (profile?.plan || 'free') as UserPlan
  const planConfig = PLAN_CONFIG[userPlan]

  const navItems = [
    {
      key: 'roteiros',
      label: 'Roteiros',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'trafego',
      label: 'Tráfego',
      path: '/dashboard/trafego',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      key: 'ajuda',
      label: 'Ajuda',
      path: '/dashboard/ajuda',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      // Roteiros tab is active for /dashboard and /dashboard/:category (but not trafego/ajuda)
      return location.pathname === '/dashboard' ||
        (location.pathname.startsWith('/dashboard/') &&
         !location.pathname.includes('trafego') &&
         !location.pathname.includes('ajuda'))
    }
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Sorri.AI"
              className="h-8 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <button
              onClick={() => navigate('/settings')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 ${
                userPlan === 'pro'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : userPlan === 'lite'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {planConfig.name}
            </button>

            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center">
                {profile?.full_name?.charAt(0) || 'U'}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'Usuário'}</p>
                  <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                </div>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </button>
                <button
                  onClick={signOut}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-3 px-4 transition-colors ${
                  active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.icon}
                <span className={`text-xs mt-1 ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
