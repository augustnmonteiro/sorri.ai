import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import type { Script, ScriptStatus } from '@/types'
import { SCRIPT_STATUS_CONFIG } from '@/utils/constants'

interface KanbanBoardProps {
  scripts: Script[]
  onStatusChange: (scriptId: string, newStatus: ScriptStatus) => void
  onScriptClick?: (script: Script) => void
}

const columns: ScriptStatus[] = ['script', 'recorded', 'editing', 'published']

export function KanbanBoard({ scripts, onStatusChange, onScriptClick }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const scriptId = active.id as string
      const newStatus = over.id as ScriptStatus

      if (columns.includes(newStatus)) {
        onStatusChange(scriptId, newStatus)
      }
    }
  }

  const getScriptsByStatus = (status: ScriptStatus) =>
    scripts
      .filter((s) => s.status === status)
      .sort((a, b) => a.status_order - b.status_order)

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={SCRIPT_STATUS_CONFIG[status].label}
            scripts={getScriptsByStatus(status)}
            onStatusChange={onStatusChange}
            onScriptClick={onScriptClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
