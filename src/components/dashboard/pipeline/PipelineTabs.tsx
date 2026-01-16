import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import type { Script, ScriptStatus } from '@/types'
import { SCRIPT_STATUS_CONFIG } from '@/utils/constants'

interface PipelineTabsProps {
  scripts: Script[]
  onStatusChange: (scriptId: string, newStatus: ScriptStatus) => void
  onScriptClick?: (script: Script) => void
}

const tabs: ScriptStatus[] = ['script', 'recorded', 'editing', 'published']

export function PipelineTabs({ scripts, onStatusChange, onScriptClick }: PipelineTabsProps) {
  const [activeTab, setActiveTab] = useState<ScriptStatus>('script')

  const filteredScripts = scripts.filter((s) => s.status === activeTab)

  const getScriptCount = (status: ScriptStatus) =>
    scripts.filter((s) => s.status === status).length

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          const count = getScriptCount(tab)

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {SCRIPT_STATUS_CONFIG[tab].label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {filteredScripts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-500">Nenhum roteiro nesta etapa</p>
            </div>
          ) : (
            filteredScripts.map((script) => {
              const config = SCRIPT_STATUS_CONFIG[script.status]
              const createdDate = new Date(script.created_at)
              const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
              const hasContent = script.content_generated

              return (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onScriptClick?.(script)}
                  className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{hasContent ? '📝' : '💡'}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{script.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {!hasContent ? (
                          <span className="text-amber-600">Toque para gerar roteiro</span>
                        ) : daysAgo === 0 ? (
                          'Criado hoje'
                        ) : (
                          `Criado há ${daysAgo} dia${daysAgo > 1 ? 's' : ''}`
                        )}
                      </p>
                    </div>
                  </div>

                  {hasContent && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={(e) => {
                          e.stopPropagation()
                          onScriptClick?.(script)
                        }}>
                        Ver
                      </Button>
                      {config.nextStatus && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(script.id, config.nextStatus!)
                          }}
                          iconRight={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          }
                        >
                          {config.nextLabel}
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
