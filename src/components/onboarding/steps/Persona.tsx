import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { PERSONA_OPTIONS } from '@/utils/constants'

export function Persona() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>2/6</span>
          <span>Tom de Voz e Identidade</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Como você aparece melhor?
        </h1>
        <p className="text-lg text-gray-500">
          Escolha seu estilo de comunicação
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        {PERSONA_OPTIONS.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateData({ persona: option.value })}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
              data.persona === option.value
                ? 'border-primary bg-primary-50 shadow-glow'
                : 'border-gray-200 bg-white hover:border-primary-light'
            }`}
          >
            <span className="text-4xl">{option.emoji}</span>
            <div className="flex-1">
              <span className={`block font-bold text-lg ${
                data.persona === option.value ? 'text-primary' : 'text-gray-700'
              }`}>
                {option.label}
              </span>
              <span className="text-sm text-gray-500">{option.description}</span>
            </div>
            {data.persona === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
