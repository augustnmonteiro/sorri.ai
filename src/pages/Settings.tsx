import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_CONFIG } from '@/utils/constants'
import { supabase } from '@/lib/supabase'
import type { UserPlan } from '@/types'
import toast from 'react-hot-toast'

const PLAN_PRICES = {
  free: { monthly: 0 },
  pro: { monthly: 197 },
} as const

export function Settings() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'account' | 'plan'>('plan')
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = (profile?.plan || 'free') as UserPlan
  const planConfig = PLAN_CONFIG[currentPlan]
  const editsUsed = profile?.video_edits_this_month || 0

  const handleUpgrade = async () => {
    if (currentPlan === 'pro') {
      toast.error('Você já é assinante Pro')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/settings`,
        },
      })

      if (error) {
        throw new Error(error.message || 'Erro ao criar sessão de pagamento')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: `${window.location.origin}/settings`,
        },
      })

      if (error) {
        throw new Error(error.message || 'Erro ao abrir portal de assinatura')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao abrir portal')
    } finally {
      setIsLoading(false)
    }
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Edições este mês</p>
                    <p className="text-xl font-bold text-gray-900">
                      {editsUsed} / {planConfig.videoEditsPerMonth}
                    </p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((editsUsed / planConfig.videoEditsPerMonth) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Prazo de entrega</p>
                    <p className="text-xl font-bold text-gray-900">{planConfig.deliveryText}</p>
                  </div>
                </div>

                {/* Manage Subscription Button for Pro users */}
                {currentPlan === 'pro' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                    isLoading={isLoading}
                  >
                    Gerenciar Assinatura
                  </Button>
                )}
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
                      {PLAN_CONFIG.free.videoEditsPerMonth} edição por mês
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
                      {PLAN_CONFIG.free.ideasPerGeneration} ideias de roteiros
                    </li>
                  </ul>
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
                      {PLAN_CONFIG.pro.ideasPerGeneration} ideias de roteiros
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Suporte prioritário
                    </li>
                  </ul>
                  {currentPlan !== 'pro' && (
                    <Button
                      className="w-full"
                      onClick={handleUpgrade}
                      isLoading={isLoading}
                    >
                      Assinar Pro
                    </Button>
                  )}
                </div>

                {/* Enterprise Plan */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h4 className="text-lg font-bold">Enterprise</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Entre em contato e receba um orcamento personalizado.
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mais ideias de roteiros</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mais videos editados</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 text-sm">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Entrega em menos de 72h</span>
                    </li>
                  </ul>
                  <a
                    href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o plano Enterprise do Sorri.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Falar com Especialista
                  </a>
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
