'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: Set<string>
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set()
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  
  const { user, token, isAuthenticated } = useAuthStore()
  const { 
    addMessage, 
    addTypingUser, 
    removeTypingUser, 
    currentChat,
    fetchChats 
  } = useChatStore()

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      // Disconnect socket if not authenticated
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket']
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)
      toast.success('Connected to chat server')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, try to reconnect
        newSocket.connect()
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      toast.error('Failed to connect to chat server')
      setIsConnected(false)
    })

    // Chat events
    newSocket.on('newMessage', (message) => {
      console.log('📨 New message received:', message)
      addMessage(message)
      
      // Show notification if not in current chat
      if (!currentChat || currentChat._id !== message.chatId) {
        toast.success(`New message from ${message.sender.username}`)
      }
    })

    newSocket.on('newChat', (data) => {
      console.log('💬 New chat created:', data)
      toast.success(`${data.createdBy} added you to a chat`)
      fetchChats() // Refresh chat list
    })

    // Typing events
    newSocket.on('userTyping', (data) => {
      if (currentChat && data.chatId === currentChat._id) {
        addTypingUser(data.userId)
      }
    })

    newSocket.on('userStoppedTyping', (data) => {
      if (currentChat && data.chatId === currentChat._id) {
        removeTypingUser(data.userId)
      }
    })

    // User status events
    newSocket.on('userStatusChanged', (data) => {
      console.log('👤 User status changed:', data)
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        if (data.isOnline) {
          newSet.add(data.userId)
        } else {
          newSet.delete(data.userId)
        }
        return newSet
      })
    })

    // Group events
    newSocket.on('groupMembersAdded', (data) => {
      toast.success(`${data.addedBy} added new members to the group`)
      fetchChats()
    })

    newSocket.on('groupMemberRemoved', (data) => {
      toast.success(`${data.removedBy} removed ${data.removedUser.username} from the group`)
      fetchChats()
    })

    newSocket.on('removedFromGroup', (data) => {
      toast.error(`You were removed from ${data.chatName} by ${data.removedBy}`)
      fetchChats()
    })

    newSocket.on('userLeftGroup', (data) => {
      toast.success(`${data.leftUser.username} left the group`)
      fetchChats()
    })

    newSocket.on('groupInfoUpdated', (data) => {
      toast.success(`${data.updatedBy} updated the group info`)
      fetchChats()
    })

    // Message read receipts
    newSocket.on('messagesRead', (data) => {
      console.log('📖 Messages read:', data)
    })

    // File sharing events
    newSocket.on('fileShared', (data) => {
      toast.success(`${data.username} shared a file: ${data.fileName}`)
    })

    // Error handling
    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Chat server error occurred')
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection')
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, token, user?.id])

  // Join current chat room when chat changes
  useEffect(() => {
    if (socket && currentChat) {
      socket.emit('joinChat', currentChat._id)
      console.log(`🏠 Joined chat room: ${currentChat._id}`)
    }
  }, [socket, currentChat])

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    onlineUsers
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}