import { useState } from 'react'

interface SubscribeData {
  email: string
  zipCode: string
  interests: string[]
  source: 'hero' | 'cta'
}

interface SubscribeResponse {
  success: boolean
  message: string
  error?: string
  isNewSubscriber?: boolean
}

export function useSubscribe() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const subscribe = async (data: SubscribeData): Promise<boolean> => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: SubscribeResponse = await response.json()

      if (response.ok && result.success) {
        const successMessage = result.isNewSubscriber 
          ? result.message 
          : 'Preferences updated! Thanks for staying connected.'
        
        setMessage({ type: 'success', text: successMessage })
        return true
      } else {
        setMessage({ type: 'error', text: result.error || 'Something went wrong. Please try again.' })
        return false
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessage = () => setMessage(null)

  return {
    subscribe,
    isLoading,
    message,
    clearMessage,
  }
}
