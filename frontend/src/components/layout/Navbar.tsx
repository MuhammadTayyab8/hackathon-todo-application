"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { NAV_LINKS } from "@/lib/constants"
import { Menu, X, Moon, Sun } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

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
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold leading-6 text-secondary hover:text-primary transition-colors font-body"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
            {mounted && (
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-secondary hover:bg-secondary/5 relative"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button size="sm">
              Sign up
            </Button>
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
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary hover:bg-secondary/5 font-heading"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-2">
                  {mounted && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-secondary">Theme</span>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2.5 text-secondary hover:bg-secondary/5 relative"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5" />
                        ) : (
                          <Moon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  )}
                  <Button variant="secondary" className="w-full justify-start">
                    Log in
                  </Button>
                  <Button className="w-full justify-start">
                    Sign up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
