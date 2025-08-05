// lib/api.js
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-storage')
      if (token) {
        try {
          const parsed = JSON.parse(token)
          if (parsed.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`
          }
        } catch (error) {
          console.error('Error parsing stored auth token:', error)
        }
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }
    
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data)
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  getCurrentUser: '/auth/me',
  
  // User endpoints
  updateProfile: '/users/profile',
  searchUsers: '/users/search',
  
  // Chat endpoints
  getChats: '/chat',
  createChat: '/chat',
  getChatMessages: (chatId) => `/chat/${chatId}/messages`,
  sendMessage: (chatId) => `/chat/${chatId}/messages`,
  markAsRead: (chatId) => `/chat/${chatId}/read`,
  
  // Other endpoints
  uploadFile: '/upload',
}

export default api
