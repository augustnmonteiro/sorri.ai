import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Input } from '@/components/ui'

function formatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''
  const amount = parseInt(numbers, 10)
  return `R$ ${amount.toLocaleString('pt-BR')}`
}

export function PriorityProcedures() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>4/6</span>
          <span>Serviços e Agenda</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Serviços que dão lucro
        </h1>
        <p className="text-lg text-gray-500">
          Foco nos próximos 30-90 dias
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais procedimentos você quer lotar agenda?
          </label>
          <textarea
            placeholder="Ex.: lentes de contato, implantes, harmonização..."
            value={data.priority_procedures || ''}
            onChange={(e) => updateData({ priority_procedures: e.target.value })}
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none resize-none h-24 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Procedimentos que faz mas NÃO quer divulgar
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: extração simples, limpeza..."
            value={data.procedures_to_hide || ''}
            onChange={(e) => updateData({ procedures_to_hide: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Opcional - serviços que prefere não destacar
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket médio atual
            </label>
            <Input
              inputSize="lg"
              placeholder="Ex.: R$ 3.000"
              value={data.current_ticket || ''}
              onChange={(e) => updateData({ current_ticket: formatCurrency(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket que quer alcançar
            </label>
            <Input
              inputSize="lg"
              placeholder="Ex.: R$ 8.000"
              value={data.target_ticket || ''}
              onChange={(e) => updateData({ target_ticket: formatCurrency(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
