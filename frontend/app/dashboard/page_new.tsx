'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SimpleSidebar from '@/components/dashboard/SimpleSidebar'

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
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex-shrink-0`}>
        <SimpleSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onShowProfile={() => setShowProfileModal(true)}
          onShowCreateChat={() => setShowCreateChatModal(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Chat Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {user.username}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Your Chat Dashboard</h2>
            <p>Select a chat from the sidebar to start messaging</p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Username</label>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Chat Modal */}
      {showCreateChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Chat</h3>
            <p className="text-gray-400 mb-4">Chat creation feature coming soon...</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateChatModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
