import { Link } from 'react-router-dom'
import logo from '@/assets/images/logo.png'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="Sorri.AI" className="h-8" />
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 mb-8">Última atualização: Janeiro de 2025</p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed mb-6">
            A Sorri.AI está comprometida em proteger a privacidade dos nossos usuários.
            Esta política explica de forma simples como coletamos, usamos e protegemos suas informações.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Informações que Coletamos</h2>
          <p className="text-gray-600 mb-3">Coletamos as seguintes informações quando você usa nossa plataforma:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Dados de cadastro:</strong> nome, email e senha</li>
            <li><strong>Dados profissionais:</strong> especialidade, procedimentos, informações sobre sua clínica (fornecidas no onboarding)</li>
            <li><strong>Conteúdo:</strong> vídeos que você envia para edição e roteiros gerados</li>
            <li><strong>Dados de uso:</strong> como você interage com a plataforma</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Como Usamos suas Informações</h2>
          <p className="text-gray-600 mb-3">Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Gerar roteiros personalizados com nossa IA</li>
            <li>Editar seus vídeos conforme solicitado</li>
            <li>Melhorar nossos serviços e sua experiência</li>
            <li>Enviar comunicações sobre sua conta e nossos serviços</li>
            <li>Fornecer suporte ao cliente</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Compartilhamento de Dados</h2>
          <p className="text-gray-600 mb-3">Não vendemos suas informações pessoais. Podemos compartilhar dados apenas:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Com prestadores de serviços que nos ajudam a operar a plataforma (hospedagem, processamento de pagamentos)</li>
            <li>Quando exigido por lei</li>
            <li>Com seu consentimento expresso</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Seus Vídeos</h2>
          <p className="text-gray-600 mb-6">
            Os vídeos que você envia são usados exclusivamente para a edição solicitada.
            Não utilizamos seus vídeos para outros fins sem sua autorização.
            Você mantém todos os direitos sobre seu conteúdo.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Segurança</h2>
          <p className="text-gray-600 mb-3">Implementamos medidas de segurança para proteger suas informações, incluindo:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Criptografia de dados em trânsito e em repouso</li>
            <li>Acesso restrito aos dados pessoais</li>
            <li>Monitoramento de segurança contínuo</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Seus Direitos</h2>
          <p className="text-gray-600 mb-3">Você tem direito a:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-3">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir informações incorretas</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Exportar seus dados</li>
          </ul>
          <p className="text-gray-600 mb-6">Para exercer esses direitos, entre em contato conosco.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies</h2>
          <p className="text-gray-600 mb-6">
            Utilizamos cookies essenciais para o funcionamento da plataforma e para manter você logado.
            Não utilizamos cookies de rastreamento para publicidade.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Alterações nesta Política</h2>
          <p className="text-gray-600 mb-6">
            Podemos atualizar esta política periodicamente.
            Notificaremos você sobre mudanças significativas por email ou através da plataforma.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contato</h2>
          <p className="text-gray-600 mb-2">
            Se tiver dúvidas sobre esta política ou sobre como tratamos seus dados, entre em contato:
          </p>
          <p className="text-gray-600 mb-6">
            <strong>Email:</strong>{' '}
            <a href="mailto:contato@sorri.ai" className="text-primary hover:underline">
              contato@sorri.ai
            </a>
          </p>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Ao usar a Sorri.AI, você concorda com esta Política de Privacidade.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sorri.AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
