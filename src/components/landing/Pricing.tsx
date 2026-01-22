import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui'

const plans = [
  {
    name: 'Free',
    description: 'Para quem está começando',
    price: 0,
    features: [
      '10 ideias de roteiros por mês',
      '1 vídeo editado por mês',
      'Entrega em até 7 dias',
      'Acompanhamento de vídeos',
    ],
    cta: 'Começar Grátis',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Para quem quer crescer de verdade',
    price: 197,
    features: [
      '30 ideias de roteiros por mês',
      '4 vídeos editados por mês',
      'Entrega em até 72 horas',
      'Suporte prioritário',
    ],
    cta: 'Assinar Agora',
    variant: 'primary' as const,
    popular: true,
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

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-start">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Enterprise Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium mb-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Enterprise
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Precisa de mais?
                </h3>
                <p className="text-gray-300 text-lg mb-4">
                  Entre em contato e receba um orcamento personalizado para voce.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mais ideias de roteiros</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mais videos editados</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Entrega em menos de 72 horas</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o plano Enterprise do Sorri.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com Especialista
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
