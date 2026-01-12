# Quickstart: Auth-Aware Routing & Calendar

**Feature**: 001-auth-routing-calendar
**Date**: 2026-01-12
**Estimated Time**: 11-17 hours

## Overview

This guide provides step-by-step instructions for implementing authentication-aware routing, cookie-based token storage, task date ranges, and a visual calendar view.

---

## Prerequisites

### Required Software
- Node.js 18+ (for Next.js 16)
- Python 3.11+ (for FastAPI)
- PostgreSQL (Neon) connection string
- Git

### Existing Setup
- Backend: FastAPI with SQLModel and JWT authentication
- Frontend: Next.js 16 with Better Auth
- Database: Neon PostgreSQL with existing tasks table
- Authentication: Better Auth with JWT tokens

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@host/db
BETTER_AUTH_SECRET=your-secret-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Phase 1: Backend - Data Model & API (2-3 hours)

### Step 1.1: Create Database Migration

```bash
cd backend

# Create new migration file
alembic revision -m "add_task_start_date"
```

Edit the generated migration file in `backend/src/migrations/versions/`:

```python
"""add_task_start_date

Revision ID: 002_add_task_start_date
Revises: 001_add_category_and_update_task_fields
Create Date: 2026-01-12
"""
from alembic import op
import sqlalchemy as sa

revision = '002_add_task_start_date'
down_revision = '001_add_category_and_update_task_fields'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('tasks', 'start_date')
```

Apply the migration:

```bash
alembic upgrade head

# Verify migration
alembic current
```

### Step 1.2: Update Task Model

Edit `backend/src/models/task.py`:

```python
from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(min_length=1)
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # ADD THIS LINE
    due_date: Optional[datetime] = None
    category_id: Optional[int] = Field(foreign_key="category.id")
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class TaskCreate(SQLModel):
    title: str = Field(min_length=1)
    category_id: int
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # ADD THIS LINE
    due_date: Optional[datetime] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # ADD THIS LINE
    due_date: Optional[datetime] = None
    content: Optional[str] = None
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    start_date: Optional[datetime]  # ADD THIS LINE
    due_date: Optional[datetime]
    category_id: Optional[int]
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

### Step 1.3: Add Date Validation to Routes

Edit `backend/src/api/routes/tasks.py`:

```python
from fastapi import HTTPException

# In create_task endpoint
@router.post("/", response_model=TaskRead, status_code=201)
async def create_task(
    user_id: uuid.UUID,
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt)
):
    # Existing user_id verification...

    # ADD DATE VALIDATION
    if task.start_date and task.due_date:
        if task.start_date > task.due_date:
            raise HTTPException(
                status_code=400,
                detail="start_date cannot be after due_date"
            )

    # Existing task creation logic...

# In update_task endpoint
@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_jwt)
):
    # Existing task retrieval...

    # ADD DATE VALIDATION
    start = task_update.start_date if task_update.start_date is not None else existing_task.start_date
    due = task_update.due_date if task_update.due_date is not None else existing_task.due_date

    if start and due and start > due:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after due_date"
        )

    # Existing update logic...
```

### Step 1.4: Test Backend Changes

```bash
# Run backend tests
pytest backend/src/tests/api/test_tasks.py -v

# Test manually with curl
curl -X POST http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "category_id": 1,
    "start_date": "2026-01-15T09:00:00Z",
    "due_date": "2026-01-20T17:00:00Z"
  }'
```

---

## Phase 2: Frontend - Middleware & Auth (2-3 hours)

### Step 2.1: Create Middleware

Create `frontend/src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authToken = request.cookies.get('auth_token')?.value

  const isPublicRoute = ['/', '/signin', '/signup'].includes(path)
  const isProtectedRoute = ['/dashboard', '/tasks', '/categories', '/calendar'].some(
    route => path.startsWith(route)
  )

  // Protected route without auth → redirect to signin
  if (isProtectedRoute && !authToken) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(signinUrl)
  }

  // Auth pages with auth → redirect to dashboard
  if (['/signin', '/signup'].includes(path) && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}
