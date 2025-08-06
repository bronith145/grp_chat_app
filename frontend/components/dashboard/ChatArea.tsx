'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import { useSocket } from '@/components/providers/SocketProvider'
import { formatDistanceToNow } from 'date-fns'
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

export default function ChatArea() {
  const { user } = useAuthStore()
  const { 
    currentChat, 
    messages, 
    sendMessage, 
    fetchMessages, 
    isLoadingMessages,
    typingUsers 
  } = useChatStore()
  const { socket } = useSocket()
  
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChat) {
      const chatId = currentChat.id || currentChat._id
      if (chatId) {
        fetchMessages(chatId)
        setUserScrolled(false) // Reset scroll state for new chat
      }
    }
  }, [currentChat, fetchMessages])

  // Auto-scroll to bottom when messages change (if user hasn't manually scrolled)
  useEffect(() => {
    if (!userScrolled && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
    }
  }, [messages, userScrolled])

  // Handle typing indicator
  useEffect(() => {
    if (socket && currentChat) {
      const chatId = currentChat.id || currentChat._id
      if (isTyping) {
        socket.emit('typing', { chatId })
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          socket.emit('stopTyping', { chatId })
        }, 2000)
      } else {
        socket.emit('stopTyping', { chatId })
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isTyping, socket, currentChat])

  // Handle scroll detection with debouncing
  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!messagesContainerRef.current) return
      
      const container = messagesContainerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - clientHeight - scrollTop < 20
      
      setUserScrolled(!isAtBottom)
    }, 100)
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
      setUserScrolled(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 Attempting to send message...')
    console.log('📝 Message input:', messageInput)
    console.log('💬 Current chat:', currentChat)
    
    if (!messageInput.trim() || !currentChat) {
      console.log('❌ Validation failed - missing input or chat')
      return
    }
    
    const content = messageInput.trim()
    setMessageInput('')
    setIsTyping(false)
    
    // Force scroll to bottom when sending
    setUserScrolled(false)
    
    const chatId = currentChat.id || currentChat._id
    console.log('🚀 Sending message:', content, 'to chat:', chatId)
    
    if (!chatId) {
      console.error('❌ No chat ID available')
      return
    }
    
    await sendMessage(chatId, content)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true)
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false)
    }
  }

  const getChatTitle = () => {
    if (!currentChat) return ''
    
    if (currentChat.isGroup) {
      return currentChat.name
    }
    
    const otherParticipant = currentChat.participants.find(p => p._id !== user?.id)
    return otherParticipant?.username || 'Unknown User'
  }

  if (!currentChat) {
    return null
  }

    return (
    <div className="flex-1 flex flex-col bg-gray-850 h-full relative">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">
              {getChatTitle().charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Chat Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-white font-semibold text-lg">{getChatTitle()}</h2>
              {!currentChat.isGroup && (
                <div className={`w-3 h-3 rounded-full ${
                  currentChat.participants.find(p => p._id !== user?.id)?.isOnline 
                    ? 'bg-green-500' 
                    : 'bg-gray-500'
                }`} />
              )}
            </div>
            {currentChat.isGroup ? (
              <div className="flex items-center space-x-1">
                <p className="text-gray-400 text-sm">
                  {currentChat.participants.length} members
                </p>
                <span className="text-gray-500">•</span>
                <p className="text-gray-400 text-sm">
                  {currentChat.participants.filter(p => p.isOnline).length} online
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                {currentChat.participants.find(p => p._id !== user?.id)?.isOnline ? 'Active now' : 'Last seen recently'}
              </p>
            )}
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-1">
          {/* Search Messages */}
          <button 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Search in conversation"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          
          {/* Voice Call */}
          <button 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Voice call"
          >
            <PhoneIcon className="w-5 h-5" />
          </button>
          
          {/* Video Call */}
          <button 
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Video call"
          >
            <VideoCameraIcon className="w-5 h-5" />
          </button>
          
          {/* Add People (for groups) */}
          {currentChat.isGroup && (
            <button 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
              title="Add people"
            >
              <UserPlusIcon className="w-5 h-5" />
            </button>
          )}
          
          {/* Chat Info */}
          <button 
            onClick={() => setShowChatInfo(!showChatInfo)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            title="Chat information"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </button>
          
          {/* More Actions */}
          <div className="relative">
            <button 
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
              title="More actions"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            
            {/* More Actions Dropdown */}
            {showMoreActions && (
              <div className="absolute right-0 top-12 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
                    View shared media
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
                    Search messages
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
                    Notification settings
                  </button>
                  {currentChat.isGroup && (
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
                      Group settings
                    </button>
                  )}
                  <hr className="my-2 border-gray-700" />
                  <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg">
                    {currentChat.isGroup ? 'Leave group' : 'Block user'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Info Panel (collapsible) */}
      {showChatInfo && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Chat Information</h3>
            <button 
              onClick={() => setShowChatInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{currentChat.isGroup ? 'Group Chat' : 'Direct Message'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Members:</span>
              <span className="text-white">{currentChat.participants.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="text-white">
                {new Date(currentChat.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}      {/* Messages Area - FIXED CONTAINER */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          height: 'calc(100vh - 200px)', // More reasonable calculation
          overflowY: 'auto' // Only shows scrollbar when needed
        }}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <InformationCircleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
              <p className="text-gray-400 text-sm">
                {currentChat.isGroup 
                  ? 'Be the first to send a message in this group!'
                  : `Say hello to ${getChatTitle()}!`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === user?.id
              
              return (
                <div 
                  key={message._id} 
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white'
                  }`}>
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-300 mb-1">{message.sender.username}</p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-700 px-4 py-2 rounded-lg">
                  <p className="text-gray-400 text-sm italic">Someone is typing...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {userScrolled && (
        <div className="absolute bottom-24 right-6 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200"
            title="Scroll to bottom"
          >
            <ChevronDownIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={`Message ${getChatTitle()}...`}
              className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              maxLength={5000}
            />
            
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <FaceSmileIcon className="w-6 h-6" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className={`p-3 rounded-full transition-all ${
              messageInput.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>

        {messageInput.length > 4000 && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${
              messageInput.length > 4500 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {messageInput.length}/5000
            </span>
          </div>
        )}
      </div>
    </div>
  )
}