"use client"

import { CalendarView } from "@/components/calendar/CalendarView"
import { Container } from "@/components/ui/Container"
import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function CalendarPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary mb-4">
            Authentication Required
          </h1>
          <p className="text-secondary/60">
            Please sign in to view your calendar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tertiary py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Task Calendar
          </h1>
          <p className="text-secondary/60">
            View your tasks across the month with color-coded urgency indicators.
          </p>
        </div>

        <CalendarView userId={user.id} />

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-secondary/10 p-4">
          <h3 className="text-sm font-semibold text-secondary mb-3">
            Urgency Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-secondary">
                High (≤1 day)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-secondary">
                Medium (2-3 days)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-secondary">
                Low (≥4 days)
              </span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
