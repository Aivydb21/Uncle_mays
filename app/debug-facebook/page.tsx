'use client'

import { useEffect } from 'react'

export default function DebugFacebookPage() {
  useEffect(() => {
    console.log('Debug Facebook Page loaded')
    console.log('Environment variables:')
    console.log('NEXT_PUBLIC_FACEBOOK_PIXEL_ID:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID)
    
    // Check if fbq is available
    if (typeof window !== 'undefined') {
      console.log('Window object available')
      console.log('window.fbq:', (window as any).fbq)
      
      // Try to manually initialize Facebook Pixel
      if (!(window as any).fbq) {
        console.log('Facebook Pixel not loaded, trying to load manually...')
        
        const script = document.createElement('script')
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2276705169443313');
          fbq('track', 'PageView');
        `
        document.head.appendChild(script)
        
        // Add noscript fallback
        const noscript = document.createElement('noscript')
        const img = document.createElement('img')
        img.height = 1
        img.width = 1
        img.style.display = 'none'
        img.src = 'https://www.facebook.com/tr?id=2276705169443313&ev=PageView&noscript=1'
        noscript.appendChild(img)
        document.head.appendChild(noscript)
        
        console.log('Facebook Pixel script added manually')
      } else {
        console.log('Facebook Pixel already loaded')
        ;(window as any).fbq('track', 'PageView')
      }
    }
  }, [])

  const testEvent = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      console.log('Sending test event...')
      ;(window as any).fbq('track', 'Lead', {
        content_name: 'Test Event',
        content_category: 'Debug',
        value: 1.00,
        currency: 'USD'
      })
      console.log('Test event sent')
    } else {
      console.log('Facebook Pixel not available for test event')
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Facebook Pixel Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
            <p>NEXT_PUBLIC_FACEBOOK_PIXEL_ID: {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'NOT SET'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Facebook Pixel Status:</h2>
            <p id="pixel-status">Checking...</p>
          </div>
          
          <button 
            onClick={testEvent}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Test Facebook Event
          </button>
          
          <div className="bg-amber-50 p-4 rounded-md">
            <h3 className="font-medium text-amber-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Open browser developer tools (F12)</li>
              <li>Check the Console tab for debug messages</li>
              <li>Click "Test Facebook Event" to send a test event</li>
              <li>Check Facebook Events Manager for the event</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
