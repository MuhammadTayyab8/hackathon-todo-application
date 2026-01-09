'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Task, type User } from '@/lib/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { TaskFilters } from '@/components/dashboard/TaskFilters'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/signin')
      return
    }

    fetchUser()
    fetchTasks()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, refreshTrigger])

  const fetchUser = async () => {
    try {
      const userData = await api.getCurrentUser()
      console.log(userData, "userData")
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/signin')
    }
  }

  const fetchTasks = async () => {
    if (!user?.id) return
    try {
      const tasksData = await api.getTasks(user.id)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setEditingTask(undefined)
    setShowForm(false)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingTask(undefined)
    setShowForm(false)
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = tasks.filter(t => !t.completed).length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-16 h-16 border-4 border-[#B9FF66] border-t-transparent rounded-full animate-spin"></div>
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
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden sticky top-0 z-30 bg-[#F3F3F3] border-b border-[#191A23]/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-[#B9FF66] rounded-xl text-[#191A23] text-xl">
            ☰
          </button>
          <h1
            className="text-xl font-bold text-[#191A23]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Task Dashboard
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-6" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h1
              className="text-4xl font-bold text-[#191A23] mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, {user.name}! 👋
            </h1>
            <p
              className="text-[#191A23]/70 text-lg"
              style={{ fontFamily: 'Roboto, sans-serif' }}>
              Here's what you need to focus on today
            </p>
          </div>

          {/* Dashboard Stats */}
          <div className="mb-6">
            <DashboardStats
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
            />
          </div>

          {/* Create Task Button (Mobile) */}
          {!showForm && (
            <div className="mb-6 md:hidden">
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-[#191A23] text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#191A23]/90 transition-all duration-200"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                <span className="text-xl">➕</span>
                <span>Create New Task</span>
              </button>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Form */}
            <div className="lg:col-span-1">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="hidden md:flex w-full bg-[#191A23] text-white py-4 px-6 rounded-xl font-medium items-center justify-center gap-2 hover:bg-[#191A23]/90 transition-all duration-200 hover:scale-105"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span className="text-xl">➕</span>
                  <span>Create New Task</span>
                </button>
              ) : (
                <TaskForm
                  userId={user.id}
                  task={editingTask}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              )}
            </div>

            {/* Right Column - Task List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <TaskFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Task List */}
              <TaskList
                userId={user.id}
                onEdit={handleEdit}
                refreshTrigger={refreshTrigger}
                filter={activeFilter}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  )
}
