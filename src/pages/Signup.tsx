import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'
import logo from '@/assets/images/logo.png'
import toast from 'react-hot-toast'

export function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    const { error } = await signUp(email, password, fullName)

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Conta criada com sucesso!')
    navigate('/onboarding')
  }

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-secondary items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-4">
            Comece a crescer nas redes hoje
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Junte-se a centenas de dentistas que já estão transformando sua presença digital com a Sorri.AI
          </p>
          <div className="space-y-4">
            {[
              'Roteiros personalizados com IA',
              'Vídeos editados profissionalmente',
              'Métricas do Instagram integradas',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-block mb-8">
            <img src={logo} alt="Sorri.AI" className="h-10" />
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crie sua conta
          </h1>
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Grátis para começar
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sem cartão de crédito
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              label="Nome completo"
              placeholder="Dr. João Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Criar conta
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="outline" fullWidth onClick={handleGoogleSignIn} icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }>
            Continuar com Google
          </Button>

          <p className="mt-8 text-center text-gray-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
              Fazer login
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>{' '}
            e{' '}
            <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
