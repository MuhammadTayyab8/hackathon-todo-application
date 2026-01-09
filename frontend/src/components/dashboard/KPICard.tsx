'use client'

import { LucideIcon, TrendingUp } from 'lucide-react'

interface KPICardProps {
  icon: LucideIcon
  value: number
  label: string
  trend?: number
  isLoading?: boolean
}

export function KPICard({ icon: Icon, value, label, trend, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#B9FF66] rounded-xl p-4 border border-[#191A23] border-opacity-10 min-h-[120px] animate-pulse">
        <div className="h-6 w-6 bg-[#191A23] bg-opacity-10 rounded mb-4" />
        <div className="h-12 w-20 bg-[#191A23] bg-opacity-10 rounded mb-2" />
        <div className="h-4 w-24 bg-[#191A23] bg-opacity-10 rounded" />
      </div>
    )
  }

  return (
    <div
      className="bg-[#B9FF66] rounded-xl p-4 border border-[#191A23] border-opacity-10 min-h-[120px] relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
      style={{
        boxShadow: '0 2px 8px rgba(25, 26, 35, 0.1)'
      }}>

      {/* Background Pattern */}
      <div className="absolute top-0 right-0 text-6xl opacity-5 select-none">
        <Icon size={64} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-3">
          <Icon size={24} className="text-[#191A23]" />
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-[#191A23] opacity-50">
              <TrendingUp size={16} />
              <span className="text-xs font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>

        {/* Number */}
        <div
          className="text-5xl font-bold text-[#191A23] mb-1 leading-none"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            animation: 'countUp 0.8s ease-out'
          }}>
          {value}
        </div>

        {/* Label */}
        <div
          className="text-sm font-medium text-[#191A23] opacity-70"
          style={{ fontFamily: 'Roboto, sans-serif' }}>
          {label}
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#191A23] opacity-5 rounded-tr-full" />

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
