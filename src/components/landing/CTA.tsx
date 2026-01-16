import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary to-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pronto para transformar seu marketing?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Junte-se a centenas de dentistas que já estão crescendo nas redes sociais com a Sorri.AI
          </p>
          <Link to="/signup">
            <Button variant="white" size="lg" iconRight={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            }>
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
