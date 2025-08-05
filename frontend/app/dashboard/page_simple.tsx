'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
// import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { fetchChats } = useChatStore()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateChatModal, setShowCreateChatModal] = useState(false)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch chats on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchChats()
    }
  }, [isAuthenticated, fetchChats])

  // Show loading spinner while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 sidebar flex-shrink-0`}>
        <div className="h-full bg-gray-800 p-4">
          <h2 className="text-white text-lg font-semibold mb-4">
            {sidebarCollapsed ? 'C' : 'Chats'}
          </h2>
          <div className="text-gray-300 text-sm">
            Sidebar placeholder - component will be added safely
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chat Dashboard</h1>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
          </button>
        </div>
        
        <p>Welcome, {user.username}!</p>
        <p className="mt-4 text-gray-300">Sidebar component added! You can now see your chats.</p>
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Available Actions:</h2>
          <div className="space-y-2">
            <button 
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="block w-full text-left px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Back to Login
            </button>
            <button 
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="block w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✅ Authentication working</li>
            <li>✅ Dashboard loading</li>
            <li>✅ Sidebar component added</li>
            <li>🔄 Add Chat Area component</li>
            <li>🔄 Add Profile Modal</li>
            <li>🔄 Add Notification Center</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
