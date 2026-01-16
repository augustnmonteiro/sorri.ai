import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import type { Script, ScriptStatus } from '@/types'
import { SCRIPT_STATUS_CONFIG } from '@/utils/constants'

interface ScriptCardProps {
  script: Script
  onStatusChange: (scriptId: string, newStatus: ScriptStatus) => void
  onClick?: () => void
}

export function ScriptCard({ script, onStatusChange, onClick }: ScriptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: script.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = SCRIPT_STATUS_CONFIG[script.status]
  const createdDate = new Date(script.created_at)
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  const handleNextStatus = () => {
    if (config.nextStatus) {
      onStatusChange(script.id, config.nextStatus)
    }
  }

  const hasContent = script.content_generated

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl p-4 border border-gray-200 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-primary opacity-90' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{hasContent ? '📝' : '💡'}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{script.title}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {!hasContent ? (
              <span className="text-amber-600">Clique para gerar roteiro</span>
            ) : daysAgo === 0 ? (
              'Criado hoje'
            ) : (
              `Criado há ${daysAgo} dia${daysAgo > 1 ? 's' : ''}`
            )}
          </p>
        </div>
      </div>

      {config.nextStatus && hasContent && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleNextStatus()
            }}
            className="w-full justify-center text-primary hover:bg-primary-50"
          >
            {config.nextLabel}
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </motion.div>
  )
}
