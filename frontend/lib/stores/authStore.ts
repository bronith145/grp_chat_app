import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StateCreator } from 'zustand'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  isOnline: boolean
  friends?: User[]
  friendRequests?: FriendRequest[]
}

interface FriendRequest {
  _id: string
  from: {
    _id: string
    username: string
    avatar?: string
  }
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  getCurrentUser: () => Promise<void>
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success(`Welcome back, ${user.username}!`)
          return true
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error || 'Login failed'
          toast.error(message)
          return false
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', { 
            username, 
            email, 
            password 
          })
          const { token, user } = response.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success(`Welcome to Chat App, ${user.username}!`)
          return true
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error || 'Registration failed'
          toast.error(message)
          return false
        }
      },

      logout: () => {
        // Call logout endpoint
        api.post('/auth/logout').catch(() => {})
        
        // Clear state
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
        
        toast.success('Logged out successfully')
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },

      getCurrentUser: async () => {
        const token = get().token
        if (!token) return
        
        try {
          const response = await api.get('/auth/me')
          set({ 
            user: response.data.user, 
            isAuthenticated: true 
          })
        } catch (error) {
          // Token is invalid, clear auth state
          get().logout()
        }
      },

      setToken: (token: string) => {
        set({ token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // Restore API authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      }
    }
  )
)