```

### Step 2.2: Configure Better Auth for Cookies

Edit `frontend/src/lib/auth.ts`:

```typescript
import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    jwtClient({
      issuer: "todo-app",
      expiresIn: "7d",
    })
  ],
  cookieStorage: {  // ADD THIS SECTION
    name: 'auth_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/'
    }
  }
})
```

### Step 2.3: Create useAuth Hook

Create `frontend/src/hooks/useAuth.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth'

interface User {
  id: string
  username: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        if (session?.user) {
          setUser(session.user as User)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { user, isAuthenticated, isLoading }
}
```

### Step 2.4: Update Navbar Component

Edit `frontend/src/components/layout/Navbar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { authClient } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/')
  }

  if (isLoading) {
    return <nav>Loading...</nav>
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold">
        Todo App
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-gray-700">Welcome, {user?.username}</span>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/tasks">Tasks</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/calendar">Calendar</Link>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="btn-primary">
              Login
            </Link>
            <Link href="/signup" className="btn-secondary">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
```

### Step 2.5: Test Middleware

```bash
# Start frontend dev server
cd frontend
npm run dev

# Test scenarios:
# 1. Navigate to /dashboard without auth → should redirect to /signin
# 2. Login and navigate to /signin → should redirect to /dashboard
# 3. Logout and verify navbar updates
# 4. Check browser cookies for auth_token (HttpOnly flag)
```

---

## Phase 3: Frontend - Task Form Enhancement (1-2 hours)

### Step 3.1: Update Task Interface

Edit `frontend/src/lib/api.ts`:

```typescript
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  start_date?: string  // ADD THIS LINE
  due_date?: string
  category_id?: number
  category_name?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  category_id: number
  description?: string
  start_date?: string  // ADD THIS LINE
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  category_id?: number
  description?: string
  start_date?: string  // ADD THIS LINE
  due_date?: string
  completed?: boolean
}
```

### Step 3.2: Update TaskForm Component

Edit `frontend/src/components/tasks/TaskForm.tsx`:

```typescript
'use client'

import { useState } from 'react'

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => void
  initialData?: Task
}

export function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category_id: initialData?.category_id || 1,
    description: initialData?.description || '',
    start_date: initialData?.start_date?.split('T')[0] || '',  // ADD THIS LINE
    due_date: initialData?.due_date?.split('T')[0] || '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // ADD DATE VALIDATION
    if (formData.start_date && formData.due_date) {
      const start = new Date(formData.start_date)
      const due = new Date(formData.due_date)

      if (start > due) {
        setError('Start date cannot be after end date')
        return
      }
    }

    onSubmit({
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* ADD START DATE FIELD */}
      <div>
        <label htmlFor="start_date">Start Date</label>
        <input
          type="date"
          id="start_date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="due_date">End Date</label>
        <input
          type="date"
          id="due_date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn-primary">
        {initialData ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  )
}
```

---

## Phase 4: Frontend - Calendar View (4-6 hours)

### Step 4.1: Create Utility Functions

Create `frontend/src/lib/utils/task-colors.ts`:

```typescript
export function getTaskUrgencyColor(endDate: Date): string {
  const now = new Date()
  const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 1) return 'bg-red-500'
  if (daysUntil <= 3) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function getTaskUrgencyTextColor(endDate: Date): string {
  const now = new Date()
  const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 1) return 'text-red-700'
  if (daysUntil <= 3) return 'text-yellow-700'
  return 'text-green-700'
}
```

Create `frontend/src/lib/utils/date-helpers.ts`:

```typescript
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}
```

### Step 4.2: Create Calendar Components

Create `frontend/src/components/calendar/CalendarHeader.tsx`:

```typescript
'use client'

interface CalendarHeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({ currentDate, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={onPrevMonth} className="btn-secondary">
        ← Previous
      </button>
      <h2 className="text-2xl font-bold">{monthYear}</h2>
      <button onClick={onNextMonth} className="btn-secondary">
        Next →
      </button>
    </div>
  )
}
```

Create `frontend/src/components/calendar/TaskEvent.tsx`:

```typescript
import { Task } from '@/lib/api'
import { getTaskUrgencyColor } from '@/lib/utils/task-colors'

