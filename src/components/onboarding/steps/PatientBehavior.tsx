import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

export function PatientBehavior() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>3/6</span>
          <span>Publico-Alvo e Paciente Ideal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Comportamento do paciente
        </h1>
        <p className="text-lg text-gray-500">
          Entenda o que faz ele adiar ou perguntar
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O que costuma fazer o paciente adiar a decisao?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: medo do resultado, inseguranca financeira, falta de urgencia..."
            value={data.decision_delay_reason || ''}
            onChange={(e) => updateData({ decision_delay_reason: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais perguntas mais aparecem no direct/whats/recepcao?
          </label>
          <textarea
            placeholder="Ex.: Quanto custa? Doi muito? Quanto tempo demora? Aceita convenio?..."
            value={data.common_questions || ''}
            onChange={(e) => updateData({ common_questions: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors resize-none"
            rows={4}
          />
          <p className="mt-1 text-xs text-gray-400">
            Liste as duvidas mais frequentes que voce recebe
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
