import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui'

export function HelpPage() {
  const whatsappNumber = '5585991797632'
  const whatsappMessage = encodeURIComponent('Olá! Preciso de ajuda com a Sorri.AI')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  const faqs = [
    {
      question: 'Como funciona a geração de roteiros?',
      answer: 'Nossa IA analisa seu perfil, especialidade e público-alvo para criar roteiros personalizados. Basta clicar em uma ideia e o roteiro será gerado automaticamente.',
    },
    {
      question: 'Quanto tempo leva para receber o vídeo editado?',
      answer: 'O prazo de entrega depende do seu plano: Free (72h), Lite (48h) e Pro (24h). Você pode acompanhar o status na aba "Em Edição".',
    },
    {
      question: 'Como faço upgrade do meu plano?',
      answer: 'Acesse as Configurações clicando no seu perfil e selecione o novo plano desejado. A mudança é imediata.',
    },
    {
      question: 'Posso cancelar minha assinatura?',
      answer: 'Sim, você pode cancelar a qualquer momento nas Configurações. Você continuará com acesso até o fim do período já pago.',
    },
  ]

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Central de Ajuda
          </h1>
          <p className="text-gray-500">
            Tire suas dúvidas ou fale diretamente conosco
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Precisa de ajuda?</h2>
              <p className="text-white/90 text-sm">
                Nossa equipe está pronta para te ajudar pelo WhatsApp
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full mt-4 bg-white text-green-600 hover:bg-gray-100"
            onClick={() => window.open(whatsappLink, '_blank')}
          >
            Chamar no WhatsApp
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Perguntas Frequentes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Horário de atendimento: Segunda a Sexta, 9h às 18h</p>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
