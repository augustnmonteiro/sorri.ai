import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ScriptCard } from './ScriptCard'
import type { Script, ScriptStatus } from '@/types'

interface KanbanColumnProps {
  status: ScriptStatus
  title: string
  scripts: Script[]
  onStatusChange: (scriptId: string, newStatus: ScriptStatus) => void
  onScriptClick?: (script: Script) => void
}

export function KanbanColumn({ status, title, scripts, onStatusChange, onScriptClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const statusColors: Record<ScriptStatus, string> = {
    script: 'bg-primary',
    recorded: 'bg-amber-500',
    editing: 'bg-secondary',
    published: 'bg-green-500',
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-2xl p-4 min-h-[500px] transition-colors ${
        isOver ? 'bg-primary-50 ring-2 ring-primary ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="ml-auto text-sm text-gray-400 bg-white px-2 py-0.5 rounded-full">
          {scripts.length}
        </span>
      </div>

      <SortableContext items={scripts.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onStatusChange={onStatusChange}
              onClick={() => onScriptClick?.(script)}
            />
          ))}
        </div>
      </SortableContext>

      {scripts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Nenhum roteiro</p>
        </div>
      )}
    </div>
  )
}
