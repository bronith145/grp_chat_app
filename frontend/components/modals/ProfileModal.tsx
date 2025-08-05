'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/stores/authStore'
import api, { endpoints } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  XMarkIcon,
  UserIcon,
  PencilIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface ProfileForm {
  username: string
  avatar: string
}

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, updateUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username || '',
      avatar: user?.avatar || ''
    }
  })

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      reset({
        username: user?.username || '',
        avatar: user?.avatar || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleUpdateProfile = async (data: ProfileForm) => {
    if (!isDirty) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      const response = await api.put(endpoints.updateProfile, {
        username: data.username.trim(),
        avatar: data.avatar.trim() || undefined
      })
      
      updateUser(response.data.user)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800"></div>
              </div>
              <h3 className="text-lg font-semibold text-white">{user.username}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    maxLength: {
                      value: 30,
                      message: 'Username cannot exceed 30 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Username can only contain letters, numbers, _ and -'
                    }
                  })}
                  type="text"
                  disabled={!isEditing}
                  className={`input-field w-full ${
                    !isEditing ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''
                  }`}
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>

            {/* Avatar URL Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                {...register('avatar', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
                type="url"
                disabled={!isEditing}
                placeholder="https://example.com/avatar.jpg"
                className={`input-field w-full ${
                  !isEditing ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''
                }`}
              />
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-400">{errors.avatar.message}</p>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Member since:</span>
                <span className="text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || !isDirty}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}