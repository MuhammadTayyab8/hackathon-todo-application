'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, type User } from '@/lib/api'
import { LayoutDashboard, CheckSquare, FolderOpen, Calendar, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/signin')
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'categories', label: 'Categories', icon: FolderOpen, path: '/categories' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' }
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#F3F3F3] border-r border-[#191A23] border-opacity-10 transition-all duration-300"
         style={{ width: isCollapsed ? '80px' : '250px' }}>

      {/* Logo/App Name */}
      <div className="p-6 border-b border-[#191A23] border-opacity-10">
        {!isCollapsed ? (
          <h3 className="text-sm font-bold text-[#191A23]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Todo App
          </h3>
        ) : (
          <div className="w-8 h-8 bg-[#B9FF66] rounded-lg flex items-center justify-center">
            <span className="text-[#191A23] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>T</span>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-[#191A23] border-opacity-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#B9FF66] border-2 border-[#191A23] flex items-center justify-center flex-shrink-0"
               style={{
                 fontFamily: 'Space Grotesk, sans-serif',
                 fontSize: '16px',
                 fontWeight: 700,
                 color: '#191A23'
               }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden" style={{ animation: 'slideIn 0.3s ease-out' }}>
              <h4 className="text-[#191A23] font-semibold truncate text-sm"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {user?.username || 'Loading...'}
              </h4>
              <p className="text-[#191A23] opacity-70 text-xs truncate"
                 style={{ fontFamily: 'Roboto, sans-serif' }}>
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => isMobileOpen && onMobileClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#B9FF66] text-[#191A23] shadow-sm'
                  : 'text-[#191A23] hover:bg-[#B9FF66] hover:bg-opacity-30'
              }`}
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeIn 0.5s ease-out backwards'
              }}>
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#191A23] text-[#191A23] hover:bg-[#191A23] hover:text-white transition-all duration-200"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px' }}>
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={onToggle}
        className="hidden md:block absolute -right-3 top-20 w-6 h-6 bg-[#B9FF66] border border-[#191A23] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        style={{ fontSize: '12px' }}>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block relative">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-[#191A23] bg-opacity-50 z-40"
            onClick={onMobileClose}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-[250px]"
            style={{ animation: 'slideInLeft 0.3s ease-out' }}>
            {sidebarContent}
          </aside>
        </>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
