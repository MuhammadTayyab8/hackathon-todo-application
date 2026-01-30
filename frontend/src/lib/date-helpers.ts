export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

export function getMonthName(monthIndex: number) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[monthIndex] || ""
}



export function getTaskUrgencyColor(startDate: string, dueDate: string): string {
  const now = new Date()
  const start = new Date(startDate)
  const due = new Date(dueDate)

  if (now < start) return 'bg-blue-400' // upcoming
  if (now >= start && now <= due) return 'bg-green-500' // in progress
  if (now > due) return 'bg-red-500' // overdue

  return 'bg-gray-500' // fallback
}

/**
 * Get a CSS class based only on due date (for tasks without start date)
 */
export function getTaskUrgencyColorFromDueDate(dueDate: string): string {
  const now = new Date()
  const due = new Date(dueDate)

  if (now <= due) return 'bg-green-500'
  if (now > due) return 'bg-red-500'

  return 'bg-gray-500'
}