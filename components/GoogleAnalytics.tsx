'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: 'Uncle Mays Produce - Demand Testing',
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Custom hook for tracking events
export function useAnalytics() {
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  const trackFormSubmission = (source: 'hero' | 'cta', interests: string[]) => {
    trackEvent('form_submit', 'subscription', source, 1)
    
    // Track individual interests
    interests.forEach(interest => {
      trackEvent('interest_selected', 'subscription', interest, 1)
    })
  }

  const trackPageView = (page: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: page,
        page_location: window.location.href,
      })
    }
  }

  return {
    trackEvent,
    trackFormSubmission,
    trackPageView,
  }
}
