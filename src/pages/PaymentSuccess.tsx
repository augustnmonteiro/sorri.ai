import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export function PaymentSuccess() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Prevent multiple calls due to strict mode or re-renders
    if (hasRefreshed.current) return
    hasRefreshed.current = true

    const updateProfile = async () => {
      try {
        // Give Stripe webhook time to process
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Refresh user profile to get updated plan (with timeout)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )

        await Promise.race([refreshProfile(), timeoutPromise])
      } catch (error) {
        console.error('Error refreshing profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    updateProfile()
  }, [refreshProfile])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processando pagamento...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos seu pagamento.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              Parabens! Agora voce e assinante Pro e tem acesso a todos os beneficios.
            </p>

            <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-primary mb-2">Seus beneficios Pro:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  4 videos editados por mes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Entrega em ate 72 horas
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30 ideias de roteiros por geracao
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Suporte prioritario
                </li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Ir para o Dashboard
            </Button>
          </>
        )}
      </motion.div>
    </div>
  )
}
