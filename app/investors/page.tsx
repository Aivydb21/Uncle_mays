'use client'

import { useEffect } from 'react'
import { Metadata } from 'next'

export default function InvestorsPage() {
  useEffect(() => {
    // Redirect to the Publuu pitch deck after a short delay
    const timer = setTimeout(() => {
      window.location.href = 'https://publuu.com/flip-book/996063/2195625'
    }, 2000) // 2 second delay to show the loading message

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-amber-200">
          <div className="mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-amber-600 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-amber-900 mb-2">
              Investor Portal
            </h1>
            <p className="text-amber-700">
              Redirecting you to our pitch deck...
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-amber-600">
            <p>If you are not redirected automatically,</p>
            <a 
              href="https://publuu.com/flip-book/996063/2195625"
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200"
            >
              Click here to view pitch deck
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

