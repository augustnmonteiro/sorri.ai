import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

interface ChecklistItem {
  id: string
  label: string
  description: string
  icon: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'lighting',
    label: 'Iluminação adequada',
    description: 'Luz natural de frente ou ring light posicionado',
    icon: '💡',
  },
  {
    id: 'audio',
    label: 'Áudio limpo',
    description: 'Ambiente silencioso, microfone de lapela ou celular próximo',
    icon: '🎤',
  },
  {
    id: 'camera',
    label: 'Câmera estável',
    description: 'Tripé ou apoio firme, câmera na altura dos olhos',
    icon: '📱',
  },
  {
    id: 'background',
    label: 'Fundo organizado',
    description: 'Ambiente limpo e profissional atrás de você',
    icon: '🖼️',
  },
  {
    id: 'script',
    label: 'Roteiro em mãos',
    description: 'Roteiro aberto no celular ou impresso para consulta',
    icon: '📝',
  },
  {
    id: 'appearance',
    label: 'Aparência pronta',
    description: 'Roupa adequada, cabelo arrumado, jaleco se necessário',
    icon: '👔',
  },
]

export function RecordingChecklistPage() {
  const navigate = useNavigate()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const allChecked = checkedItems.size === CHECKLIST_ITEMS.length
  const progress = (checkedItems.size / CHECKLIST_ITEMS.length) * 100

  const handleReady = () => {
    navigate(-1)
  }

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
            <h1 className="font-semibold text-gray-900 truncate">Checklist de Gravação</h1>
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
          {/* Intro Card */}
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎥</span>
              <h2 className="text-xl font-bold">Antes de gravar...</h2>
            </div>
            <p className="text-white/90">
              Verifique se tudo está pronto para garantir a melhor qualidade no seu vídeo.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Seu progresso</h3>
              <span className="text-sm font-medium text-primary">
                {checkedItems.size}/{CHECKLIST_ITEMS.length}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {allChecked && (
              <p className="text-green-600 text-sm font-medium mt-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tudo pronto! Hora de gravar!
              </p>
            )}
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item, index) => {
              const isChecked = checkedItems.has(item.id)
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all ${
                    isChecked
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isChecked ? 'text-green-700' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-sm ${isChecked ? 'text-green-600' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Reset Button */}
          {checkedItems.size > 0 && !allChecked && (
            <button
              onClick={() => setCheckedItems(new Set())}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Resetar checklist
            </button>
          )}
        </motion.div>
      </main>

      {/* Bottom Action Bar */}
      {allChecked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={handleReady}
              className="w-full"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Estou pronto!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
