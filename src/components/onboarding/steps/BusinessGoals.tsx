import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { BOTTLENECK_OPTIONS } from '@/utils/constants'
import { Input } from '@/components/ui'

export function BusinessGoals() {
  const { data, updateData } = useOnboarding()

  return (
    <OnboardingLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary text-sm font-medium rounded-full mb-4">
          <span>4/6</span>
          <span>Servicos e Agenda</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          O que voce quer lotar?
        </h1>
        <p className="text-lg text-gray-500">
          Procedimentos prioritarios nos proximos 30-90 dias
        </p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais procedimentos voce quer lotar agenda?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: lentes, implantes, clareamento..."
            value={data.priority_procedures || ''}
            onChange={(e) => updateData({ priority_procedures: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quais procedimentos voce faz mas NAO quer divulgar?
          </label>
          <Input
            inputSize="lg"
            placeholder="Ex.: limpeza, restauracao simples..."
            value={data.procedures_to_hide || ''}
            onChange={(e) => updateData({ procedures_to_hide: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-400">
            Procedimentos que nao queremos promover no conteudo
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket medio atual (faixa)
            </label>
            <Input
              inputSize="lg"
              placeholder="Ex.: R$ 3.000 - 5.000"
              value={data.current_ticket || ''}
              onChange={(e) => updateData({ current_ticket: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket que quer alcancar
            </label>
            <Input
              inputSize="lg"
              placeholder="Ex.: R$ 8.000 - 15.000"
              value={data.target_ticket || ''}
              onChange={(e) => updateData({ target_ticket: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seu maior gargalo hoje e:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BOTTLENECK_OPTIONS.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => updateData({ main_bottleneck: option.value })}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  data.main_bottleneck === option.value
                    ? 'border-primary bg-primary-50 shadow-glow'
                    : 'border-gray-200 bg-white hover:border-primary-light'
                }`}
              >
                <span className="text-2xl mb-1 block">{option.emoji}</span>
                <span className={`text-sm font-medium block ${
                  data.main_bottleneck === option.value ? 'text-primary' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
                <span className="text-xs text-gray-400">{option.description}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
