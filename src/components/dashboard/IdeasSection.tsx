import { motion } from 'framer-motion'
import type { Script } from '@/types'

interface IdeasSectionProps {
  ideas: Script[]
  onIdeaClick?: (idea: Script) => void
}

export function IdeasSection({ ideas, onIdeaClick }: IdeasSectionProps) {
  if (ideas.length === 0) {
    return null
  }

  return (
    <div>
      {/* Ideas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {ideas.map((idea) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onIdeaClick?.(idea)}
            className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
          >
            <span className="text-2xl block mb-2">💡</span>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {idea.title}
            </h4>
            <p className="text-xs text-amber-600 mt-2">
              Toque para gerar
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
