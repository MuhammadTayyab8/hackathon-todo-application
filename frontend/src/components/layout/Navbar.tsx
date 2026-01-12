"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { NAV_LINKS } from "@/lib/constants"
import { Menu, X, Moon, Sun, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include', // Important: Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        router.push('/')
        router.refresh()
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Navigation links for authenticated users
  const authenticatedLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Categories', href: '/categories' },
    { name: 'Calendar', href: '/calendar' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-tertiary/95 backdrop-blur supports-[backdrop-filter]:bg-tertiary/80">
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-secondary font-bold">T</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-secondary font-heading">Todo App</span>
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-secondary hover:bg-secondary/5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            {isAuthenticated ? (
              authenticatedLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold leading-6 text-secondary hover:text-primary transition-colors font-body"
                >
                  {link.name}
                </Link>
              ))
            ) : (
              NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold leading-6 text-secondary hover:text-primary transition-colors font-body"
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <span className="text-sm font-medium text-secondary">
                      {user?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </nav>
      </Container>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 z-50 bg-tertiary border-b border-secondary/10 shadow-lg">
          <div className="px-6 py-6">
            <div className="flow-root">
              <div className="-my-6 divide-y divide-secondary/10">
                <div className="space-y-2 py-6">
                  {isAuthenticated ? (
                    authenticatedLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary hover:bg-secondary/5 font-heading"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))
                  ) : (
                    NAV_LINKS.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary hover:bg-secondary/5 font-heading"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))
                  )}
                </div>
                <div className="py-6 space-y-2">
                  {!isLoading && (
                    <>
                      {isAuthenticated ? (
                        <>
                          <div className="mb-4 px-3">
                            <span className="text-sm font-medium text-secondary">
                              {user?.name}
                            </span>
                          </div>
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => {
                              handleLogout()
                              setMobileMenuOpen(false)
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="secondary" className="w-full justify-start">
                              Log in
                            </Button>
                          </Link>
                          <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full justify-start">
                              Sign up
                            </Button>
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
