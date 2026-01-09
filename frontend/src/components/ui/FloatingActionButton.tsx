'use client'

import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
}

export function FloatingActionButton({ onClick, label = 'Create' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#191A23] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      style={{
        boxShadow: '0 4px 16px rgba(25, 26, 35, 0.3)'
      }}
      aria-label={label}>
      <Plus size={24} />
    </button>
  )
}
