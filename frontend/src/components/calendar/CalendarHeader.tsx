"use client"

import { getMonthName } from "@/lib/date-helpers"
import { ChevronLeft, ChevronRight } from "lucide-react"
// import { getMonthName } from "../../../lib/utils/date-helpers"


interface CalendarHeaderProps {
  currentMonth: number
  currentYear: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-secondary">
        {getMonthName(currentMonth)} {currentYear}
      </h2>
      <div className="flex gap-2">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-secondary/5 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-secondary" />
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-secondary/5 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-secondary" />
        </button>
      </div>
    </div>
  )
}
