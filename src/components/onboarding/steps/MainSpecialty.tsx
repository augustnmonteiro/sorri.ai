import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { SPECIALTIES } from '@/utils/constants'

export function MainSpecialty() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>1/6</span>
          <span>Perfil e Posicionamento</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Qual é sua especialidade principal?
        </h1>
        <p className="text-lg text-gray-500">
          Selecione o foco principal da sua atuação
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SPECIALTIES.map((specialty, index) => (
          <motion.button
            key={specialty.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateData({ main_specialty: specialty.name })}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              data.main_specialty === specialty.name
                ? 'border-primary bg-primary-50 shadow-glow'
                : 'border-gray-200 bg-white hover:border-primary-light'
            }`}
          >
            <span className="text-3xl mb-2 block">{specialty.icon}</span>
            <span className={`font-semibold ${
              data.main_specialty === specialty.name ? 'text-primary' : 'text-gray-700'
            }`}>
              {specialty.name_pt}
            </span>
          </motion.button>
        ))}
      </div>
    </OnboardingLayout>
  )
}
