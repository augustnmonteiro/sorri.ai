import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'

export function FocusProcedures() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>1/6</span>
          <span>Perfil e Posicionamento</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Quais procedimentos são seu foco?
        </h1>
        <p className="text-lg text-gray-500">
          Ex: harmonização, orto, implante, endo, estética, lentes, prótese
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <textarea
          placeholder="Descreva os procedimentos que você mais realiza e quer destacar..."
          value={data.focus_procedures || ''}
          onChange={(e) => updateData({ focus_procedures: e.target.value })}
          className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none resize-none h-32 text-lg"
        />
      </div>
    </OnboardingLayout>
  )
}
