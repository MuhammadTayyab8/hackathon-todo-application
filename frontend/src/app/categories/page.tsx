'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api, type Category, type User, type Task } from '@/lib/api'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { KPICard } from '@/components/dashboard/KPICard'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { Modal } from '@/components/ui/Modal'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { FolderOpen, Grid3x3, Menu } from 'lucide-react'

export default function CategoriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      const [categoriesData, tasksData] = await Promise.all([
        api.getCategories(userData.id),
        api.getTasks(userData.id)
      ])

      setCategories(categoriesData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleSuccess = () => {
    handleModalClose()
    if (user) {
      api.getCategories(user.id).then(setCategories)
    }
  }

  const handleViewTasks = (category: Category) => {
    router.push(`/tasks?category=${category.id}`)
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!user) return

    const tasksInCategory = tasks.filter(t => t.category_id === category.id).length

    if (tasksInCategory > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${tasksInCategory} task(s). Please reassign or delete those tasks first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return
    }

    try {
      // Note: You'll need to add deleteCategory method to API client
      // await api.deleteCategory(user.id, category.id)
      alert('Delete category functionality needs to be implemented in the API')
      // For now, just refresh the data
      fetchData()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  // Calculate task count per category
  const taskCountByCategory = tasks.reduce((acc, task) => {
    if (task.category_id) {
      acc[task.category_id] = (acc[task.category_id] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  // Calculate stats
  const totalCategories = categories.length
  const avgTasksPerCategory = totalCategories > 0
    ? Math.round(tasks.filter(t => t.category_id).length / totalCategories)
    : 0

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
          <h2 className="text-xl font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Categories
          </h2>
          <div className="w-10"></div>
        </div>

        {/* Content Container */}
        <div className="p-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Categories
            </h1>
            <p className="text-[#191A23] opacity-70 text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Organize your tasks into categories
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <KPICard icon={FolderOpen} value={totalCategories} label="Total Categories" isLoading={loading} />
            <KPICard icon={Grid3x3} value={avgTasksPerCategory} label="Avg Tasks/Category" isLoading={loading} />
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#B9FF66] rounded-xl p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-[#F3F3F3] rounded-xl p-12 text-center border border-[#191A23] border-opacity-10">
              <FolderOpen size={64} className="text-[#191A23] opacity-30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#191A23] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                No categories yet
              </h3>
              <p className="text-[#191A23] opacity-70 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Click the + button to create your first category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    animation: 'fadeInUp 0.3s ease-out',
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'backwards'
                  }}>
                  <CategoryCard
                    category={category}
                    taskCount={taskCountByCategory[category.id] || 0}
                    onViewTasks={handleViewTasks}
                    onDelete={handleDeleteCategory}
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
        label="Create Category"
      />

      {/* Create Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Create New Category">
        <CategoryForm
          userId={user.id}
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
