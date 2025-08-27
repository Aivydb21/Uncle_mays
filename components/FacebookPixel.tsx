'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    fbq: any
  }
}

export function FacebookPixel() {
  const pathname = usePathname()
  const [pixelId, setPixelId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch pixel ID from API
    const fetchPixelId = async () => {
      try {
        const response = await fetch('/api/facebook-pixel-config')
        if (response.ok) {
          const data = await response.json()
          setPixelId(data.pixelId)
        }
      } catch (error) {
        console.warn('Failed to fetch Facebook Pixel ID:', error)
      }
    }

    fetchPixelId()
  }, [])

  // Initialize Facebook Pixel (only once)
  useEffect(() => {
    if (!pixelId) return

    // Initialize Facebook Pixel only if not already initialized
    if (typeof window !== 'undefined' && !window.fbq) {
      // Load Facebook Pixel script
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
        fbq('init', '${pixelId}');
      `
      document.head.appendChild(script)

      // Add noscript fallback
      const noscript = document.createElement('noscript')
      const img = document.createElement('img')
      img.height = 1
      img.width = 1
      img.style.display = 'none'
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`
      noscript.appendChild(img)
      document.head.appendChild(noscript)
    }
  }, [pixelId]) // Only depend on pixelId, not pathname

  // Track page view on route change (separate effect)
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined' || !window.fbq) return

    // Track PageView when pixel is loaded and ready
    if (window.fbq.loaded) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, pixelId]) // Depend on both for route changes

  // Track custom events
  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters)
    }
  }

  // Track form submission
  const trackFormSubmission = (source: string, interests: string[]) => {
    trackEvent('Lead', {
      content_name: 'Subscription Form',
      content_category: source,
      value: 1.00,
      currency: 'USD',
      custom_data: {
        interests: interests.join(', '),
        source: source
      }
    })
  }

  // Track produce box interest
  const trackProduceBoxInterest = (boxType: string) => {
    trackEvent('ViewContent', {
      content_name: `${boxType} Produce Box`,
      content_category: 'Produce Boxes',
      value: 25.00,
      currency: 'USD'
    })
  }

  // Track community engagement
  const trackCommunityEngagement = (action: string) => {
    trackEvent('CustomEvent', {
      event_name: 'Community Engagement',
      content_name: action,
      content_category: 'Community'
    })
  }

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).trackFacebookEvent = trackEvent
      ;(window as any).trackFacebookFormSubmission = trackFormSubmission
      ;(window as any).trackFacebookProduceBoxInterest = trackProduceBoxInterest
      ;(window as any).trackFacebookCommunityEngagement = trackCommunityEngagement
    }
  }, [])

  return null // This component doesn't render anything
}

// Hook for easy Facebook Pixel tracking
export function useFacebookPixel() {
  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters)
    }
  }

  const trackFormSubmission = (source: string, interests: string[]) => {
    trackEvent('Lead', {
      content_name: 'Subscription Form',
      content_category: source,
      value: 1.00,
      currency: 'USD',
      custom_data: {
        interests: interests.join(', '),
        source: source
      }
    })
  }

  const trackProduceBoxInterest = (boxType: string) => {
    trackEvent('ViewContent', {
      content_name: `${boxType} Produce Box`,
      content_category: 'Produce Boxes',
      value: 25.00,
      currency: 'USD'
    })
  }

  const trackCommunityEngagement = (action: string) => {
    trackEvent('CustomEvent', {
      event_name: 'Community Engagement',
      content_name: action,
      content_category: 'Community'
    })
  }

  return {
    trackEvent,
    trackFormSubmission,
    trackProduceBoxInterest,
    trackCommunityEngagement
  }
}
