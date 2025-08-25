'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSubscribe } from '@/lib/hooks/useSubscribe'
import { useAnalytics } from '@/components/GoogleAnalytics'

interface SubscribeFormProps {
  variant?: 'hero' | 'cta'
  className?: string
}

export function SubscribeForm({ variant = 'hero', className = '' }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  
  const { trackFormSubmission } = useAnalytics()

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests(prev => [...prev, interest])
    } else {
      setInterests(prev => prev.filter(i => i !== interest))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !zipCode) {
      setSubmitStatus('error')
      setStatusMessage('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setStatusMessage('')

    // Track form submission for analytics
    trackFormSubmission(variant, interests)

    try {
      // For now, just simulate success - we'll add Mailchimp back later
      // const success = await subscribe({ 
      //   email, 
      //   zipCode, 
      //   interests,
      //   source: variant 
      // })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Success - reset form and show message
      setSubmitStatus('success')
      setStatusMessage('Thank you for subscribing! We\'ll keep you updated on Uncle Mays Produce.')
      
      // Reset form
      setEmail('')
      setZipCode('')
      setInterests([])
      
      // Log the submission (for now, just to console)
      console.log('✅ Form submitted successfully:', {
        email,
        zipCode,
        interests,
        source: variant,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setStatusMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isHero = variant === 'hero'
  const isCTA = variant === 'cta'

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-200">
          {statusMessage}
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-800 border border-red-200">
          {statusMessage}
        </div>
      )}

      <div className="space-y-5">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          className={`w-full h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
            isCTA ? 'bg-white/90 text-foreground border-0 focus:ring-2 focus:ring-white/50' : ''
          }`}
        />
        
        <Input
          type="text"
          placeholder="Your zip code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
          maxLength={10}
          disabled={isSubmitting}
          className={`w-full h-12 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
            isCTA ? 'bg-white/90 text-foreground border-0 focus:ring-2 focus:ring-white/50' : ''
          }`}
        />

        {isHero && (
          <div className="text-left space-y-4">
            <p className="text-sm font-medium text-foreground">I'm interested in:</p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 text-sm cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={interests.includes('popups')}
                  onChange={(e) => handleInterestChange('popups', e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-border/50 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span>Pop-up store notifications in Hyde Park & Chicago</span>
              </label>
              <label className="flex items-center space-x-3 text-sm cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={interests.includes('delivery')}
                  onChange={(e) => handleInterestChange('delivery', e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-border/50 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span>Produce box delivery from Black farmers</span>
              </label>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email || !zipCode}
          className={`w-full h-12 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 ${
            isCTA 
              ? 'bg-white text-primary hover:bg-white/90' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Subscribing...</span>
            </div>
          ) : (
            isCTA ? 'Join Uncle Mays Community' : 'Join Our Community'
          )}
        </Button>
      </div>

      {isHero && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Supporting Black farmers and community. Unsubscribe anytime.
        </p>
      )}
    </form>
  )
}
