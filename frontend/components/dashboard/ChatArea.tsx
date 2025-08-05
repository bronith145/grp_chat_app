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
  InformationCircleIcon
} from '@heroicons/react/24/outline'
// import MessageBubble from '@/components/chat/MessageBubble'
// import TypingIndicator from '@/components/chat/TypingIndicator'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChat) {
      const chatId = currentChat.id || currentChat._id
      fetchMessages(chatId)
    }
  }, [currentChat, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle typing indicator
  useEffect(() => {
    if (socket && currentChat) {
      const chatId = currentChat.id || currentChat._id
      if (isTyping) {
        socket.emit('typing', { chatId })
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        // Stop typing after 2 seconds of inactivity
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
    }
  }, [isTyping, socket, currentChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 Attempting to send message...')
    console.log('📝 Message input:', messageInput)
    console.log('💬 Current chat:', currentChat)
    console.log('🆔 Chat ID (_id):', currentChat?._id)
    console.log('🆔 Chat ID (id):', currentChat?.id)
    
    if (!messageInput.trim() || !currentChat) {
      console.log('❌ Validation failed - missing input or chat')
      return
    }
    
    const content = messageInput.trim()
    setMessageInput('')
    setIsTyping(false)
    
    // Use the id property that should be mapped from _id
    const chatId = currentChat.id || currentChat._id
    console.log('🚀 Sending message:', content, 'to chat:', chatId)
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

  const getChatSubtitle = () => {
    if (!currentChat) return ''
    
    if (currentChat.isGroup) {
      return `${currentChat.participants.length} members`
    }
    
    const otherParticipant = currentChat.participants.find(p => p._id !== user?.id)
    if (otherParticipant?.isOnline) {
      return 'Online'
    }
    
    if (otherParticipant?.lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeen), { addSuffix: true })}`
    }
    
    return 'Offline'
  }

  if (!currentChat) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-850">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
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
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === user?.id
              const showAvatar = !isOwnMessage && (
                index === messages.length - 1 ||
                messages[index + 1]?.sender._id !== message.sender._id
              )
              
              return (
                <div key={message._id} className="p-2 bg-gray-700 rounded mb-2">
                  <p className="text-white">{message.content}</p>
                  <small className="text-gray-400">{message.sender.username}</small>
                </div>
              )
            })}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="p-2 text-gray-400 italic">
                Someone is typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={`Message ${getChatTitle()}...`}
              className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              maxLength={5000}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <FaceSmileIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Send Button */}
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

        {/* Character Count */}
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