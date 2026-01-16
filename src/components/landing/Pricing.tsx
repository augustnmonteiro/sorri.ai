import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui'

const plans = [
  {
    name: 'Starter',
    description: 'Para quem está começando',
    price: 0,
    features: [
      '5 roteiros por mês',
      'Acompanhamento de vídeos',
      'Suporte por email',
    ],
    cta: 'Começar Grátis',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Profissional',
    description: 'Para dentistas em crescimento',
    price: 197,
    features: [
      'Roteiros ilimitados',
      '8 vídeos editados/mês',
      'Entrega em 48h',
      'Suporte prioritário',
    ],
    cta: 'Assinar Agora',
    variant: 'primary' as const,
    popular: true,
  },
  {
    name: 'Clínica',
    description: 'Para múltiplos profissionais',
    price: 397,
    features: [
      'Tudo do Profissional',
      '20 vídeos editados/mês',
      'Até 5 usuários',
      'Gerente de conta dedicado',
    ],
    cta: 'Falar com Vendas',
    variant: 'outline' as const,
    popular: false,
  },
]

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-white p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        plan.popular
          ? 'border-primary shadow-lg scale-105'
          : 'border-gray-200'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-full">
          Mais Popular
        </div>
      )}

      <div className="text-center mb-8 pb-8 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-500 mb-6">{plan.description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-semibold text-gray-600">R$</span>
          <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
          <span className="text-gray-500">/mês</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-gray-600">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link to="/signup">
        <Button variant={plan.variant} fullWidth>
          {plan.cta}
        </Button>
      </Link>
    </motion.div>
  )
}

export function Pricing() {
  return (
    <section id="precos" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-tag mb-4">Preços</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Planos que cabem no seu{' '}
            <span className="gradient-text">bolso e sua rotina</span>
          </h2>
          <p className="text-lg text-gray-500">
            Comece gratuitamente e escale conforme você cresce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
