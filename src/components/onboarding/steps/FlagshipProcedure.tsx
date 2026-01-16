import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

export function FlagshipProcedure() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>6/6</span>
          <span>Diferenciação</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Seu carro-chefe
        </h1>
        <p className="text-lg text-gray-500">
          Procedimento principal e mitos a quebrar
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual procedimento é seu carro-chefe?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: lentes de contato dental"
            value={data.flagship_procedure || ''}
            onChange={(e) => updateData({ flagship_procedure: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual seu maior medo na comunicação dele?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: parecer vendedor, exagerar nos resultados..."
            value={data.flagship_fear || ''}
            onChange={(e) => updateData({ flagship_fear: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual mito do seu nicho você quer quebrar?
          </label>
          <textarea
            placeholder='Ex.: "lente estraga dente", "implante dói", "canal é horrível"...'
            value={data.myth_to_break || ''}
            onChange={(e) => updateData({ myth_to_break: e.target.value })}
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none resize-none h-24 text-base"
          />
          <p className="mt-1 text-xs text-gray-400">
            Crenças erradas que seus pacientes costumam ter
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual história sua cria conexão?
          </label>
          <textarea
            placeholder="Por que virou dentista? Qual sua causa? O que tem por trás do jaleco?"
            value={data.connection_story || ''}
            onChange={(e) => updateData({ connection_story: e.target.value })}
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none resize-none h-24 text-base"
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
