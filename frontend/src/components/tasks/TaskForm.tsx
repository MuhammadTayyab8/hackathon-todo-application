'use client'

import { useState, useEffect } from 'react'
import { api, type Task, type Category, type TaskCreate, type TaskUpdate } from '@/lib/api'
import { AlertCircle, Loader2, Check, Plus } from 'lucide-react'

interface TaskFormProps {
  userId: string | null
  task?: Task
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaskForm({ userId, task, onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '')
  const [categoryId, setCategoryId] = useState<number | ''>(task?.category_id || '')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      loadCategories()
    }
  }, [userId])

  const loadCategories = async () => {
    if (!userId) return
    try {
      const data = await api.getCategories(userId)
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError('')
    setLoading(true)

    try {
      if (!categoryId) {
        setError('Please select a category')
        setLoading(false)
        return
      }

      const data: TaskCreate | TaskUpdate = {
        title,
        category_id: Number(categoryId),
        description: description || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      }

      if (task) {
        await api.updateTask(userId, task.id, data)
      } else {
        await api.createTask(userId, data as TaskCreate)
      }

      setTitle('')
      setDescription('')
      setDueDate('')
      setCategoryId('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className=""
      style={{ animation: 'slideIn 0.3s ease-out' }}>

      {/* <h2
        className="text-2xl font-bold text-[#191A23] mb-6"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {task ? '✏️ Edit Task' : '➕ Create New Task'}
      </h2> */}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-xl mb-4 flex items-center gap-2"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[#191A23] mb-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-[#191A23]/20 rounded-xl text-[#191A23] placeholder:text-[#191A23]/50 focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66]/20 transition-all"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            placeholder="Enter task title"
          />
        </div>

        {/* Category Select */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-[#191A23] mb-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Category *
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full px-4 py-3 bg-white border border-[#191A23]/20 rounded-xl text-[#191A23] focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66]/20 transition-all"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description Textarea */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[#191A23] mb-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-[#191A23]/20 rounded-xl text-[#191A23] placeholder:text-[#191A23]/50 focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66]/20 transition-all resize-none"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            placeholder="Enter task description (optional)"
          />
        </div>

        {/* Due Date Input */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-[#191A23] mb-2"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#191A23]/20 rounded-xl text-[#191A23] focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66]/20 transition-all"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#191A23] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#191A23]/90 disabled:bg-[#191A23]/50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : task ? (
            <>
              <Check size={16} />
              Update Task
            </>
          ) : (
            <>
              <Plus size={16} />
              Create Task
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-[#191A23] text-[#191A23] rounded-xl font-medium hover:bg-[#191A23] hover:text-white transition-all duration-200"
            style={{ fontFamily: 'Roboto, sans-serif' }}>
            Cancel
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </form>
  )
}
