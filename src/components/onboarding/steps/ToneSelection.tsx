import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { TONE_OPTIONS } from '@/utils/constants'
import { Input } from '@/components/ui'
import type { ToneOption } from '@/types'

export function ToneSelection() {
  const { data, updateData } = useOnboarding()
  const selectedTones = data.tone_of_voice || []

  const toggleTone = (tone: ToneOption) => {
    const updated = selectedTones.includes(tone)
      ? selectedTones.filter((t) => t !== tone)
      : selectedTones.length < 3
        ? [...selectedTones, tone]
        : selectedTones
    updateData({ tone_of_voice: updated })
  }

  const remaining = 2 - selectedTones.length
  const nextLabel = remaining > 0
    ? `Selecione mais ${remaining} para continuar`
    : 'Continuar'

  return (
    <OnboardingLayout nextLabel={nextLabel}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>2/6</span>
          <span>Tom de Voz e Identidade</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Qual tom de voz combina com você?
        </h1>
        <p className="text-lg text-gray-500">
          Escolha 2-3 opções que definem sua comunicação
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto mb-8">
        {TONE_OPTIONS.map((option, index) => {
          const isSelected = selectedTones.includes(option.value)
          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTone(option.value)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-primary bg-primary-50 shadow-glow'
                  : 'border-gray-200 bg-white hover:border-primary-light'
              }`}
            >
              <span className="text-4xl">{option.emoji}</span>
              <div className="flex-1">
                <span className={`block font-bold text-lg ${
                  isSelected ? 'text-primary' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
                <span className="text-sm text-gray-500">{option.description}</span>
              </div>
              {isSelected && (
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
          )
        })}
      </div>

      <div className="max-w-lg mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Linguagens que você NÃO quer usar
        </label>
        <Input
          inputSize="lg"
          placeholder='Ex.: "milagre", "promoção", "gatilhos agressivos"...'
          value={data.language_to_avoid || ''}
          onChange={(e) => updateData({ language_to_avoid: e.target.value })}
        />
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">
        Selecionados: {selectedTones.length}/3
      </p>
    </OnboardingLayout>
  )
}
