'use client'

import { useState } from 'react'

export default function TestForm() {
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    try {
      console.log('🔄 Submitting form...', { email, zipCode })
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          zipCode,
          interests: ['test'],
          source: 'test-form'
        })
      })

      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Success:', result)
      setStatus(`Success: ${result.message}`)
      setEmail('')
      setZipCode('')
      
      // Track Facebook conversion (Lead event)
      try {
        await fetch('/api/facebook-conversions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType: 'lead',
            eventData: {
              email: email,
              content_name: 'Test Form Submission',
              content_category: 'Test Form',
              custom_data: {
                source: 'test-form',
                zipCode: zipCode
              }
            }
          })
        })
        console.log('✅ Facebook conversion event sent successfully')
      } catch (fbError) {
        console.warn('⚠️ Facebook conversion tracking failed:', fbError)
        // Don't fail the form submission if Facebook tracking fails
      }
      
    } catch (error) {
      console.error('❌ Form error:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Form Test Page</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="12345"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Test Submit'}
          </button>
        </form>
        
        {status && (
          <div className={`mt-4 p-3 rounded-md ${
            status.startsWith('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
}


