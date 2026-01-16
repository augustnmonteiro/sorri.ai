import { motion } from 'framer-motion'
import { OnboardingLayout } from '../OnboardingLayout'

export function Welcome() {
  return (
    <OnboardingLayout showBack={false} nextLabel="Começar">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center"
        >
          <span className="text-5xl">👋</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          Bem-vindo ao Sorri.AI!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-500 mb-8 max-w-md mx-auto"
        >
          Vamos conhecer você, seu posicionamento e seu paciente ideal para criar conteúdos que realmente representam quem você é.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Cerca de 5-7 minutos
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Conteúdo personalizado pra você
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  )
}
