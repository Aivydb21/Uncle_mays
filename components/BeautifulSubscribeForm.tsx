'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Leaf, Users, MapPin, CheckCircle } from 'lucide-react'
import { useAnalytics } from '@/components/GoogleAnalytics'

interface BeautifulSubscribeFormProps {
  variant?: 'hero' | 'cta'
  className?: string
}

export function BeautifulSubscribeForm({ variant = 'hero', className = '' }: BeautifulSubscribeFormProps) {
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
          // Submit to our local API endpoint
          const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              zipCode,
              interests,
              source: variant
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result = await response.json()
          
          if (result.success) {
            // Success - reset form and show message
            setSubmitStatus('success')
            setStatusMessage(result.message || 'Thank you for subscribing! We\'ll keep you updated on Uncle Mays Produce.')
            
            // Reset form
            setEmail('')
            setZipCode('')
            setInterests([])
            
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
                    content_name: 'Newsletter Subscription',
                    content_category: variant === 'hero' ? 'Hero Form' : 'CTA Form',
                    custom_data: {
                      interests: interests.join(', '),
                      zipCode: zipCode,
                      source: variant
                    }
                  }
                })
              })
              console.log('✅ Facebook conversion event sent successfully')
            } catch (fbError) {
              console.warn('⚠️ Facebook conversion tracking failed:', fbError)
              // Don't fail the form submission if Facebook tracking fails
            }
            
            // Log the submission
            console.log('✅ Form submitted successfully to Google Sheets:', {
              email,
              zipCode,
              interests,
              source: variant,
              timestamp: new Date().toISOString()
            })
          } else {
            throw new Error(result.error || 'Failed to subscribe')
          }
      
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
    <div className={className}>
      {isHero && (
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground">Stay Connected</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Join our community and get updates on Uncle Mays Produce
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-sm bg-green-50 text-green-800 border border-green-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="font-medium text-sm sm:text-base">{statusMessage}</span>
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="font-medium text-sm sm:text-base">{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-amber-900">Email Address *</label>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full h-12 sm:h-14 text-base border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
          />
        </div>
        
        {/* Zip Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-amber-900">Zip Code *</label>
          <Input
            type="text"
            placeholder="Enter your zip code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            maxLength={10}
            disabled={isSubmitting}
            className="w-full h-12 sm:h-14 text-base border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
          />
        </div>

        {/* Interests Section */}
        {isHero && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-amber-900">I'm interested in:</label>
            <div className="space-y-3">
              <label className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-lg border border-amber-200 hover:border-amber-400 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  checked={interests.includes('popups')}
                  onChange={(e) => handleInterestChange('popups', e.target.checked)}
                  disabled={isSubmitting}
                  className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 rounded border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-200 transition-all duration-200 flex-shrink-0"
                />
                <div className="flex items-center space-x-2 min-w-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-800 leading-relaxed">Pop-up store notifications in Hyde Park & Chicago</span>
                </div>
              </label>
              
              <label className="flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-lg border border-amber-200 hover:border-amber-400 transition-colors cursor-pointer group">
                <input
                  type="checkbox"
                  checked={interests.includes('delivery')}
                  onChange={(e) => handleInterestChange('delivery', e.target.checked)}
                  disabled={isSubmitting}
                  className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 rounded border-amber-300 text-amber-600 focus:ring-2 focus:ring-amber-200 transition-all duration-200 flex-shrink-0"
                />
                <div className="flex items-center space-x-2 min-w-0">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-800 leading-relaxed">Produce box delivery from Black farmers</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !email || !zipCode}
          className={`w-full h-12 sm:h-14 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
            isCTA 
              ? 'bg-white text-amber-700 hover:bg-white/90 border border-amber-200' 
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Saving to Google Sheets...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{isCTA ? 'Join Uncle Mays Community' : 'Join Our Community'}</span>
            </div>
          )}
        </Button>
      </form>

      {isHero && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 text-center">
          Supporting Black farmers and community. Unsubscribe anytime.
        </p>
      )}
    </div>
  )
}
