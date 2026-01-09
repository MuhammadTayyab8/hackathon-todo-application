'use client'

import { useState } from 'react'

interface TaskFiltersProps {
  activeFilter: 'all' | 'active' | 'completed'
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function TaskFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange
}: TaskFiltersProps) {
  const filters = [
    { id: 'all' as const, label: 'All Tasks', icon: '📋' },
    { id: 'active' as const, label: 'Active', icon: '⚡' },
    { id: 'completed' as const, label: 'Completed', icon: '✓' }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              activeFilter === filter.id
                ? 'bg-[#B9FF66] text-[#191A23] shadow-md scale-105'
                : 'bg-[#F3F3F3] text-[#191A23] hover:bg-[#B9FF66]/30 border border-[#191A23]/10'
            }`}
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px'
            }}>
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191A23]/50 text-lg">
          🔍
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-12 pr-4 py-3 bg-[#F3F3F3] border border-[#191A23]/20 rounded-xl text-[#191A23] placeholder:text-[#191A23]/50 focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66]/20 transition-all duration-200"
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px'
          }}
        />
      </div>
    </div>
  )
}
