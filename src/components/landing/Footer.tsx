import { Link } from 'react-router-dom'
import logo from '@/assets/images/logo.png'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[1.5fr_2fr] gap-12 mb-12">
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Sorri.AI" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="max-w-xs leading-relaxed">
              Marketing inteligente para dentistas que querem crescer no digital.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
                Produto
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#funcionalidades" className="hover:text-white transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#precos" className="hover:text-white transition-colors">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
                Empresa
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sorri.AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
