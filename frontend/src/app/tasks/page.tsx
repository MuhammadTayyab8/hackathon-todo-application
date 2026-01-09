'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, type Task, type User } from '@/lib/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { KPICard } from '@/components/dashboard/KPICard'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Modal } from '@/components/ui/Modal'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { CheckSquare, Clock, CheckCircle2, Search, Menu } from 'lucide-react'

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
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

      const tasksData = await api.getTasks(userData.id)
      setTasks(tasksData)
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
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTask(undefined)
  }

  const handleSuccess = () => {
    handleModalClose()
    handleTaskUpdate()
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Apply completion filter
    if (activeFilter === 'active' && task.completed) return false
    if (activeFilter === 'completed' && !task.completed) return false

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category_name?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Calculate stats
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter(t => !t.completed).length
  const completedTasks = tasks.filter(t => t.completed).length

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
            Tasks
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Tasks
            </h1>
            <p className="text-[#191A23] opacity-70 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Manage all your tasks
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KPICard icon={CheckSquare} value={totalTasks} label="All Tasks" isLoading={loading} />
            <KPICard icon={Clock} value={pendingTasks} label="Pending" isLoading={loading} />
            <KPICard icon={CheckCircle2} value={completedTasks} label="Complete" isLoading={loading} />
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'completed'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeFilter === filter
                      ? 'bg-[#B9FF66] text-[#191A23] shadow-md scale-105'
                      : 'bg-[#F3F3F3] text-[#191A23] hover:bg-[#B9FF66] hover:bg-opacity-30 border border-[#191A23] border-opacity-10'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#191A23] opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-12 pr-4 py-3 bg-[#F3F3F3] border border-[#191A23] border-opacity-20 rounded-xl text-[#191A23] placeholder:text-[#191A23] placeholder:opacity-50 focus:outline-none focus:border-[#B9FF66] focus:border-2 focus:ring-2 focus:ring-[#B9FF66] focus:ring-opacity-20 transition-all duration-200"
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-[#F3F3F3] rounded-xl p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-[#F3F3F3] rounded-xl p-12 text-center border border-[#191A23] border-opacity-10">
              <CheckSquare size={64} className="text-[#191A23] opacity-30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {searchQuery ? 'No tasks match your search' : 'No tasks yet'}
              </h3>
              <p className="text-[#191A23] opacity-70" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {searchQuery ? 'Try a different search term' : 'Click the + button to create your first task'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    animation: 'fadeInUp 0.3s ease-out',
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'backwards'
                  }}>
                  <TaskItem
                    task={task}
                    userId={user.id}
                    onUpdate={handleTaskUpdate}
                    onEdit={handleTaskEdit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => setIsModalOpen(true)}
        label="Create Task"
      />

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <TaskForm
          userId={user.id}
          task={editingTask}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
