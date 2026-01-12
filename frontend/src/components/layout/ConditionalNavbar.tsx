'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()

  // Hide Navbar on dashboard routes
  const isDashboardRoute = pathname?.startsWith('/dashboard') ||
                          pathname?.startsWith('/tasks') ||
                          pathname?.startsWith('/categories') ||
                          pathname?.startsWith('/calendar')

  if (isDashboardRoute) {
    return null
  }

  return <Navbar />
}
