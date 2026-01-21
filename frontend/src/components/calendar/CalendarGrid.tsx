"use client"

import { Task } from "@/lib/api"
import { TaskEvent } from "./TaskEvent"
import { getDaysInMonth, getFirstDayOfMonth, isDateInRange } from "../../../lib/utils/date-helpers"

interface CalendarGridProps {
  tasks: Task[]
  currentMonth: number
  currentYear: number
}

export function CalendarGrid({ tasks, currentMonth, currentYear }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  // Day of week headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate calendar days array
  const calendarDays: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Filter tasks for a specific day
  const getTasksForDay = (day: number): Task[] => {
    const currentDate = new Date(currentYear, currentMonth, day)
    currentDate.setHours(0, 0, 0, 0)

    return tasks.filter(task => {
      // If task has both start_date and due_date, check if current date is in range
      if (task.start_date && task.due_date) {
        const startDate = new Date(task.start_date)
        startDate.setHours(0, 0, 0, 0)
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)

        return isDateInRange(currentDate, startDate, dueDate)
      }

      // If task only has due_date, show it on that day
      if (task.due_date) {
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return currentDate.getTime() === dueDate.getTime()
      }

      return false
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary/10">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px bg-secondary/10">
        {dayHeaders.map(day => (
          <div
            key={day}
            className="bg-tertiary p-3 text-center text-sm font-semibold text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-secondary/10">
        {calendarDays.map((day, index) => {
          const dayTasks = day ? getTasksForDay(day) : []

          return (
            <div
              key={index}
              className={`bg-white min-h-[120px] p-2 ${
                day ? 'hover:bg-secondary/5' : 'bg-tertiary/50'
              } transition-colors`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-secondary mb-2">
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.map(task => (
                      <TaskEvent key={task.id} task={task} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="p-8 text-center text-secondary/60">
          No tasks to display. Create some tasks to see them on the calendar.
        </div>
      )}
    </div>
  )
}
