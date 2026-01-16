import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button, Badge } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PLAN_CONFIG } from '@/utils/constants'
import type { ScriptWithUser, UserPlan } from '@/types'
import toast from 'react-hot-toast'
import logo from '@/assets/images/logo.png'

type UploadingState = {
  scriptId: string
  progress: number
} | null

type TabType = 'editing' | 'delivered'

export function AdminDashboard() {
  const { signOut, profile } = useAuth()
  const [editingScripts, setEditingScripts] = useState<ScriptWithUser[]>([])
  const [deliveredScripts, setDeliveredScripts] = useState<ScriptWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('editing')
  const [uploading, setUploading] = useState<UploadingState>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null)

  // Fetch scripts
  useEffect(() => {
    const fetchScripts = async () => {
      setIsLoading(true)

      // Fetch editing scripts
      const { data: editing, error: editingError } = await supabase
        .from('scripts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            plan
          )
        `)
        .eq('status', 'editing')
        .order('expected_delivery_at', { ascending: true })

      if (editingError) {
        console.error('Error fetching editing scripts:', editingError)
      } else {
        setEditingScripts(editing as ScriptWithUser[] || [])
      }

      // Fetch delivered/published scripts
      const { data: delivered, error: deliveredError } = await supabase
        .from('scripts')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            plan
          )
        `)
        .eq('status', 'published')
        .order('editing_completed_at', { ascending: false })

      if (deliveredError) {
        console.error('Error fetching delivered scripts:', deliveredError)
      } else {
        setDeliveredScripts(delivered as ScriptWithUser[] || [])
      }

      setIsLoading(false)
    }

    fetchScripts()
  }, [])

  const getUrgencyInfo = (expectedDelivery: string | undefined) => {
    if (!expectedDelivery) return { label: 'Sem prazo', color: 'gray', urgent: false }

    const now = new Date()
    const delivery = new Date(expectedDelivery)
    const hoursRemaining = (delivery.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursRemaining < 0) {
      return { label: 'Atrasado', color: 'red', urgent: true }
    } else if (hoursRemaining < 12) {
      return { label: 'Urgente', color: 'red', urgent: true }
    } else if (hoursRemaining < 24) {
      return { label: 'Hoje', color: 'amber', urgent: true }
    } else if (hoursRemaining < 48) {
      return { label: 'Amanhã', color: 'amber', urgent: false }
    } else {
      const days = Math.ceil(hoursRemaining / 24)
      return { label: `${days} dias`, color: 'green', urgent: false }
    }
  }

  const handleDownloadRaw = async (script: ScriptWithUser) => {
    if (!script.raw_video_url) {
      toast.error('Vídeo não disponível')
      return
    }

    setDownloadingId(script.id)
    try {
      const url = new URL(script.raw_video_url)
      const pathParts = url.pathname.split('/storage/v1/object/public/raw-videos/')
      const filePath = pathParts[1] || ''

      const { data, error } = await supabase.storage
        .from('raw-videos')
        .download(filePath)

      if (error) throw error

      const downloadUrl = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${script.title.replace(/\s+/g, '_')}_raw.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      toast.success('Download iniciado!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erro ao baixar vídeo')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDownloadEdited = async (script: ScriptWithUser) => {
    if (!script.edited_video_url) {
      toast.error('Vídeo editado não disponível')
      return
    }

    setDownloadingId(script.id)
    try {
      const url = new URL(script.edited_video_url)
      const pathParts = url.pathname.split('/storage/v1/object/public/edited-videos/')
      const filePath = pathParts[1] || ''

      const { data, error } = await supabase.storage
        .from('edited-videos')
        .download(filePath)

      if (error) throw error

      const downloadUrl = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${script.title.replace(/\s+/g, '_')}_edited.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      toast.success('Download iniciado!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erro ao baixar vídeo')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleUploadClick = (scriptId: string) => {
    setSelectedScriptId(scriptId)
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedScriptId) return

    const script = editingScripts.find(s => s.id === selectedScriptId)
    if (!script) return

    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de vídeo')
      return
    }

    setUploading({ scriptId: selectedScriptId, progress: 0 })

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${script.user_id}/${script.id}_edited_${Date.now()}.${fileExt}`

      const progressInterval = setInterval(() => {
        setUploading(prev => {
          if (!prev || prev.progress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, progress: prev.progress + 10 }
        })
      }, 300)

      const { error: uploadError } = await supabase.storage
        .from('edited-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        clearInterval(progressInterval)
        throw uploadError
      }

      clearInterval(progressInterval)
      setUploading(prev => prev ? { ...prev, progress: 100 } : null)

      const { data: urlData } = supabase.storage
        .from('edited-videos')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('scripts')
        .update({
          status: 'published',
          edited_video_url: urlData.publicUrl,
          editing_completed_at: new Date().toISOString(),
        })
        .eq('id', selectedScriptId)

      if (updateError) throw updateError

      // Move from editing to delivered
      const updatedScript = { ...script, status: 'published' as const, edited_video_url: urlData.publicUrl }
      setEditingScripts(prev => prev.filter(s => s.id !== selectedScriptId))
      setDeliveredScripts(prev => [updatedScript, ...prev])
      toast.success('Vídeo editado enviado com sucesso!')

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(null)
      setSelectedScriptId(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const scripts = activeTab === 'editing' ? editingScripts : deliveredScripts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Sorri.AI" className="h-8" />
            <Badge variant="secondary">Admin</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold flex items-center justify-center">
                {profile?.full_name?.charAt(0) || 'A'}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'Admin'}</p>
                  <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('editing')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'editing'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Em Edição
              {editingScripts.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'editing' ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-600'
                }`}>
                  {editingScripts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'delivered'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Entregues
              {deliveredScripts.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'delivered' ? 'bg-primary-100 text-primary' : 'bg-gray-100 text-gray-600'
                }`}>
                  {deliveredScripts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats (only for editing tab) */}
        {activeTab === 'editing' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total em edição</p>
              <p className="text-2xl font-bold text-gray-900">{editingScripts.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
              <p className="text-sm text-red-600">Atrasados/Urgentes</p>
              <p className="text-2xl font-bold text-red-600">
                {editingScripts.filter(s => getUrgencyInfo(s.expected_delivery_at).urgent).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-600">Entrega hoje</p>
              <p className="text-2xl font-bold text-amber-600">
                {editingScripts.filter(s => {
                  const info = getUrgencyInfo(s.expected_delivery_at)
                  return info.label === 'Hoje' || info.label === 'Amanhã'
                }).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
              <p className="text-sm text-green-600">Com prazo ok</p>
              <p className="text-2xl font-bold text-green-600">
                {editingScripts.filter(s => {
                  const info = getUrgencyInfo(s.expected_delivery_at)
                  return info.color === 'green'
                }).length}
              </p>
            </div>
          </div>
        )}

        {/* Videos List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : scripts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <span className="text-4xl block mb-3">{activeTab === 'editing' ? '✅' : '📭'}</span>
            <p className="text-gray-600 font-medium">
              {activeTab === 'editing' ? 'Nenhum vídeo pendente' : 'Nenhum vídeo entregue ainda'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'editing' ? 'Todos os vídeos foram editados!' : 'Os vídeos entregues aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => {
              const urgency = getUrgencyInfo(script.expected_delivery_at)
              const isUploading = uploading?.scriptId === script.id
              const isDownloading = downloadingId === script.id
              const userPlan = (script.profiles?.plan || 'free') as UserPlan
              const planConfig = PLAN_CONFIG[userPlan]

              return (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${
                    activeTab === 'editing' && urgency.urgent ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {activeTab === 'editing' && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              urgency.color === 'red' ? 'bg-red-100 text-red-700' :
                              urgency.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                              urgency.color === 'green' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {urgency.label}
                            </span>
                          )}
                          {activeTab === 'delivered' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Entregue
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            userPlan === 'pro' ? 'bg-primary-100 text-primary' :
                            userPlan === 'lite' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {planConfig.name}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{script.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {script.profiles?.full_name || 'Usuário'} • {script.profiles?.email || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        {activeTab === 'editing' && script.expected_delivery_at && (
                          <>
                            <p className="text-xs text-gray-500">Entrega prevista</p>
                            <p className={`text-sm font-medium ${urgency.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(script.expected_delivery_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </>
                        )}
                        {activeTab === 'delivered' && script.editing_completed_at && (
                          <>
                            <p className="text-xs text-gray-500">Entregue em</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(script.editing_completed_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Editing Notes */}
                    {script.editing_notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Instruções do cliente:</p>
                        <p className="text-sm text-gray-700">{script.editing_notes}</p>
                      </div>
                    )}

                    {/* Script Content */}
                    {script.content && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                        <p className="text-xs text-gray-500 font-medium mb-2">Roteiro:</p>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {script.content}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {activeTab === 'editing' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadRaw(script)}
                            disabled={isDownloading || !script.raw_video_url}
                            className="flex-1"
                            icon={
                              isDownloading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              )
                            }
                          >
                            {isDownloading ? 'Baixando...' : 'Baixar Vídeo'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUploadClick(script.id)}
                            disabled={isUploading}
                            className="flex-1"
                            icon={
                              isUploading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>{uploading?.progress}%</span>
                                </div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                              )
                            }
                          >
                            {isUploading ? 'Enviando...' : 'Enviar Editado'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadRaw(script)}
                            disabled={isDownloading || !script.raw_video_url}
                            className="flex-1"
                            icon={
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            }
                          >
                            Baixar Original
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadEdited(script)}
                            disabled={isDownloading || !script.edited_video_url}
                            className="flex-1"
                            icon={
                              isDownloading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              )
                            }
                          >
                            {isDownloading ? 'Baixando...' : 'Baixar Editado'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
