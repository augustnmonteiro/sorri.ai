import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_CONFIG } from '@/utils/constants'
import { supabase } from '@/lib/supabase'
import type { UserPlan } from '@/types'
import toast from 'react-hot-toast'

type PageState = 'idle' | 'uploading' | 'converting' | 'generating' | 'success' | 'limit_reached' | 'error'

function profilePhotoUrl(path: string | undefined | null): string | null {
  if (!path) return null
  // If it's already a full URL (legacy data), return as-is
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_SUPABASE_URL
  return `${base}/storage/v1/object/public/profile-photos/${path}`
}

function isHeic(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const name = file.name.toLowerCase()
  return name.endsWith('.heic') || name.endsWith('.heif')
}

export function PerfilPage() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<PageState>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(
    profilePhotoUrl(profile?.ai_profile_photo_url) || null
  )
  const [errorMessage, setErrorMessage] = useState('')

  const userPlan = (profile?.plan || 'free') as UserPlan
  const planConfig = PLAN_CONFIG[userPlan]
  const generationsCount = profile?.ai_profile_photo_generations_count || 0
  const lastGeneratedAt = profile?.ai_profile_photo_generated_at
    ? new Date(profile.ai_profile_photo_generated_at)
    : null

  // Check if user has reached their limit
  const isLimitReached = (() => {
    if (userPlan === 'free' && generationsCount >= planConfig.profilePhotoLimit) {
      return true
    }
    if (userPlan === 'pro' && lastGeneratedAt) {
      const now = new Date()
      return (
        lastGeneratedAt.getMonth() === now.getMonth() &&
        lastGeneratedAt.getFullYear() === now.getFullYear()
      )
    }
    return false
  })()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(file.type) && !isHeic(file)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou HEIC.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB.')
      return
    }

    setErrorMessage('')

    if (isHeic(file)) {
      setState('converting')
      try {
        const heic2any = (await import('heic2any')).default
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
        const converted = Array.isArray(blob) ? blob[0] : blob
        const jpegFile = new File([converted], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), {
          type: 'image/jpeg',
        })
        setSelectedFile(jpegFile)
        setPreview(URL.createObjectURL(jpegFile))
        setState('idle')
      } catch (err) {
        console.error('HEIC conversion error:', err)
        toast.error('Erro ao converter HEIC. Tente enviar em JPG ou PNG.')
        setState('error')
        return
      }
    } else {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setState('idle')
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('Selecione uma foto primeiro.')
      return
    }

    if (isLimitReached) {
      setState('limit_reached')
      return
    }

    setState('generating')
    setErrorMessage('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.')
        setState('error')
        return
      }

      const formData = new FormData()
      formData.append('image', selectedFile)

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-profile-photo`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'limit_reached') {
          setState('limit_reached')
          return
        }
        throw new Error(data.error || data.message || 'Erro ao gerar foto')
      }

      setGeneratedUrl(profilePhotoUrl(data.path))
      setState('success')
      toast.success('Foto profissional gerada com sucesso!')
      await refreshProfile()
    } catch (err) {
      console.error('Error generating profile photo:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao gerar foto. Tente novamente.')
      setState('error')
    }
  }

  const handleDownload = async () => {
    const url = generatedUrl || profilePhotoUrl(profile?.ai_profile_photo_url)
    if (!url) return

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'foto-profissional.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error('Erro ao baixar a foto. Tente novamente.')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setState('idle')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white text-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Foto de Perfil Profissional
          </h1>
          <p className="text-white/90 text-lg">
            Transforme uma selfie em uma foto profissional com IA
          </p>
        </div>

        {/* Existing generated photo */}
        {(generatedUrl || profilePhotoUrl(profile?.ai_profile_photo_url)) && state !== 'generating' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sua foto profissional</h2>
            <div className="flex flex-col items-center gap-4">
              <img
                src={generatedUrl || profilePhotoUrl(profile?.ai_profile_photo_url) || ''}
                alt="Foto profissional gerada por IA"
                className="w-48 h-48 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
              <Button
                onClick={handleDownload}
                variant="primary"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar foto
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {generatedUrl ? 'Gerar nova foto' : 'Envie sua foto'}
          </h2>

          {isLimitReached && state !== 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                {userPlan === 'free'
                  ? 'Você já usou sua geração gratuita.'
                  : 'Você já gerou uma foto este mês. Tente novamente no próximo mês.'}
              </p>
              {userPlan === 'free' && (
                <Button
                  onClick={() => navigate('/settings')}
                  variant="primary"
                >
                  Fazer upgrade para Pro
                </Button>
              )}
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
              />

              {state === 'converting' ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Convertendo imagem HEIC...</p>
                </div>
              ) : !preview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-1">
                    Clique para enviar uma foto
                  </p>
                  <p className="text-gray-400 text-sm">
                    JPG, PNG, WebP ou HEIC (máx. 10MB)
                  </p>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-48 h-48 rounded-full object-cover border-4 border-gray-200"
                      />
                      {state !== 'generating' && (
                        <button
                          onClick={handleReset}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {state === 'generating' ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Gerando sua foto profissional...</p>
                      <p className="text-gray-400 text-sm mt-1">Isso pode levar alguns segundos</p>
                    </div>
                  ) : state === 'success' ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-600 font-medium">Foto gerada com sucesso!</p>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="mt-4"
                      >
                        Gerar outra foto
                      </Button>
                    </div>
                  ) : state === 'error' ? (
                    <div className="text-center py-4">
                      <p className="text-red-500 mb-4">{errorMessage}</p>
                      <Button onClick={handleGenerate} variant="primary">
                        Tentar novamente
                      </Button>
                    </div>
                  ) : state === 'limit_reached' ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        {userPlan === 'free'
                          ? 'Você já usou sua geração gratuita.'
                          : 'Você já gerou uma foto este mês. Tente novamente no próximo mês.'}
                      </p>
                      {userPlan === 'free' && (
                        <Button
                          onClick={() => navigate('/settings')}
                          variant="primary"
                        >
                          Fazer upgrade para Pro
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleGenerate}
                      variant="primary"
                      className="w-full"
                    >
                      Gerar foto profissional
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Como funciona</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Envie uma selfie ou foto sua com boa iluminação' },
              { step: '2', text: 'Nossa IA transforma em uma foto profissional de estúdio' },
              { step: '3', text: 'Use como foto de perfil nas redes sociais' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </span>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {userPlan === 'free'
                ? `Plano Free: ${planConfig.profilePhotoLimit} geração no total`
                : `Plano Pro: ${planConfig.profilePhotoLimit} geração por mês`}
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
