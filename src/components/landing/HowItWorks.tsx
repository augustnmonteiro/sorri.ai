import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: 1,
    title: 'Gere seu Roteiro',
    description: 'Escolha o tema e deixe nossa IA criar um roteiro personalizado e envolvente para seu público.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Grave e Envie',
    description: 'Grave o vídeo no seu celular seguindo o roteiro e faça upload diretamente na plataforma.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Receba Editado',
    description: 'Em até 72h você recebe seu vídeo editado profissionalmente, pronto para publicar nas redes.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
]

function Step({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="grid grid-cols-[auto_1fr_auto] gap-8 items-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary-light hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold rounded-full">
          {step.number}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-500">{step.description}</p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-20 h-20 bg-gray-50 rounded-xl text-primary">
          {step.icon}
        </div>
      </motion.div>

      {!isLast && (
        <div className="flex justify-start ml-[23px]">
          <div className="w-0.5 h-10 bg-gradient-to-b from-primary-light to-secondary rounded-full" />
        </div>
      )}
    </>
  )
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-tag mb-4">Como Funciona</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Do roteiro ao post em{' '}
            <span className="gradient-text">3 passos simples</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map((step, index) => (
            <Step
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
