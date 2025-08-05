'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'

export default function LoginTest() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo123')
  const [status, setStatus] = useState('')
  const { login, isLoading, isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  const handleLogin = async () => {
    setStatus('Attempting login...')
    try {
      const success = await login(email, password)
      setStatus(`Login result: ${success}`)
      
      if (success) {
        setStatus('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
        <h1 className="text-white text-xl mb-4">Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-white mt-4">
            <p>Status: {status}</p>
            <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.username : 'None'}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
