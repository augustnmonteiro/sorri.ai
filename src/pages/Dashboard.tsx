import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, DashboardSkeleton } from '@/components/ui'
import { IdeasSection } from '@/components/dashboard/IdeasSection'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { supabase } from '@/lib/supabase'
import type { Script, ScriptStatus } from '@/types'

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { category } = useParams<{ category?: string }>()
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Map URL category to internal category type
  const categoryMap: Record<string, 'ideas' | ScriptStatus> = {
    'scripts': 'script',
    'recorded': 'recorded',
    'editing': 'editing',
    'published': 'published',
  }
  const selectedCategory: 'ideas' | ScriptStatus = category ? (categoryMap[category] || 'ideas') : 'ideas'

  // Separate ideas (no content) from scripts (with content)
  const ideas = scripts.filter((s) => !s.content_generated && s.status === 'script')
  const generatedScripts = scripts.filter((s) => s.content_generated)

  // Fetch scripts from database
  useEffect(() => {
    if (!user) return

    const fetchScripts = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('status_order', { ascending: true })

      if (error) {
        console.error('Error fetching scripts:', error)
      } else {
        setScripts(data || [])
      }
      setIsLoading(false)
    }

    fetchScripts()
  }, [user])

  const handleStatusChange = async (scriptId: string, newStatus: ScriptStatus) => {
    // Optimistic update
    setScripts((prev) =>
      prev.map((script) =>
        script.id === scriptId
          ? { ...script, status: newStatus, updated_at: new Date().toISOString() }
          : script
      )
    )

    // Update in database
    const { error } = await supabase
      .from('scripts')
      .update({ status: newStatus })
      .eq('id', scriptId)

    if (error) {
      console.error('Error updating script status:', error)
      // Revert on error
      const { data } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user?.id)
        .order('status_order', { ascending: true })
      if (data) setScripts(data)
    }
  }

  const handleScriptClick = (script: Script) => {
    navigate(`/script/${script.id}`)
  }

  // Only count generated scripts for the pipeline status
  const scriptsByStatus = {
    script: generatedScripts.filter((s) => s.status === 'script'),
    recorded: generatedScripts.filter((s) => s.status === 'recorded'),
    editing: generatedScripts.filter((s) => s.status === 'editing'),
    published: generatedScripts.filter((s) => s.status === 'published'),
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Stats / Category Filter */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'ideas' as const, path: '/dashboard', label: 'Ideias', count: ideas.length, icon: '💡' },
            { key: 'script' as const, path: '/dashboard/scripts', label: 'Roteiros', count: scriptsByStatus.script.length, icon: '📝' },
            { key: 'recorded' as const, path: '/dashboard/recorded', label: 'Gravados', count: scriptsByStatus.recorded.length, icon: '🎬' },
            { key: 'editing' as const, path: '/dashboard/editing', label: 'Em Edição', count: scriptsByStatus.editing.length, icon: '✂️' },
            { key: 'published' as const, path: '/dashboard/published', label: 'Publicados', count: scriptsByStatus.published.length, icon: '🚀' },
          ].map((stat) => {
            const isSelected = selectedCategory === stat.key
            return (
              <button
                key={stat.key}
                onClick={() => navigate(stat.path)}
                className={`text-left rounded-xl p-4 border-2 transition-all ${
                  isSelected
                    ? 'bg-primary-50 border-primary shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stat.icon}</span>
                  <p className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                </div>
                <p className={`text-2xl font-bold mt-1 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                  {stat.count}
                </p>
              </button>
            )
          })}
        </div>

        {/* Content based on selected category */}
        {selectedCategory === 'ideas' ? (
          /* Ideas Section */
          ideas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <span className="text-4xl block mb-3">💡</span>
              <p className="text-gray-600 font-medium">Nenhuma ideia disponível</p>
              <p className="text-sm text-gray-500 mt-1">Todas as ideias já foram geradas</p>
            </div>
          ) : (
            <IdeasSection
              ideas={ideas}
              onIdeaClick={handleScriptClick}
            />
          )
        ) : (
          /* Scripts by Status */
          (() => {
            const filteredScripts = scriptsByStatus[selectedCategory]
            const statusConfig = {
              script: { label: 'Roteiros', icon: '📝' },
              recorded: { label: 'Gravados', icon: '🎬' },
              editing: { label: 'Em Edição', icon: '✂️' },
              published: { label: 'Publicados', icon: '🚀' },
            }
            const config = statusConfig[selectedCategory]

            if (filteredScripts.length === 0) {
              return (
                <div className="space-y-4">
                  {/* Recording Checklist Button - Show even when empty */}
                  {selectedCategory === 'script' && (
                    <button
                      onClick={() => navigate('/checklist-gravacao')}
                      className="w-full bg-gradient-to-r from-primary to-primary-600 rounded-xl p-4 text-left hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎥</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">Me ajude a gravar</h4>
                          <p className="text-sm text-white/80">Checklist antes de gravar</p>
                        </div>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )}
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <span className="text-4xl block mb-3">{config.icon}</span>
                    <p className="text-gray-600 font-medium">Nenhum roteiro em {config.label.toLowerCase()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedCategory === 'script'
                        ? 'Gere roteiros a partir das ideias'
                        : 'Mova roteiros para esta etapa'}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div className="space-y-3">
                {/* Recording Checklist Button - Only show in scripts section */}
                {selectedCategory === 'script' && (
                  <button
                    onClick={() => navigate('/checklist-gravacao')}
                    className="w-full bg-gradient-to-r from-primary to-primary-600 rounded-xl p-4 text-left hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎥</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Me ajude a gravar</h4>
                        <p className="text-sm text-white/80">Checklist antes de gravar</p>
                      </div>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}

                {filteredScripts.map((script) => (
                  <div
                    key={script.id}
                    onClick={() => handleScriptClick(script)}
                    className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{script.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedCategory === 'editing' && script.expected_delivery_at ? (
                            <span className="text-primary">
                              Entrega prevista: {new Date(script.expected_delivery_at).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            (() => {
                              const createdDate = new Date(script.created_at)
                              const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                              return daysAgo === 0 ? 'Criado hoje' : `Criado há ${daysAgo} dia${daysAgo > 1 ? 's' : ''}`
                            })()
                          )}
                        </p>
                      </div>
                      {selectedCategory !== 'published' && selectedCategory !== 'editing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (selectedCategory === 'recorded') {
                              // Navigate to upload page for recorded -> editing transition
                              navigate(`/script/${script.id}/upload`)
                            } else {
                              const nextStatus = {
                                script: 'recorded',
                                recorded: 'editing',
                                editing: 'published',
                              } as const
                              handleStatusChange(script.id, nextStatus[selectedCategory])
                            }
                          }}
                          iconRight={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          }
                        >
                          {selectedCategory === 'recorded' ? 'Enviar para Edição' : 'Avançar'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
        )}
    </DashboardLayout>
  )
}
