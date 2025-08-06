'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ChatArea from '@/components/dashboard/ChatArea'
import SimpleSidebar from '@/components/dashboard/SimpleSidebar'
import CreateChatModal from '@/components/modals/CreateChatModal'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { fetchChats } = useChatStore()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
      {/* Left Sidebar with Chat List */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-gray-700 flex flex-col transition-all duration-300`}>
        <SimpleSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onShowProfile={() => {}} 
          onShowCreateChat={() => setShowCreateChatModal(true)}
        />
      </div>
      
      {/* Main Chat Area - No debug panel on the right */}
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>
      
      {/* Create Chat Modal */}
      {showCreateChatModal && (
        <CreateChatModal onClose={() => setShowCreateChatModal(false)} />
      )}
    </div>
  )
}
