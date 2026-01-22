import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
    title: 'Agentes de Tendências',
    description: 'Nossos agentes de IA vasculham a internet 24/7 buscando posts virais e tendências para gerar ideias personalizadas para o seu perfil.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Roteiros com IA',
    description: 'Gere roteiros de vídeo personalizados para você em segundos. Nossa IA entende o mercado odontológico e cria conteúdos que convertem.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
    title: 'Acompanhamento Completo',
    description: 'Saiba exatamente quais roteiros você já gravou e quais já foram publicados. Nunca mais perca o controle do seu conteúdo.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    title: 'Edição Profissional',
    description: 'Envie seu vídeo gravado e receba de volta uma edição profissional pronta para postar. Legendas, cortes e efeitos inclusos.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Entrega Rápida',
    description: 'Receba seus vídeos editados em até 72 horas. Mantenha sua consistência nas redes sem esperar semanas pela edição.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: 'Feito para Dentistas',
    description: 'Roteiros sobre clareamento, implantes, ortodontia e muito mais. Conteúdo relevante que seu público quer ver.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: 'Upload Simples',
    description: 'Grave no celular e envie direto pelo app. Sem complicação, sem precisar de equipamentos caros ou softwares complexos.',
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl border border-gray-200 hover:-translate-y-1 hover:shadow-soft hover:border-primary-light transition-all duration-300"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl text-primary mb-6">
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
      <p className="text-gray-500 leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export function Features() {
  return (
    <section id="funcionalidades" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-tag mb-4">Funcionalidades</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">bombar nas redes</span>
          </h2>
          <p className="text-lg text-gray-500">
            Ferramentas poderosas pensadas especialmente para dentistas que querem crescer no digital.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
