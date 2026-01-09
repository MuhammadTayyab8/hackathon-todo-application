'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Task, type User, type Category } from '@/lib/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { KPICard } from '@/components/dashboard/KPICard'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { TaskItem } from '@/components/tasks/TaskItem'
import { CheckSquare, Clock, CheckCircle2, FolderOpen, Menu } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log(token, "token")
    if (!token) {
      router.push('/signin')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const userData = await api.getCurrentUser()
      setUser(userData)

      const [tasksData, categoriesData] = await Promise.all([
        api.getTasks(userData.id),
        api.getCategories(userData.id)
      ])

      console.log({tasksData, categoriesData})

      setTasks(tasksData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = () => {
    if (user) {
      api.getTasks(user.id).then(setTasks)
    }
  }

  const handleTaskEdit = (task: Task) => {
    router.push(`/tasks?edit=${task.id}`)
  }

  // Calculate stats
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter(t => !t.completed).length
  const completedTasks = tasks.filter(t => t.completed).length
  const totalCategories = categories.length

  // Get recent tasks (latest 5)
  const recentTasks = tasks.slice(0, 5)

  // Calculate task count per category
  const taskCountByCategory = tasks.reduce((acc, task) => {
    if (task.category_id) {
      acc[task.category_id] = (acc[task.category_id] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

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
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-[#F3F3F3] border-b border-[#191A23] border-opacity-10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-[#B9FF66] rounded-xl text-[#191A23]">
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-[#191A23] opacity-70 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Here's your productivity overview
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={CheckSquare} value={totalTasks} label="All Tasks" isLoading={loading} />
            <KPICard icon={Clock} value={pendingTasks} label="Pending" isLoading={loading} />
            <KPICard icon={CheckCircle2} value={completedTasks} label="Complete" isLoading={loading} />
            <KPICard icon={FolderOpen} value={totalCategories} label="Categories" isLoading={loading} />
          </div>

          {/* Recent Tasks Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Recent Tasks
                </h2>
                <p className="text-sm text-[#191A23] opacity-70" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Latest 5 tasks
                </p>
              </div>
              <button
                onClick={() => router.push('/tasks')}
                className="text-sm font-medium text-[#191A23] hover:underline"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                View all →
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#F3F3F3] rounded-xl p-4 h-24 animate-pulse" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="bg-[#F3F3F3] rounded-xl p-12 text-center border border-[#191A23] border-opacity-10">
                <CheckSquare size={48} className="text-[#191A23] opacity-30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  No tasks yet
                </h3>
                <p className="text-[#191A23] opacity-70 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Create your first task to get started
                </p>
                <button
                  onClick={() => router.push('/tasks')}
                  className="bg-[#191A23] text-white px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    userId={user.id}
                    onUpdate={handleTaskUpdate}
                    onEdit={handleTaskEdit}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Categories
              </h2>
              <button
                onClick={() => router.push('/categories')}
                className="text-sm font-medium text-[#191A23] hover:underline"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                View all →
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#B9FF66] rounded-xl p-6 h-40 animate-pulse" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-[#F3F3F3] rounded-xl p-12 text-center border border-[#191A23] border-opacity-10">
                <FolderOpen size={48} className="text-[#191A23] opacity-30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  No categories yet
                </h3>
                <p className="text-[#191A23] opacity-70 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Create categories to organize your tasks
                </p>
                <button
                  onClick={() => router.push('/categories')}
                  className="bg-[#191A23] text-white px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all"
                  style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Create Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    taskCount={taskCountByCategory[category.id] || 0}
                    onViewTasks={() => router.push(`/tasks?category=${category.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
