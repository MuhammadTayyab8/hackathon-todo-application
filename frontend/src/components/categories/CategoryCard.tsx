'use client'

import { FolderOpen, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import type { Category } from '@/lib/api'

interface CategoryCardProps {
  category: Category
  taskCount: number
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  onViewTasks?: (category: Category) => void
}

export function CategoryCard({ category, taskCount, onEdit, onDelete, onViewTasks }: CategoryCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className="bg-[#B9FF66] rounded-xl p-6 border border-[#191A23] border-opacity-10 min-h-[180px] relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg"
      style={{
        boxShadow: '0 2px 8px rgba(25, 26, 35, 0.1)'
      }}>

      {/* Background Pattern */}
      <div className="absolute top-0 right-0 text-8xl opacity-5 select-none">
        <FolderOpen size={96} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <FolderOpen size={32} className="text-[#191A23]" />

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#191A23] hover:bg-[#191A23] hover:bg-opacity-10 transition-all duration-200">
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-[#191A23] border-opacity-10 py-2 min-w-[120px] z-20">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(category)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-[#191A23] hover:bg-[#F3F3F3] transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(category)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category Name */}
        <h3
          className="text-2xl font-bold text-[#191A23] mb-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {category.name}
        </h3>

        {/* Task Count */}
        <p
          className="text-sm font-medium text-[#191A23] opacity-70 mb-4"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </p>

        {/* View Tasks Button */}
        <div className="mt-auto">
          {onViewTasks && (
            <button
              onClick={() => onViewTasks(category)}
              className="text-sm font-medium text-[#191A23] hover:underline transition-all duration-200 flex items-center gap-1"
              style={{ fontFamily: 'Roboto, sans-serif' }}>
              View tasks →
            </button>
          )}
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#191A23] opacity-5 rounded-tr-full" />
    </div>
  )
}
