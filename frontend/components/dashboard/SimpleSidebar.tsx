'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onShowProfile: () => void
  onShowCreateChat: () => void
}

export default function SimpleSidebar({ 
  collapsed, 
  onToggleCollapse, 
  onShowProfile, 
  onShowCreateChat 
}: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { chats, currentChat, selectChat } = useChatStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter chats based on search term
  const filteredChats = (chats || []).filter(chat => {
    if (!searchTerm) return true
    const chatName = chat.isGroup 
      ? chat.name 
      : (chat.participants || []).find(p => p._id !== user?.id)?.username || 'Unknown User'
    return chatName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelectChat = (chat: any) => {
    console.log('🏪 SimpleSidebar handleSelectChat called with:', chat)
    console.log('🏪 Chat object keys:', Object.keys(chat))
    console.log('🏪 Chat.id:', chat.id)
    console.log('🏪 Chat type:', typeof chat)
    selectChat(chat)
  }

  // Debug logging
  useEffect(() => {
    console.log('🏪 SimpleSidebar - chats from store:', chats)
    console.log('🏪 SimpleSidebar - filteredChats:', filteredChats)
    if (chats && chats.length > 0) {
      chats.forEach((chat, index) => {
        console.log(`🏪 Chat ${index}:`, chat)
        console.log(`🏪 Chat ${index} id:`, chat.id)
        console.log(`🏪 Chat ${index} participants:`, chat.participants)
      })
    }
  }, [chats, filteredChats])

  if (collapsed) {
    return (
      <div className="h-full bg-gray-800 border-r border-gray-700 p-2 flex flex-col">
        <button
          onClick={onToggleCollapse}
          className="w-full p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mb-4"
          title="Expand Sidebar"
        >
          <ChevronRightIcon className="w-5 h-5 mx-auto" />
        </button>
        
        <button
          onClick={onShowCreateChat}
          className="w-full p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mb-4"
          title="New Chat"
        >
          <PlusIcon className="w-5 h-5 mx-auto" />
        </button>

        <div className="flex-1 space-y-2">
          {filteredChats.slice(0, 5).map((chat) => (
            <button
              key={chat.id || chat._id}
              onClick={() => {
                console.log('🖱️ Sidebar: Chat clicked:', chat)
                console.log('🆔 Sidebar: Chat ID:', chat.id || chat._id)
                selectChat(chat)
              }}
              className={`w-full p-2 rounded-lg transition-colors ${
                currentChat?.id === chat.id || currentChat?._id === chat._id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={chat.isGroup ? chat.name : (chat.participants || []).find(p => p._id !== user?.id)?.username}
            >
              {chat.isGroup ? (
                <UserGroupIcon className="w-5 h-5 mx-auto" />
              ) : (
                <UserIcon className="w-5 h-5 mx-auto" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onShowProfile}
          className="w-full p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mt-4"
          title="Profile"
        >
          <UserIcon className="w-5 h-5 mx-auto" />
        </button>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Chats</h2>
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* New Chat Button */}
        <button
          onClick={onShowCreateChat}
          className="w-full mt-3 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchTerm ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat, index) => {
              const isSelected = currentChat?.id === chat.id || currentChat?._id === chat._id
              const chatName = chat.isGroup 
                ? chat.name 
                : (chat.participants || []).find(p => p._id !== user?.id)?.username || 'Unknown User'
              
              return (
                <button
                  key={chat.id || chat._id || `chat-${index}`}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {chat.isGroup ? (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          isSelected ? 'text-white' : 'text-gray-200'
                        }`}>
                          {chatName}
                        </p>
                      </div>
                      <p className={`text-xs truncate ${
                        isSelected ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={onShowProfile}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
