'use client'

import { useState, useEffect } from 'react'
import { api, type User } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')

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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'categories', label: 'Categories', icon: '🏷️' }
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#F3F3F3] border-r border-[#191A23] transition-all duration-300"
         style={{ width: isCollapsed ? '80px' : '250px' }}>

      {/* User Profile Section */}
      <div className="p-6 border-b border-[#191A23]/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#B9FF66] border-2 border-[#191A23] flex items-center justify-center flex-shrink-0"
               style={{
                 animation: 'fadeIn 0.5s ease-out',
                 fontFamily: 'Space Grotesk, sans-serif',
                 fontSize: '20px',
                 fontWeight: 700,
                 color: '#191A23'
               }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden" style={{ animation: 'slideIn 0.3s ease-out' }}>
              <h3 className="text-[#191A23] font-semibold truncate"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px' }}>
                {user?.name || 'Loading...'}
              </h3>
              <p className="text-[#191A23]/70 text-sm truncate"
                 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeNav === item.id
                ? 'bg-[#B9FF66] text-[#191A23] shadow-sm'
                : 'text-[#191A23] hover:bg-[#B9FF66]/30'
            }`}
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeIn 0.5s ease-out backwards'
            }}>
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#191A23] text-[#191A23] hover:bg-[#191A23] hover:text-white transition-all duration-200"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px' }}>
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={onToggle}
        className="hidden md:block absolute -right-3 top-20 w-6 h-6 bg-[#B9FF66] border border-[#191A23] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        style={{ fontSize: '12px' }}>
        {isCollapsed ? '→' : '←'}
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
            className="md:hidden fixed inset-0 bg-[#191A23]/50 z-40"
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');

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
