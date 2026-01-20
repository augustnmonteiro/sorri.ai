import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_CONFIG } from '@/utils/constants'
import type { UserPlan } from '@/types'
import toast from 'react-hot-toast'

const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 197, yearly: 1970 },
} as const

export function Settings() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'account' | 'plan'>('plan')

  const currentPlan = (profile?.plan || 'free') as UserPlan
  const planConfig = PLAN_CONFIG[currentPlan]
  const editsUsed = profile?.video_edits_this_month || 0

  const handleUpgrade = (plan: UserPlan) => {
    if (plan === currentPlan) {
      toast.error('Você já está neste plano')
      return
    }
    // TODO: Integrate with payment provider (Stripe)
    toast.success(`Redirecionando para pagamento do plano ${PLAN_CONFIG[plan].name}...`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-900">Configurações</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'plan'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Plano
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'account'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Conta
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {activeTab === 'plan' ? (
            <>
              {/* Current Plan */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Plano atual</p>
                    <h2 className="text-2xl font-bold text-gray-900">{planConfig.name}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPlan === 'pro' ? 'bg-primary-100 text-primary' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {currentPlan === 'free' ? 'Gratuito' : 'Ativo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Edições este mês</p>
                    <p className="text-xl font-bold text-gray-900">
                      {editsUsed} / {planConfig.videoEditsPerMonth}
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(editsUsed / planConfig.videoEditsPerMonth) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Prazo de entrega</p>
                    <p className="text-xl font-bold text-gray-900">{planConfig.deliveryText}</p>
                  </div>
                </div>
              </div>

              {/* Plan Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Escolha seu plano</h3>

                {/* Free Plan */}
                <div className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  currentPlan === 'free' ? 'border-primary' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">Free</h4>
                        {currentPlan === 'free' && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary text-xs font-medium rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Para começar</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">R$ 0</p>
                      <p className="text-sm text-gray-500">/mês</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {PLAN_CONFIG.free.videoEditsPerMonth} edições por mês
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Entrega em {PLAN_CONFIG.free.deliveryText}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Roteiros ilimitados
                    </li>
                  </ul>
                  {currentPlan !== 'free' && (
                    <Button variant="outline" className="w-full" onClick={() => handleUpgrade('free')}>
                      Fazer Downgrade
                    </Button>
                  )}
                </div>

                {/* Pro Plan */}
                <div className={`bg-white rounded-2xl p-6 border-2 relative overflow-hidden transition-all ${
                  currentPlan === 'pro' ? 'border-primary' : 'border-gray-200'
                }`}>
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Mais Popular
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">Pro</h4>
                        {currentPlan === 'pro' && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary text-xs font-medium rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Para profissionais</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">R$ {PLAN_PRICES.pro.monthly}</p>
                      <p className="text-sm text-gray-500">/mês</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {PLAN_CONFIG.pro.videoEditsPerMonth} edições por mês
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Entrega em {PLAN_CONFIG.pro.deliveryText}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Roteiros ilimitados
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Suporte prioritário 24/7
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Revisões ilimitadas
                    </li>
                  </ul>
                  {currentPlan !== 'pro' && (
                    <Button className="w-full" onClick={() => handleUpgrade('pro')}>
                      Assinar Pro
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Account Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Informações da conta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Nome</label>
                    <p className="text-gray-900 font-medium">{profile?.full_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl p-6 border border-red-200">
                <h3 className="font-semibold text-red-600 mb-4">Zona de perigo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ao sair da conta, você precisará fazer login novamente para acessar seus roteiros.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={signOut}
                >
                  Sair da conta
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