interface TaskEventProps {
  task: Task
}

export function TaskEvent({ task }: TaskEventProps) {
  const endDate = task.due_date ? new Date(task.due_date) : new Date()
  const colorClass = getTaskUrgencyColor(endDate)

  return (
    <div className={`${colorClass} text-white text-xs p-1 rounded mb-1 truncate`}>
      {task.title}
    </div>
  )
}
```

Create `frontend/src/components/calendar/CalendarGrid.tsx`:

```typescript
'use client'

import { Task } from '@/lib/api'
import { TaskEvent } from './TaskEvent'
import { getDaysInMonth, getFirstDayOfMonth, isSameDay, isDateInRange } from '@/lib/utils/date-helpers'

interface CalendarGridProps {
  currentDate: Date
  tasks: Task[]
}

export function CalendarGrid({ currentDate, tasks }: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="border p-2 bg-gray-50" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayTasks = tasks.filter(task => {
      const start = task.start_date ? new Date(task.start_date) : null
      const end = task.due_date ? new Date(task.due_date) : null

      if (start && end) {
        return isDateInRange(date, start, end)
      } else if (end) {
        return isSameDay(date, end)
      }
      return false
    })

    days.push(
      <div key={day} className="border p-2 min-h-[100px]">
        <div className="font-bold mb-2">{day}</div>
        {dayTasks.map(task => (
          <TaskEvent key={task.id} task={task} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-0">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="border p-2 font-bold text-center bg-gray-100">
          {day}
        </div>
      ))}
      {days}
    </div>
  )
}
```

Create `frontend/src/components/calendar/CalendarView.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Task, api } from '@/lib/api'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const allTasks = await api.getTasks()
        setTasks(allTasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (isLoading) {
    return <div>Loading calendar...</div>
  }

  return (
    <div className="p-4">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid currentDate={currentDate} tasks={tasks} />
    </div>
  )
}
```

### Step 4.3: Create Calendar Page

Create `frontend/src/app/calendar/page.tsx`:

```typescript
import { CalendarView } from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Task Calendar</h1>
      <CalendarView />
    </div>
  )
}
```

---

## Testing Checklist

### Backend Tests
- [ ] Migration applies successfully
- [ ] start_date field exists in database
- [ ] Task creation with start_date works
- [ ] Date validation rejects start_date > due_date
- [ ] Existing tasks still work (backward compatibility)

### Frontend Tests
- [ ] Middleware redirects unauthenticated users from /dashboard
- [ ] Middleware redirects authenticated users from /signin
- [ ] Navbar shows username when logged in
- [ ] Navbar shows Login/Signup when logged out
- [ ] auth_token cookie exists and is HttpOnly
- [ ] Task form accepts start_date and due_date
- [ ] Task form validates start_date <= due_date
- [ ] Calendar page loads without errors
- [ ] Calendar displays tasks with correct colors
- [ ] Calendar navigation (prev/next month) works

---

## Deployment

### Backend Deployment

```bash
# Apply migration to production database
alembic upgrade head

# Restart backend server
# (Vercel/Railway will auto-deploy on git push)
```

### Frontend Deployment

```bash
# Build and deploy
npm run build
# Push to git (Vercel auto-deploys)
```

### Environment Variables (Production)

```bash
# Vercel/Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
BETTER_AUTH_SECRET=production-secret-key
DATABASE_URL=postgresql://prod-connection-string
```

---

## Troubleshooting

### Issue: Middleware infinite redirect loop
**Solution**: Check that redirect targets are not in protected/public route lists

### Issue: Cookie not persisting
**Solution**: Ensure `secure: false` in development, `secure: true` in production

### Issue: Date validation not working
**Solution**: Verify dates are ISO 8601 strings, check timezone handling

### Issue: Calendar not showing tasks
**Solution**: Check that tasks have start_date or due_date, verify date range logic

---

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Begin implementation following this guide
3. Test each phase before moving to the next
4. Monitor performance metrics in production
5. Gather user feedback on calendar UX
