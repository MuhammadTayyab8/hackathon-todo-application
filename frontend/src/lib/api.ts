import { authClient } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = await this.getSession()
    const token = session?.token

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/signin'
        }
      }
      const error = await response.json()
      throw new Error(error.error || error.detail || 'API error')
    }

    return response.json()
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  private async getSession() {
    const { data: session } = await authClient.getSession()
    return session
  }
}

export const api = new ApiClient()
