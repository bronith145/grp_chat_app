'use client'

import { useState } from 'react'

export default function TestLogin() {
  const [result, setResult] = useState('')

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123'
        })
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-4">
      <button 
        onClick={testLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Login
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {result}
      </pre>
    </div>
  )
}
