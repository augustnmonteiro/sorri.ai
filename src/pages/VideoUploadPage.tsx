import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { PLAN_CONFIG } from '@/utils/constants'
import type { Script, UserPlan } from '@/types'
import toast from 'react-hot-toast'

type UploadState = 'idle' | 'uploading' | 'success' | 'limit_reached'

export function VideoUploadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [script, setScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editingNotes, setEditingNotes] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const [expectedDelivery, setExpectedDelivery] = useState<Date | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userPlan = (profile?.plan || 'free') as UserPlan
  const planConfig = PLAN_CONFIG[userPlan]
  const editsUsed = profile?.video_edits_this_month || 0
  const editsRemaining = planConfig.videoEditsPerMonth - editsUsed

  useEffect(() => {
    if (!id || !user) return
    // Don't re-fetch after successful upload
    if (uploadState === 'success') return

    const fetchScript = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Error fetching script:', error)
        toast.error('Roteiro não encontrado')
        navigate('/dashboard')
        return
      }

      // Check if script is in correct status
      if (data.status !== 'recorded') {
        toast.error('Este roteiro não está pronto para upload')
        navigate('/dashboard')
        return
      }

      setScript(data)
      setIsLoading(false)

      // Check edit limit
      if (editsRemaining <= 0) {
        setUploadState('limit_reached')
      }
    }

    fetchScript()
  }, [id, user, editsRemaining, uploadState])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('video/')) {
        errors.push(`${file.name}: não é um vídeo`)
        return
      }
      if (file.size > 2 * 1024 * 1024 * 1024) {
        errors.push(`${file.name}: excede 2GB`)
        return
      }
      validFiles.push(file)
    })

    if (errors.length > 0) {
      toast.error(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !script || !profile) return

    if (editsRemaining <= 0) {
      setUploadState('limit_reached')
      return
    }

    setUploadState('uploading')
    setUploadProgress(0)
    setCurrentUploadIndex(0)

    try {
      const uploadedUrls: string[] = []
      const totalFiles = selectedFiles.length

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setCurrentUploadIndex(i)

        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}/${script.id}_${Date.now()}_${i}.${fileExt}`

        // Calculate progress based on current file
        const baseProgress = (i / totalFiles) * 100
        const fileProgress = (1 / totalFiles) * 100

        // Simulate progress for current file
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const maxForThisFile = baseProgress + fileProgress * 0.9
            if (prev >= maxForThisFile) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 2
          })
        }, 200)

        const { error: uploadError } = await supabase.storage
          .from('raw-videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        clearInterval(progressInterval)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('raw-videos')
          .getPublicUrl(fileName)

        uploadedUrls.push(urlData.publicUrl)

        // Update progress after file upload
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      const deliveryDate = new Date()
      deliveryDate.setHours(deliveryDate.getHours() + planConfig.deliveryHours)
      setExpectedDelivery(deliveryDate)

      const { error: updateError } = await supabase
        .from('scripts')
        .update({
          status: 'editing',
          editing_notes: editingNotes,
          raw_video_url: uploadedUrls.join(','),
          expected_delivery_at: deliveryDate.toISOString(),
          editing_started_at: new Date().toISOString(),
        })
        .eq('id', script.id)

      if (updateError) throw updateError

      await supabase
        .from('profiles')
        .update({
          video_edits_this_month: editsUsed + 1,
        })
        .eq('id', profile.id)

      await refreshProfile()
      setUploadState('success')
      toast.success(`${selectedFiles.length} vídeo${selectedFiles.length > 1 ? 's' : ''} enviado${selectedFiles.length > 1 ? 's' : ''} com sucesso!`)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadState('idle')
      toast.error('Erro ao fazer upload. Tente novamente.')
    }
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((acc, file) => acc + file.size, 0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          {uploadState !== 'uploading' && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">Enviar para Edição</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Script Info */}
          {script && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎬</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{script.title}</h2>
                  <p className="text-sm text-gray-500">Roteiro gravado</p>
                </div>
              </div>
            </div>
          )}

          {uploadState === 'limit_reached' ? (
            /* Limit Reached */
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <span className="text-5xl block mb-4">🚫</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Limite atingido</h3>
              <p className="text-gray-600 mb-4">
                Você já utilizou todas as {planConfig.videoEditsPerMonth} edições do plano {planConfig.name} este mês.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Faça upgrade do seu plano para mais edições mensais.
              </p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/settings')} className="w-full">
                  Fazer Upgrade
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          ) : uploadState === 'success' ? (
            /* Success */
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <span className="text-5xl block mb-4">✅</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vídeo enviado!</h3>
              <p className="text-gray-600 mb-6">
                Seu vídeo foi enviado para edição com sucesso.
              </p>

              <div className="bg-primary-50 rounded-xl p-5 mb-6">
                <p className="text-primary font-semibold text-lg">
                  Previsão de entrega: {planConfig.deliveryText}
                </p>
                {expectedDelivery && (
                  <p className="text-primary-600 mt-2">
                    Até {expectedDelivery.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Plano {planConfig.name}: {editsRemaining - 1} edições restantes este mês
              </p>

              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          ) : uploadState === 'uploading' ? (
            /* Uploading */
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={276}
                    strokeDashoffset={276 - (276 * uploadProgress) / 100}
                    className="text-primary transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
                  {Math.round(uploadProgress)}%
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enviando vídeo{selectedFiles.length > 1 ? 's' : ''}...
              </h3>
              <p className="text-gray-500 mb-2 truncate px-4">
                {selectedFiles[currentUploadIndex]?.name}
              </p>
              {selectedFiles.length > 1 && (
                <p className="text-sm text-primary font-medium mb-6">
                  Arquivo {currentUploadIndex + 1} de {selectedFiles.length}
                </p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-semibold">Não feche o aplicativo!</p>
                </div>
                <p className="text-sm text-amber-600">
                  O upload está em andamento. Fechar agora pode corromper o arquivo.
                </p>
              </div>
            </div>
          ) : (
            /* Upload Form */
            <>
              {/* Plan Info */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Plano {planConfig.name}</p>
                    <p className="font-semibold text-gray-900">
                      {editsRemaining} de {planConfig.videoEditsPerMonth} edições restantes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Prazo de entrega</p>
                    <p className="font-semibold text-primary">{planConfig.deliveryText}</p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vídeos gravados
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="border-2 border-primary bg-primary-50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎥</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="w-8 h-8 rounded-full hover:bg-white/50 flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                      <span>{selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''} selecionado{selectedFiles.length > 1 ? 's' : ''}</span>
                      <span>Total: {formatFileSize(getTotalSize())}</span>
                    </div>
                  </div>
                )}

                {/* Add More / Select Files Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl text-center hover:border-primary hover:bg-primary-50 transition-all ${selectedFiles.length > 0
                    ? 'border-gray-300 p-4'
                    : 'border-gray-300 p-10'
                    }`}
                >
                  {selectedFiles.length === 0 ? (
                    <>
                      <svg className="w-14 h-14 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-medium text-gray-700 text-lg">Toque para selecionar</p>
                      <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI até 2GB cada</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">Adicionar mais vídeos</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Editing Notes */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Instruções para edição (opcional)
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Ex: Adicionar legendas, música de fundo animada, cortar os primeiros 5 segundos..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none text-base"
                />
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* Bottom Action Bar */}
      {uploadState === 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="w-full"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
            >
              Enviar para Edição
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
