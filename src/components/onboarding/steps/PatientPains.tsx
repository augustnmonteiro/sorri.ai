import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

export function PatientPains() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>3/6</span>
          <span>Público-Alvo e Paciente Ideal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Entendendo seu paciente
        </h1>
        <p className="text-lg text-gray-500">
          Objeções, adiamentos e dúvidas frequentes
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O que faz o paciente adiar a decisão?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: medo, incerteza, falta de urgência..."
            value={data.decision_delay_reason || ''}
            onChange={(e) => updateData({ decision_delay_reason: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perguntas mais frequentes no direct/whats/recepção
          </label>
          <textarea
            placeholder="Quais dúvidas seus pacientes mais fazem antes de agendar?"
            value={data.common_questions || ''}
            onChange={(e) => updateData({ common_questions: e.target.value })}
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none resize-none h-28 text-base"
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
