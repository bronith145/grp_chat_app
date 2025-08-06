'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useChatStore } from '@/lib/stores/chatStore'
import { useAuthStore } from '@/lib/stores/authStore'
import api, { endpoints } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface User {
  _id: string
  username: string
  email: string
  avatar?: string
  isOnline: boolean
}

interface CreateChatForm {
  name: string
  isGroup: boolean
}

interface CreateChatModalProps {
  onClose: () => void
}

export default function CreateChatModal({ onClose }: CreateChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [step, setStep] = useState<'search' | 'details'>('search')
  
  const { createChat } = useChatStore()
  const { user } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateChatForm>({
    defaultValues: {
      isGroup: false
    }
  })

  const isGroup = watch('isGroup')

  // Handler for changing chat type
  const handleChatTypeChange = (newIsGroup: boolean) => {
    setValue('isGroup', newIsGroup)
    if (!newIsGroup && selectedUsers.length > 1) {
      // If switching to direct chat, keep only first user
      setSelectedUsers(selectedUsers.slice(0, 1))
    }
  }

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await api.get(`${endpoints.searchUsers}?query=${encodeURIComponent(searchQuery)}`)
        setSearchResults(response.data.users || [])
      } catch (error) {
        console.error('Search users error:', error)
        toast.error('Failed to search users')
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleUserSelect = (selectedUser: User) => {
    if (selectedUsers.find(u => u._id === selectedUser._id)) {
      // Remove user
      setSelectedUsers(selectedUsers.filter(u => u._id !== selectedUser._id))
    } else {
      // Add user
      if (!isGroup && selectedUsers.length >= 1) {
        // For direct chats, only allow one user
        setSelectedUsers([selectedUser])
      } else {
        setSelectedUsers([...selectedUsers, selectedUser])
      }
    }
  }

  const handleNext = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    if (!isGroup) {
      // Create direct chat immediately
      handleCreateChat({ name: '', isGroup: false })
    } else {
      setStep('details')
    }
  }

  const handleCreateChat = async (data: CreateChatForm) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    if (data.isGroup && !data.name.trim()) {
      toast.error('Please enter a group name')
      return
    }

    const participantIds = selectedUsers.map(u => u._id)
    const chat = await createChat(participantIds, data.isGroup, data.name)
    
    if (chat) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {step === 'search' ? 'New Chat' : 'Group Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {step === 'search' ? (
          <>
            {/* Chat Type Selection */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleChatTypeChange(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    !isGroup
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <UserIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Direct Chat</div>
                  <div className="text-xs opacity-75">One-on-one conversation</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleChatTypeChange(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    isGroup
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <UserGroupIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Group Chat</div>
                  <div className="text-xs opacity-75">Multiple participants</div>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Selected ({selectedUsers.length})
                  </span>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((selectedUser) => (
                    <div
                      key={selectedUser._id}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      <span>{selectedUser.username}</span>
                      <button
                        onClick={() => handleUserSelect(selectedUser)}
                        className="text-blue-200 hover:text-white"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Searching users...</p>
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="p-6 text-center">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">
                    Type at least 2 characters to search for users
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">No users found</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {searchResults.map((searchUser) => {
                    const isSelected = selectedUsers.find(u => u._id === searchUser._id)
                    const isCurrentUser = searchUser._id === user?.id
                    
                    if (isCurrentUser) return null
                    
                    return (
                      <button
                        key={searchUser._id}
                        onClick={() => handleUserSelect(searchUser)}
                        disabled={!isGroup && selectedUsers.length >= 1 && !isSelected}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        } ${
                          !isGroup && selectedUsers.length >= 1 && !isSelected
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              searchUser.isOnline ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{searchUser.username}</p>
                            <p className="text-sm opacity-75">{searchUser.email}</p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <PlusIcon className="w-4 h-4 text-blue-600 rotate-45" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={handleNext}
                disabled={selectedUsers.length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGroup ? 'Next' : 'Create Chat'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Group Details Form */}
            <form onSubmit={handleSubmit(handleCreateChat)} className="flex-1 flex flex-col">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name
                  </label>
                  <input
                    {...register('name', {
                      required: 'Group name is required',
                      minLength: {
                        value: 1,
                        message: 'Group name cannot be empty'
                      },
                      maxLength: {
                        value: 100,
                        message: 'Group name is too long'
                      }
                    })}
                    type="text"
                    className="input-field w-full"
                    placeholder="Enter group name"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* Selected Members Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Members ({selectedUsers.length + 1})
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {/* Current user */}
                    <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user?.username} (You)</p>
                        <p className="text-xs text-gray-400">Admin</p>
                      </div>
                    </div>
                    
                    {/* Selected users */}
                    {selectedUsers.map((selectedUser) => (
                      <div key={selectedUser._id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{selectedUser.username}</p>
                          <p className="text-xs text-gray-400">Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('search')}
                  className="flex-1 btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Group
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}