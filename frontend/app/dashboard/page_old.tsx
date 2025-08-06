'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ChatArea from '@/components/dashboard/ChatArea'
import SimpleSidebar from '@/components/dashboard/SimpleSidebar'
import ChatDebugger from '@/components/debug/ChatDebugger'
import CreateChatModal from '@/components/modals/CreateChatModal'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const { fetchChats, chats } = useChatStore()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCreateChatModal, setShowCreateChatModal] = useState(false)
  
  // Debug function to check current state
  const debugCurrentState = () => {
    console.log('🐛 DEBUG - Current chats in state:', chats)
    console.log('🐛 DEBUG - Chats length:', chats?.length)
    console.log('🐛 DEBUG - First chat:', chats?.[0])
    console.log('🐛 DEBUG - Is authenticated:', isAuthenticated)
    console.log('🐛 DEBUG - User:', user)
  }

  // Debug function to test auth token
  const testAuthToken = async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage) {
        console.error('🔑 No auth storage found')
        return
      }
      const token = JSON.parse(authStorage).state.token
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('🔑 Auth test response:', response.status, await response.text())
    } catch (error) {
      console.error('🔑 Auth test error:', error)
    }
  }
  
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
      {/* Left Sidebar with Chat List */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-gray-700 flex flex-col transition-all duration-300`}>
        <SimpleSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onShowProfile={() => setShowProfileModal(true)}
          onShowCreateChat={() => setShowCreateChatModal(true)}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>
      
      {/* Right Debug Panel (can be toggled) */}
      <div className="w-96 border-l border-gray-700 bg-gray-800">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Debug Panel</h3>
          <button 
            onClick={debugCurrentState}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 mr-2"
          >
            Debug Current State
          </button>
          <button 
            onClick={testAuthToken}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 mr-2"
          >
            Test Auth Token
          </button>
          <button 
            onClick={() => setShowCreateChatModal(true)}
            className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            New Chat
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          <ChatDebugger />
        </div>
      </div>
      
      {/* Create Chat Modal */}
      {showCreateChatModal && (
        <CreateChatModal onClose={() => setShowCreateChatModal(false)} />
      )}
    </div>
  )
}
