import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary text-sm font-medium mb-6">
              <span>✨</span>
              <span>Powered by AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Marketing para você, dentista,{' '}
              <span className="gradient-text">sem complicação</span>
            </h1>

            <p className="text-xl text-gray-500 mb-8 max-w-lg">
              Gere roteiros de vídeo com IA, acompanhe suas publicações e receba seus vídeos editados profissionalmente. Tudo em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/signup">
                <Button variant="primary" size="lg" iconRight={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                }>
                  Começar Gratuitamente
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="outline" size="lg">
                  Ver Como Funciona
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap gap-8 md:gap-12">
              {[
                { number: '500+', label: 'Dentistas ativos' },
                { number: '10k+', label: 'Roteiros gerados' },
                { number: '2k+', label: 'Vídeos editados' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-extrabold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">📝</span>
                    <span className="font-semibold text-gray-800">Novo Roteiro</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-[90%]"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-[75%]"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-[85%]"></div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="text-sm font-medium text-gray-600">3 Gravados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                    <span className="text-sm font-medium text-gray-600">12 Publicados</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-radial from-primary-50 to-transparent opacity-50 pointer-events-none" />
    </section>
  )
}
