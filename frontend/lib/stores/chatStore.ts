import { create } from 'zustand'
import api, { endpoints } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  _id: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen?: string
}

interface Message {
  _id: string
  sender: User
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  encrypted: boolean
  chat: string
  createdAt: string
  readBy: Array<{
    user: string
    readAt: string
  }>
  replyTo?: Message
}

interface Chat {
  _id?: string  // For backward compatibility
  id?: string   // Current backend format, made optional since some objects only have _id
  name: string
  isGroup: boolean
  participants: User[]
  admin?: User
  lastMessage?: Message
  groupAvatar?: string
  updatedAt: string
  createdAt: string
}

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  isLoadingMessages: boolean
  typingUsers: Set<string>
  
  // Actions
  fetchChats: () => Promise<void>
  createChat: (participantIds: string[], isGroup?: boolean, name?: string) => Promise<Chat | null>
  selectChat: (chat: Chat) => void
  fetchMessages: (chatId: string, page?: number) => Promise<void>
  sendMessage: (chatId: string, content: string, replyTo?: string) => Promise<void>
  markAsRead: (chatId: string) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  setTypingUsers: (users: Set<string>) => void
  addTypingUser: (userId: string) => void
  removeTypingUser: (userId: string) => void
  clearCurrentChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  typingUsers: new Set(),

  fetchChats: async () => {
    set({ isLoading: true })
    try {
      console.log('🔄 Fetching chats...')
      console.log('📡 API base URL:', api.defaults.baseURL)
      console.log('🔑 Auth token check...')
      
      const response = await api.get(endpoints.getChats)
      console.log('📥 Raw response:', response)
      console.log('📥 Response status:', response.status)
      console.log('📥 Response data:', response.data)
      console.log('📥 Chats array:', response.data.chats)
      
      if (response.data.chats && Array.isArray(response.data.chats)) {
        console.log(`📊 Found ${response.data.chats.length} chats`)
        response.data.chats.forEach((chat: any, index: number) => {
          console.log(`💬 Chat ${index}:`, chat)
          console.log(`🆔 Chat ${index} ID:`, chat._id)
          console.log(`👤 Chat ${index} participants:`, chat.participants)
        })
        
        // Map _id to id for consistency
        const processedChats = response.data.chats.map((chat: any) => ({
          ...chat,
          id: chat._id || chat.id  // Ensure we have an id property
        }))
        
        console.log('💾 Setting chats in store...')
        set({ chats: processedChats, isLoading: false })
        
        // Verify what was actually stored
        const currentState = get()
        console.log('💾 Chats after setting in store:', currentState.chats)
        if (currentState.chats && currentState.chats.length > 0) {
          currentState.chats.forEach((chat: any, index: number) => {
            console.log(`💾 Stored Chat ${index}:`, chat)
            console.log(`💾 Stored Chat ${index} ID:`, chat._id)
          })
        }
      } else {
        console.log('❌ No chats array found in response')
        set({ chats: [], isLoading: false })
      }
      
    } catch (error: any) {
      console.error('❌ Fetch chats error:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      toast.error('Failed to load chats')
      set({ isLoading: false })
    }
  },

  createChat: async (participantIds: string[], isGroup = false, name = '') => {
    try {
      const response = await api.post(endpoints.createChat, {
        participantIds,
        isGroup,
        name
      })
      
      const newChat = response.data.chat
      const currentChats = get().chats
      
      // Ensure the chat has consistent id format
      const normalizedChat = {
        ...newChat,
        id: newChat.id || newChat._id
      }
      
      // Check if chat already exists (for one-on-one chats)
      if (response.data.isExisting) {
        const existingChatIndex = currentChats.findIndex(c => 
          (c.id || c._id) === (normalizedChat.id || normalizedChat._id)
        )
        if (existingChatIndex === -1) {
          set({ chats: [normalizedChat, ...currentChats] })
        }
      } else {
        set({ chats: [normalizedChat, ...currentChats] })
        toast.success(isGroup ? 'Group created successfully!' : 'Chat created!')
      }
      
      return normalizedChat
    } catch (error: any) {
      console.error('Create chat error:', error)
      toast.error('Failed to create chat')
      return null
    }
  },

  selectChat: (chat: Chat) => {
    console.log('🔍 Selecting chat:', chat)
    console.log('🆔 Chat ID:', chat?.id)
    console.log('🆔 Chat _ID:', chat?._id)
    console.log('🔍 Chat type:', typeof chat)
    console.log('🔍 ID type:', typeof chat?.id)
    
    if (!chat) {
      console.error('❌ No chat provided')
      toast.error('No chat selected')
      return
    }
    
    // Use either id or _id for chat identification
    const chatId = chat.id || chat._id
    if (!chatId) {
      console.error('❌ Chat missing both ID and _ID:', chat)
      toast.error('Invalid chat - missing ID')
      return
    }
    
    // Ensure the chat object has an id property for consistency
    const normalizedChat = {
      ...chat,
      id: chatId
    }
    
    console.log('✅ Setting current chat with ID:', chatId)
    set({ currentChat: normalizedChat, messages: [] })
    get().fetchMessages(chatId)
  },

  fetchMessages: async (chatId: string, page = 1) => {
    console.log('📬 Fetching messages for chatId:', chatId)
    console.log('📬 ChatId type:', typeof chatId)
    console.log('📬 ChatId value check:', chatId === undefined ? 'UNDEFINED!' : chatId)
    
    if (!chatId || chatId === 'undefined') {
      console.error('❌ Invalid chatId for fetch messages:', chatId)
      toast.error('Cannot fetch messages - invalid chat ID')
      return
    }
    
    set({ isLoadingMessages: true })
    try {
      const endpoint = `${endpoints.getChatMessages(chatId)}?page=${page}&limit=50`
      console.log('📬 Fetching from endpoint:', endpoint)
      
      const response = await api.get(endpoint)
      const newMessages = response.data.messages
      
      if (page === 1) {
        set({ messages: newMessages, isLoadingMessages: false })
      } else {
        // Prepend older messages for pagination
        const currentMessages = get().messages
        set({ messages: [...newMessages, ...currentMessages], isLoadingMessages: false })
      }
      
      // Mark messages as read
      get().markAsRead(chatId)
    } catch (error: any) {
      console.error('❌ Fetch messages error:', error)
      console.error('❌ Error for chatId:', chatId)
      console.error('❌ Error response:', error.response?.data)
      toast.error('Failed to load messages')
      set({ isLoadingMessages: false })
    }
  },

  sendMessage: async (chatId: string, content: string, replyTo?: string) => {
    console.log('🏪 Store sendMessage called with:', { chatId, content, replyTo })
    console.log('📤 Sending to endpoint:', endpoints.sendMessage(chatId))
    
    try {
      const response = await api.post(endpoints.sendMessage(chatId), {
        content,
        replyTo
      })
      
      console.log('✅ Message sent successfully:', response.data)
      
      const newMessage = response.data.data
      
      // Add message to current messages
      const currentMessages = get().messages
      set({ messages: [...currentMessages, newMessage] })
      
      // Update chat's last message in chat list
      const currentChats = get().chats
      const updatedChats = currentChats.map(chat => {
        const currentChatId = chat.id || chat._id
        return currentChatId === chatId 
          ? { ...chat, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : chat
      })
      set({ chats: updatedChats })
      
    } catch (error: any) {
      console.error('❌ Send message error:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error headers:', error.response?.headers)
      toast.error('Failed to send message')
    }
  },

  markAsRead: async (chatId: string) => {
    try {
      await api.put(endpoints.markAsRead(chatId))
    } catch (error: any) {
      console.error('Mark as read error:', error)
    }
  },

  addMessage: (message: Message) => {
    const currentMessages = get().messages
    const currentChat = get().currentChat
    
    // Only add if message belongs to current chat
    if (currentChat) {
      const currentChatId = currentChat.id || currentChat._id
      if (message.chat === currentChatId) {
        set({ messages: [...currentMessages, message] })
      }
    }
    
    // Update chat's last message in chat list
    const currentChats = get().chats
    const updatedChats = currentChats.map(chat => {
      const chatId = chat.id || chat._id
      return chatId === message.chat
        ? { ...chat, lastMessage: message, updatedAt: new Date().toISOString() }
        : chat
    })
    set({ chats: updatedChats })
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    const currentMessages = get().messages
    const updatedMessages = currentMessages.map(msg =>
      msg._id === messageId ? { ...msg, ...updates } : msg
    )
    set({ messages: updatedMessages })
  },

  setTypingUsers: (users: Set<string>) => {
    set({ typingUsers: users })
  },

  addTypingUser: (userId: string) => {
    const currentTyping = get().typingUsers
    const newTyping = new Set(currentTyping)
    newTyping.add(userId)
    set({ typingUsers: newTyping })
  },

  removeTypingUser: (userId: string) => {
    const currentTyping = get().typingUsers
    const newTyping = new Set(currentTyping)
    newTyping.delete(userId)
    set({ typingUsers: newTyping })
  },

  clearCurrentChat: () => {
    set({ currentChat: null, messages: [], typingUsers: new Set() })
  }
}))