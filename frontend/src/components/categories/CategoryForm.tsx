'use client'

import { useState } from 'react'
import { api, type CategoryCreate } from '@/lib/api'

interface CategoryFormProps {
  userId: string | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ userId, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError('')
    setLoading(true)

    try {
      if (!name.trim()) {
        setError('Please enter a category name')
        setLoading(false)
        return
      }

      const data: CategoryCreate = { name: name.trim() }
      await api.createCategory(userId, data)

      setName('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-xl"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-[#191A23] mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          Category Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#F3F3F3] border border-[#191A23] border-opacity-20 rounded-xl text-[#191A23] placeholder:text-[#191A23] placeholder:opacity-50 focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66] focus:ring-opacity-20 transition-all"
          style={{ fontFamily: 'Roboto, sans-serif' }}
          placeholder="e.g., Work, Personal, Shopping"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#191A23] text-white py-3 px-6 rounded-xl font-medium hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          {loading ? '⏳ Creating...' : '➕ Create Category'}
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
    </form>
  )
}
