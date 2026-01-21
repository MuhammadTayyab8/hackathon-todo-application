"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important: Send cookies
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const userData = await response.json()
          console.log(userData, "userData FRom USWAUTH")
          setUser({
            id: userData.id,
            name: userData.username || userData.email,
            email: userData.email
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to check authentication:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isLoading
  }
}
