"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar/CalendarView"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Menu } from "lucide-react"

export default function CalendarPage() {
  const { user, isLoading } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-16 h-16 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#191A23] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Authentication Required
          </h1>
          <p className="text-[#191A23] opacity-70" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Please sign in to view your calendar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-[#F3F3F3] border-b border-[#191A23] border-opacity-10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-[#B9FF66] rounded-xl text-[#191A23]">
            <Menu size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Calendar
          </h2>
          <div className="w-10"></div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Task Calendar
            </h2>
            <p className="text-[#191A23] opacity-70 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
              View your tasks across the month with color-coded urgency indicators.
            </p>
          </div>

          <CalendarView userId={user.id} />

          {/* Legend */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#191A23] border-opacity-10 p-6">
            <h3 className="text-lg font-bold text-[#191A23] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Urgency Legend
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-[#191A23]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  High (≤1 day)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-[#191A23]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Medium (2-3 days)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-[#191A23]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Low (≥4 days)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
