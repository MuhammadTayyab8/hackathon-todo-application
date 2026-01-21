"use client"

import { Task } from "@/lib/api"
import { getTaskUrgencyColor, getTaskUrgencyColorFromDueDate } from "../../../lib/utils/task-colors"

interface TaskEventProps {
  task: Task
}

export function TaskEvent({ task }: TaskEventProps) {
  // Determine urgency color based on date range
  const urgencyColor = task.start_date && task.due_date
    ? getTaskUrgencyColor(task.start_date, task.due_date)
    : task.due_date
    ? getTaskUrgencyColorFromDueDate(task.due_date)
    : 'bg-gray-500'

  return (
    <div
      className={`${urgencyColor} text-white text-xs px-2 py-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 transition-opacity`}
      title={`${task.title}${task.description ? ` - ${task.description}` : ''}`}
    >
      {task.title}
    </div>
  )
}
