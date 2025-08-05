'use client'

import { useSocket } from '@/components/providers/SocketProvider'
import { useAuthStore } from '@/lib/stores/authStore'
import { useChatStore } from '@/lib/stores/chatStore'
import { UserIcon } from '@heroicons/react/24/outline'

export default function OnlineUsers() {
  const { onlineUsers } = useSocket()
  const { user } = useAuthStore()
  const { chats } = useChatStore()
  
  // Get friends from chats who are online
  const onlineFriends = chats
    .filter(chat => !chat.isGroup)
    .map(chat => chat.participants.find(p => p._id !== user?.id))
    .filter(friend => friend && onlineUsers.has(friend._id))
    .slice(0, 5) // Show max 5 online friends

  if (onlineFriends.length === 0) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Online Friends ({onlineFriends.length})
      </h3>
      <div className="space-y-2">
        {onlineFriends.map((friend) => (
          <div key={friend?._id} className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{friend?.username}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        ))}
      </div>
      
      {onlineUsers.size > 5 && (
        <p className="text-xs text-gray-400 mt-2">
          +{onlineUsers.size - 5} more online
        </p>
      )}
    </div>
  )
}
