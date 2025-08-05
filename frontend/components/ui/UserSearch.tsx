'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import api, { endpoints } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  _id: string
  username: string
  email: string
  isOnline: boolean
}

interface UserSearchProps {
  onUserSelect: (user: User) => void
  selectedUsers: User[]
  placeholder?: string
}

export default function UserSearch({ onUserSelect, selectedUsers, placeholder = "Search users..." }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await api.get(`${endpoints.searchUsers}?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(response.data.users || [])
        setShowResults(true)
      } catch (error) {
        console.error('Search failed:', error)
        toast.error('Failed to search users')
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
    setSearchQuery('')
    setShowResults(false)
  }

  const isUserSelected = (user: User) => {
    return selectedUsers.some(selected => selected._id === user._id)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              disabled={isUserSelected(user)}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-600 transition-colors text-left ${
                isUserSelected(user) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.username}</p>
                <p className="text-gray-400 text-sm truncate">{user.email}</p>
              </div>
              {isUserSelected(user) && (
                <span className="text-green-400 text-xs">Selected</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg z-10">
          <div className="px-4 py-3 text-gray-400 text-center">
            No users found for "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  )
}
