import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, ScriptPageSkeleton } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { SCRIPT_STATUS_CONFIG } from '@/utils/constants'
import type { Script } from '@/types'
import toast from 'react-hot-toast'

export function ScriptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [script, setScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showRevertModal, setShowRevertModal] = useState(false)

  // Refs for contentEditable elements
  const hookRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id || !user) return

    const fetchScript = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching script:', error)
        toast.error('Roteiro não encontrado')
        navigate('/dashboard')
        return
      }

      setScript(data)
      setIsLoading(false)

      // Auto-generate if no content
      if (data && !data.content_generated) {
        generateContent(data)
      }
    }

    fetchScript()
  }, [id, user])

  const generateContent = async (scriptData: Script) => {
    setIsGenerating(true)

    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          scriptId: scriptData.id,
          topic: scriptData.topic || scriptData.title,
          script_type: 'educational',
          duration: 'medium',
        },
      })

      if (error) {
        console.error('Function error:', error)
        throw error
      }

      const updatedScript = data.script
      setScript(updatedScript)
      toast.success('Roteiro gerado com sucesso!')
    } catch (error) {
      console.error('Error generating script content:', error)
      toast.error('Erro ao gerar roteiro. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStatusChange = async (newStatus: Script['status']) => {
    if (!script) return

    // For recorded -> editing, navigate to upload page
    if (script.status === 'recorded' && newStatus === 'editing') {
      navigate(`/script/${script.id}/upload`)
      return
    }

    const { error } = await supabase
      .from('scripts')
      .update({ status: newStatus })
      .eq('id', script.id)

    if (error) {
      toast.error('Erro ao atualizar status')
      return
    }

    setScript((prev) => prev ? { ...prev, status: newStatus } : null)
    toast.success('Status atualizado!')
  }

  const handleCopy = () => {
    if (script?.content) {
      navigator.clipboard.writeText(script.content)
      toast.success('Roteiro copiado!')
    }
  }

  const handleStartEditing = () => {
    if (!script) return
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    // Reset contentEditable to original values
    if (hookRef.current) hookRef.current.innerText = script?.hook || ''
    if (contentRef.current) contentRef.current.innerText = script?.content || ''
    if (descriptionRef.current) descriptionRef.current.innerText = script?.description || ''
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!script) return

    setIsSaving(true)

    // Read values from refs
    const editedHook = hookRef.current?.innerText || ''
    const editedContent = contentRef.current?.innerText || ''
    const editedDescription = descriptionRef.current?.innerText || ''
    const now = new Date().toISOString()

    try {
      // Prepare update data
      const updateData: Record<string, string | undefined> = {
        content: editedContent,
        hook: editedHook,
        description: editedDescription,
        updated_at: now,
      }

      // If this is the first edit (no original content saved), save the original values
      if (!script.original_content && script.content) {
        updateData.original_content = script.content
      }
      if (!script.original_hook && script.hook) {
        updateData.original_hook = script.hook
      }
      if (!script.original_description && script.description) {
        updateData.original_description = script.description
      }

      const { error } = await supabase
        .from('scripts')
        .update(updateData)
        .eq('id', script.id)

      if (error) {
        throw error
      }

      // Update local state
      setScript((prev) => prev ? {
        ...prev,
        content: editedContent,
        hook: editedHook,
        description: editedDescription,
        original_content: updateData.original_content || prev.original_content,
        original_hook: updateData.original_hook || prev.original_hook,
        original_description: updateData.original_description || prev.original_description,
        updated_at: now,
      } : null)

      setIsEditing(false)
      toast.success('Roteiro salvo com sucesso!')
    } catch (error) {
      console.error('Error saving script:', error)
      toast.error('Erro ao salvar roteiro')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevertToOriginal = async () => {
    if (!script) return

    setIsSaving(true)

    try {
      const updateData: Record<string, string | null> = {
        updated_at: new Date().toISOString(),
      }

      // Only revert fields that have original values
      if (script.original_content) {
        updateData.content = script.original_content
        updateData.original_content = null
      }
      if (script.original_hook) {
        updateData.hook = script.original_hook
        updateData.original_hook = null
      }
      if (script.original_description) {
        updateData.description = script.original_description
        updateData.original_description = null
      }

      const { error } = await supabase
        .from('scripts')
        .update(updateData)
        .eq('id', script.id)

      if (error) {
        throw error
      }

      // Update local state
      const newContent = script.original_content || script.content
      const newHook = script.original_hook || script.hook
      const newDescription = script.original_description || script.description

      setScript((prev) => prev ? {
        ...prev,
        content: newContent,
        hook: newHook,
        description: newDescription,
        original_content: undefined,
        original_hook: undefined,
        original_description: undefined,
        updated_at: updateData.updated_at as string,
      } : null)

      // Update refs to show reverted content
      if (hookRef.current) hookRef.current.innerText = newHook || ''
      if (contentRef.current) contentRef.current.innerText = newContent || ''
      if (descriptionRef.current) descriptionRef.current.innerText = newDescription || ''

      setShowRevertModal(false)
      toast.success('Roteiro restaurado para a versão original!')
    } catch (error) {
      console.error('Error reverting script:', error)
      toast.error('Erro ao restaurar roteiro')
    } finally {
      setIsSaving(false)
    }
  }

  const hasOriginalContent = script?.original_content || script?.original_hook || script?.original_description

  if (isLoading) {
    return <ScriptPageSkeleton />
  }

  if (!script) {
    return null
  }

  const statusConfig = SCRIPT_STATUS_CONFIG[script.status]
  const isIdea = !script.content_generated && script.status === 'script'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">{isIdea ? 'Ideia' : 'Roteiro'}</h1>
          </div>
          {script.content_generated && (
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{isIdea ? '💡' : '📝'}</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{script.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${script.status === 'published' ? 'bg-green-100 text-green-800' :
                    script.status === 'editing' ? 'bg-purple-100 text-purple-800' :
                      script.status === 'recorded' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {isIdea ? 'Ideia' : statusConfig.label}
                  </span>
                  {script.expected_delivery_at && script.status === 'editing' && (
                    <span className="text-xs text-gray-500">
                      Entrega: {new Date(script.expected_delivery_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Revert to Original Button */}
          {hasOriginalContent && !isEditing && (
            <button
              onClick={() => setShowRevertModal(true)}
              className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-amber-800">Roteiro editado</p>
                  <p className="text-sm text-amber-600">Clique para restaurar a versão original gerada pela IA</p>
                </div>
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}

          {/* Script Content Cards */}
          <div className="space-y-6">
            {isGenerating ? (
              <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 px-6">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Gerando seu roteiro...</p>
                <p className="text-sm text-gray-400 mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : script.content ? (
              <>
                {/* Hook Card */}
                {(script.hook || isEditing) && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Gancho (Hook)</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Os primeiros 3 segundos para prender a atenção</p>
                      </div>
                      {!isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartEditing}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(script.hook || '')
                              toast.success('Gancho copiado!')
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelEditing} disabled={isSaving}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                            Salvar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div
                        ref={hookRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`text-lg font-medium text-gray-800 outline-none ${isEditing ? 'border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary' : ''}`}
                        data-placeholder="Digite o gancho do seu roteiro..."
                      >
                        {script.hook}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Script Card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Roteiro Completo</h3>
                      <p className="text-xs text-gray-500 mt-0.5">O conteúdo principal do seu vídeo</p>
                    </div>
                    {!isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStartEditing}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(script.content || '')
                            toast.success('Roteiro copiado!')
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelEditing} disabled={isSaving}>
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                          Salvar
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div
                      ref={contentRef}
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      className={`whitespace-pre-wrap text-gray-700 leading-relaxed outline-none ${isEditing ? 'border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary' : ''}`}
                      data-placeholder="Digite o conteúdo do seu roteiro..."
                    >
                      {script.content}
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                {(script.description || isEditing) && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Legenda (Caption)</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Texto para postar junto com o vídeo</p>
                      </div>
                      {!isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartEditing}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(script.description || '')
                              toast.success('Legenda copiada!')
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelEditing} disabled={isSaving}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                            Salvar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div
                        ref={descriptionRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`whitespace-pre-wrap text-gray-700 leading-relaxed text-sm outline-none ${isEditing ? 'border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary' : ''}`}
                        data-placeholder="Digite a legenda do seu vídeo..."
                      >
                        {script.description}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 px-6">
                <span className="text-5xl mb-4">💡</span>
                <p className="text-gray-600 font-medium text-lg">Roteiro ainda não gerado</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Clique abaixo para gerar o roteiro completo</p>
                <Button
                  onClick={() => generateContent(script)}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                >
                  Gerar Roteiro
                </Button>
              </div>
            )}
          </div>

          {/* Editing Notes (if in editing) */}
          {script.editing_notes && script.status === 'editing' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Instruções de edição</h3>
              <p className="text-gray-600 text-sm">{script.editing_notes}</p>
            </div>
          )}

          {/* Recording Checklist Card - Show when script is ready to record */}
          {script.content_generated && script.status === 'script' && !isEditing && (
            <button
              onClick={() => navigate(`/checklist-gravacao/${script.id}`)}
              className="w-full bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-5 text-left hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🎥</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">Pronto para gravar?</h3>
                  <p className="text-white/80 text-sm mt-1">
                    Faça o checklist antes de começar a gravação
                  </p>
                </div>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}
        </motion.div>
      </main>

      {/* Bottom Action Bar */}
      {script.content_generated && script.status !== 'published' && script.status !== 'editing' && !isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-3xl mx-auto">
            {script.status === 'script' && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange('recorded')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              >
                Marcar como Gravado
              </Button>
            )}
            {script.status === 'recorded' && (
              <Button
                className="w-full"
                onClick={() => navigate(`/script/${script.id}/upload`)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                }
              >
                Enviar para Edição
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {showRevertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurar versão original?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Suas edições serão perdidas e o roteiro voltará para a versão gerada pela IA. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRevertModal(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRevertToOriginal}
                  isLoading={isSaving}
                >
                  Restaurar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
