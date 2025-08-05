'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/lib/stores/chatStore'
import { useAuthStore } from '@/lib/stores/authStore'

export default function ChatDebugger() {
  const { user } = useAuthStore()
  const { chats, fetchChats, currentChat, selectChat } = useChatStore()

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, fetchChats])

  const handleSelectChat = (chat: any) => {
    console.log('🎯 Manually selecting chat:', chat)
    selectChat(chat)
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Chat Debugger</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">User Info:</h3>
        <p>Username: {user?.username}</p>
        <p>User ID: {user?.id}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Chats ({chats?.length || 0}):</h3>
        {chats?.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat, index) => (
              <div key={index} className="p-2 bg-gray-800 rounded">
                <p><strong>Index:</strong> {index}</p>
                <p><strong>ID:</strong> {chat._id || 'MISSING!'}</p>
                <p><strong>Name:</strong> {chat.name || 'No name'}</p>
                <p><strong>IsGroup:</strong> {chat.isGroup ? 'Yes' : 'No'}</p>
                <p><strong>Participants:</strong> {chat.participants?.length || 0}</p>
                <button 
                  onClick={() => handleSelectChat(chat)}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Select This Chat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No chats loaded</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Current Chat:</h3>
        {currentChat ? (
          <div className="p-2 bg-green-800 rounded">
            <p><strong>ID:</strong> {currentChat._id || 'MISSING!'}</p>
            <p><strong>Name:</strong> {currentChat.name || 'No name'}</p>
            <p><strong>IsGroup:</strong> {currentChat.isGroup ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p>No chat selected</p>
        )}
      </div>
    </div>
  )
}
