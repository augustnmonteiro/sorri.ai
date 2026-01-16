import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

export function IdealPatient() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>3/6</span>
          <span>Público-Alvo e Paciente Ideal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Quem é seu paciente ideal?
        </h1>
        <p className="text-lg text-gray-500">
          Descreva o perfil de quem você quer atrair
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perfil do paciente ideal
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: mulheres 30-45 anos, classe A/B, zona sul..."
            value={data.ideal_patient || ''}
            onChange={(e) => updateData({ ideal_patient: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Perfil, renda, cidade/bairro, hábitos
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais são as principais dores desse paciente?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: autoestima, medo de dentista, falta de tempo..."
            value={data.patient_pains || ''}
            onChange={(e) => updateData({ patient_pains: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Dor física, estética, autoestima, mastigação, medo, tempo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual a maior objeção antes de fechar?
          </label>
          <Input
            inputSize="lg"
            placeholder='Ex.: preço, medo, "vai doer?", "vai ficar artificial?"...'
            value={data.main_objection || ''}
            onChange={(e) => updateData({ main_objection: e.target.value })}
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
