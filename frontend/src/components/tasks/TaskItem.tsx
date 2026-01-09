'use client'

import { api, type Task } from '@/lib/api'

interface TaskItemProps {
  task: Task
  userId: string | null
  onUpdate: () => void
  onEdit: (task: Task) => void
}

export function TaskItem({ task, userId, onUpdate, onEdit }: TaskItemProps) {
  const handleToggleComplete = async () => {
    if (!userId) return
    try {
      await api.toggleTaskComplete(userId, task.id)
      onUpdate()
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  const handleDelete = async () => {
    if (!userId) return
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await api.deleteTask(userId, task.id)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <div
      className={`bg-[#F3F3F3] p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        task.completed ? 'opacity-60 border-[#191A23]/10' : 'border-[#191A23]/20'
      }`}
      style={{ animation: 'fadeIn 0.3s ease-out' }}>

      <div className="flex items-start gap-4">
        {/* Custom Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            task.completed
              ? 'bg-[#B9FF66] border-[#B9FF66] scale-110'
              : 'border-[#191A23]/30 hover:border-[#B9FF66]'
          }`}>
          {task.completed && (
            <span className="text-[#191A23] text-sm font-bold">✓</span>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-semibold mb-1 ${
              task.completed ? 'line-through text-[#191A23]/50' : 'text-[#191A23]'
            }`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-sm mb-3 ${
                task.completed ? 'text-[#191A23]/40' : 'text-[#191A23]/70'
              }`}
              style={{
                fontFamily: 'Roboto, sans-serif',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
              {task.description}
            </p>
          )}

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {task.category_name && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-lg bg-[#B9FF66] text-[#191A23] text-xs font-medium"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                🏷️ {task.category_name}
              </span>
            )}

            {task.due_date && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                  isOverdue
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-white text-[#191A23]/70 border border-[#191A23]/10'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                📅 {formatDate(task.due_date)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-[#B9FF66] hover:border-[#B9FF66] transition-all duration-200"
            title="Edit task">
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#191A23]/20 text-[#191A23] hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition-all duration-200"
            title="Delete task">
            🗑️
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
