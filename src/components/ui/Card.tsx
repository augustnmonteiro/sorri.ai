import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  selected?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, selected = false, onClick }: CardProps) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-white rounded-2xl border p-6 transition-all duration-300
        ${hover ? 'hover:shadow-soft hover:border-primary-light cursor-pointer' : ''}
        ${selected ? 'border-primary ring-2 ring-primary/20 shadow-glow' : 'border-gray-200'}
        ${onClick ? 'text-left w-full' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}
