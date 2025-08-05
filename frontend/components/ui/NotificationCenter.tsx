'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/components/providers/SocketProvider'
import { useAuthStore } from '@/lib/stores/authStore'
import { 
  BellIcon, 
  XMarkIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'message' | 'friend_request' | 'group_invite' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const { socket } = useSocket()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!socket || !user) return

    // Listen for real-time notifications
    const handleNewMessage = (data: any) => {
      if (data.sender._id !== user.id) {
        addNotification({
          type: 'message',
          title: `New message from ${data.sender.username}`,
          message: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
          data: { chatId: data.chat, senderId: data.sender._id }
        })
      }
    }

    const handleFriendRequest = (data: any) => {
      addNotification({
        type: 'friend_request',
        title: 'Friend Request',
        message: `${data.from.username} sent you a friend request`,
        data: { requestId: data._id, fromUser: data.from }
      })
    }

    const handleGroupInvite = (data: any) => {
      addNotification({
        type: 'group_invite',
        title: 'Group Invitation',
        message: `You've been invited to join ${data.groupName}`,
        data: { groupId: data.groupId, invitedBy: data.invitedBy }
      })
    }

    const handleSystemNotification = (data: any) => {
      addNotification({
        type: 'system',
        title: 'System Notification',
        message: data.message,
        data: data.data
      })
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('friendRequest', handleFriendRequest)
    socket.on('groupInvite', handleGroupInvite)
    socket.on('systemNotification', handleSystemNotification)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('friendRequest', handleFriendRequest)
      socket.off('groupInvite', handleGroupInvite)
      socket.off('systemNotification', handleSystemNotification)
    }
  }, [socket, user])

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Auto-remove after 30 seconds for message notifications
    if (notification.type === 'message') {
      setTimeout(() => {
        removeNotification(notification.id)
      }, 30000)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return prev.filter(n => n.id !== id)
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />
      case 'friend_request':
        return <UserPlusIcon className="w-5 h-5 text-green-400" />
      case 'group_invite':
        return <UserGroupIcon className="w-5 h-5 text-purple-400" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        title="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                    !notification.read ? 'bg-gray-750/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-white ml-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
