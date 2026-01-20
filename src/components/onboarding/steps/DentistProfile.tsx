import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { SPECIALTIES } from '@/utils/constants'
import { Input } from '@/components/ui'

export function DentistProfile() {
  const { data, updateData } = useOnboarding()

  const selectedSpecialties = data.main_specialty || []

  const handleSelect = (specialtyName: string) => {
    const isSelected = selectedSpecialties.includes(specialtyName)

    if (isSelected) {
      updateData({ main_specialty: selectedSpecialties.filter(s => s !== specialtyName) })
    } else if (selectedSpecialties.length < 2) {
      updateData({ main_specialty: [...selectedSpecialties, specialtyName] })
    }
  }

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>1/6</span>
          <span>Perfil e Posicionamento</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Qual é sua especialidade?
        </h1>
        <p className="text-lg text-gray-500">
          Selecione até 2 especialidades ({selectedSpecialties.length}/2)
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIALTIES.map((specialty, index) => {
            const isSelected = selectedSpecialties.includes(specialty.name)
            const isDisabled = !isSelected && selectedSpecialties.length >= 2

            return (
              <motion.button
                key={specialty.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                onClick={() => handleSelect(specialty.name)}
                disabled={isDisabled}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-50 shadow-glow'
                    : isDisabled
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-primary-light'
                }`}
              >
                <span className="text-2xl mb-1 block">{specialty.icon}</span>
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-primary' : 'text-gray-700'
                }`}>
                  {specialty.name_pt}
                </span>
              </motion.button>
            )
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais procedimentos sao seu foco?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: harmonizacao, orto, implante, lentes..."
            value={data.focus_procedures || ''}
            onChange={(e) => updateData({ focus_procedures: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Separe por virgula os procedimentos que voce mais realiza
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
