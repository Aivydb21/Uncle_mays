'use client'

import { useState } from 'react'
import Head from 'next/head'

export default function TestFacebookPage() {
  const [testEventCode, setTestEventCode] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testFacebookConversion = async (useTestCode: boolean = false) => {
    setLoading(true)
    setStatus('')
    setResult(null)

    try {
      const payload = useTestCode 
        ? { testEventCode }
        : {}

      const response = await fetch('/api/test-facebook-conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Facebook conversion test result:', data)
      setResult(data)
      setStatus(`Success: ${data.message}`)
      
    } catch (error) {
      console.error('❌ Facebook conversion test error:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Facebook Conversions Test - UNCLE MAY'S Produce</title>
        <meta name="description" content="Test Facebook conversion tracking for UNCLE MAY'S Produce & Provisions. Debug and verify Facebook pixel events." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://unclemays.com/test-facebook" />
      </Head>
      
      <div className="min-h-screen bg-amber-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Facebook Conversions API Test</h1>
          
          <div className="space-y-6">
            {/* Test Event Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Event Code (Optional)
              </label>
              <input
                type="text"
                value={testEventCode}
                onChange={(e) => setTestEventCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter test event code from Facebook Events Manager"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from Facebook Events Manager → Test Events tab
              </p>
            </div>

            {/* Test Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => testFacebookConversion(false)}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Regular Event'}
              </button>
              
              <button
                onClick={() => testFacebookConversion(true)}
                disabled={loading || !testEventCode}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400"
              >
                {loading ? 'Testing...' : 'Test with Code'}
              </button>
            </div>

            {/* Status */}
            {status && (
              <div className={`p-3 rounded-md ${
                status.startsWith('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">API Response:</h3>
                <pre className="text-xs text-gray-700 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-amber-50 p-4 rounded-md">
              <h3 className="font-medium text-amber-900 mb-2">How to Test:</h3>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Make sure your environment variables are set (FACEBOOK_ACCESS_TOKEN and NEXT_PUBLIC_FACEBOOK_PIXEL_ID)</li>
                <li>Click "Test Regular Event" to send a test purchase event</li>
                <li>Check Facebook Events Manager to see if the event appears</li>
                <li>Use a test event code to avoid affecting your real data</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

