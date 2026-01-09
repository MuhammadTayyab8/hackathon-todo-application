// import { authClient } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  due_date?: string
  category_id?: number
  category_name?: string
  content?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  category_id: number
  description?: string
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  category_id?: number
  description?: string
  due_date?: string
  content?: string
  completed?: boolean
}

export interface Category {
  id: number
  name: string
  user_id: string
  created_at: string
}

export interface CategoryCreate {
  name: string
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()

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
          // window.location.href = '/signin'
          // Optional: Clear token on 401
          localStorage.removeItem('token')
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

  async put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async patch<T>(endpoint: string, data: any = {}) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint: string) {
    return this.request<void>(endpoint, { method: 'DELETE' })
  }

  // Task API Methods
  async getTasks(userId: string) {
    return this.get<Task[]>(`/api/${userId}/tasks`)
  }

  async createTask(userId: string, data: TaskCreate) {
    return this.post<Task>(`/api/${userId}/tasks`, data)
  }

  async getTask(userId: string, taskId: string) {
    return this.get<Task>(`/api/${userId}/tasks/${taskId}`)
  }

  async updateTask(userId: string, taskId: string, data: TaskUpdate) {
    return this.put<Task>(`/api/${userId}/tasks/${taskId}`, data)
  }

  async deleteTask(userId: string, taskId: string) {
    return this.delete(`/api/${userId}/tasks/${taskId}`)
  }

  async toggleTaskComplete(userId: string, taskId: string) {
    return this.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`)
  }

  // Category API Methods
  async getCategories(userId: string) {
    return this.get<Category[]>(`/api/${userId}/categories`)
  }

  async createCategory(userId: string, data: CategoryCreate) {
    return this.post<Category>(`/api/${userId}/categories`, data)
  }

  // Auth API Methods
  async getCurrentUser() {
    return this.get<User>('/api/auth/me')
  }

  private getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }
}

export const api = new ApiClient()
