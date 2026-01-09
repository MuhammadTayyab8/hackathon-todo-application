'use client'

import { useEffect, useState } from 'react'

interface DashboardStatsProps {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export function DashboardStats({ totalTasks, completedTasks, pendingTasks }: DashboardStatsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      color: '#B9FF66'
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: '✓',
      color: '#B9FF66'
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: '⏳',
      color: '#B9FF66'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`bg-[#B9FF66] rounded-xl p-4 relative overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-lg ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: `${index * 0.1}s`,
            border: '1px solid #191A23',
            boxShadow: '0 2px 8px rgba(25, 26, 35, 0.1)'
          }}>

          {/* Background Pattern */}
          <div className="absolute top-0 right-0 text-6xl opacity-10 select-none">
            {stat.icon}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <div className="w-10 h-10 rounded-lg bg-[#191A23]/5 flex items-center justify-center">
                <span className="text-xs text-[#191A23]/50">📊</span>
              </div>
            </div>

            <div className="mt-3">
              <div
                className="text-5xl font-bold text-[#191A23] mb-1"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1,
                  animation: 'countUp 0.8s ease-out'
                }}>
                {stat.value}
              </div>
              <div
                className="text-[#191A23]/70 text-sm font-medium"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                {stat.label}
              </div>
            </div>
          </div>

          {/* Decorative Corner */}
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#191A23]/5 rounded-tr-full" />
        </div>
      ))}

      <style jsx>{`
        @keyframes countUp {
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
