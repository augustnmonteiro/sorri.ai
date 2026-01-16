import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { PROOF_TYPE_OPTIONS } from '@/utils/constants'
import { Input } from '@/components/ui'

export function ProofAndAuthority() {
  const { data, updateData } = useOnboarding()
  const selectedProofs = data.proof_types || []

  const toggleProof = (proof: string) => {
    const updated = selectedProofs.includes(proof)
      ? selectedProofs.filter((p) => p !== proof)
      : [...selectedProofs, proof]
    updateData({ proof_types: updated })
  }

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>5/6</span>
          <span>Prova e Autoridade</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Suas provas sociais
        </h1>
        <p className="text-lg text-gray-500">
          O que gera confiança nos pacientes
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Você tem videos com pacientes que autorizam o uso de imagem? (para depoimentos, casos clínicos...) 
          </label>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ has_authorized_cases: true })}
              className={`flex-1 p-4 rounded-2xl border-2 font-medium transition-all ${
                data.has_authorized_cases === true
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              Sim
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ has_authorized_cases: false })}
              className={`flex-1 p-4 rounded-2xl border-2 font-medium transition-all ${
                data.has_authorized_cases === false
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              Não
            </motion.button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Que tipos de prova você tem hoje?
          </label>
          <div className="flex flex-wrap gap-2">
            {PROOF_TYPE_OPTIONS.map((proof) => {
              const isSelected = selectedProofs.includes(proof)
              return (
                <motion.button
                  key={proof}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleProof(proof)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-light'
                  }`}
                >
                  {proof}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diferenciais técnicos que dão segurança
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: scanner, sedação, planejamento digital, microscópio, laser..."
            value={data.technical_differentiators || ''}
            onChange={(e) => updateData({ technical_differentiators: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conquistas que contam
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: 10 anos de atuação, especialização, docência..."
            value={data.achievements || ''}
            onChange={(e) => updateData({ achievements: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Anos de atuação, residência, especialização, cursos, congressos
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
