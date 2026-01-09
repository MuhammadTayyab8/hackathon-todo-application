'use client'

import { useState, useEffect } from 'react'
import { api, type Task } from '@/lib/api'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  userId: string | null
  onEdit: (task: Task) => void
  refreshTrigger?: number
  filter?: 'all' | 'active' | 'completed'
  searchQuery?: string
}

export function TaskList({ userId, onEdit, refreshTrigger, filter = 'all', searchQuery = '' }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      loadTasks()
    }
  }, [userId, refreshTrigger])

  const loadTasks = async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError('')
      const data = await api.getTasks(userId)
      setTasks(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    // Apply completion filter
    if (filter === 'active' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category_name?.toLowerCase().includes(query)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="bg-[#F3F3F3] p-12 rounded-xl text-center border border-[#191A23]/10">
        <div className="w-16 h-16 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-[#191A23]/70" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Loading tasks...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
        ⚠️ {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Count Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-bold text-[#191A23]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {filter === 'all' && `All Tasks (${filteredTasks.length})`}
          {filter === 'active' && `Active Tasks (${filteredTasks.length})`}
          {filter === 'completed' && `Completed Tasks (${filteredTasks.length})`}
        </h2>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#F3F3F3] p-12 rounded-xl text-center border border-[#191A23]/10">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-[#191A23]/70 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {searchQuery
              ? 'No tasks match your search.'
              : filter === 'all'
              ? 'No tasks yet. Create your first task!'
              : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              style={{
                animation: 'fadeInUp 0.3s ease-out',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'backwards'
              }}>
              <TaskItem
                task={task}
                userId={userId}
                onUpdate={loadTasks}
                onEdit={onEdit}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
