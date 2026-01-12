"use client"

import { useState, useEffect } from "react"
import { api, Task } from "@/lib/api"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarGrid } from "./CalendarGrid"
import { Loader2 } from "lucide-react"

interface CalendarViewProps {
  userId: string
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadTasks()
  }, [userId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await api.getTasks(userId)
      setTasks(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div>
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid
        tasks={tasks}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  )
}
