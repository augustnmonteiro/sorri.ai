import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

export function Differentiator() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>1/6</span>
          <span>Perfil e Posicionamento</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          O que te diferencia?
        </h1>
        <p className="text-lg text-gray-500">
          Seu diferencial e como você quer ser lembrado
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual é seu diferencial real na prática?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: técnica, tecnologia, atendimento, rapidez, acolhimento..."
            value={data.real_differentiator || ''}
            onChange={(e) => updateData({ real_differentiator: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            O que seus pacientes mais elogiam em você?
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Como você quer ser lembrado?
          </label>
          <Input
            inputSize="lg"
            placeholder='Ex.: "o das lentes naturais", "o especialista em casos difíceis"'
            value={data.how_to_be_remembered || ''}
            onChange={(e) => updateData({ how_to_be_remembered: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Sua marca pessoal em uma frase
          </p>
        </div>
      </div>
    </OnboardingLayout>
  )
}
