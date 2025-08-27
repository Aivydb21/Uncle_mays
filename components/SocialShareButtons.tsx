'use client'

import { Share2, Facebook, Twitter, Linkedin, Mail, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SocialShareButtonsProps {
  url?: string
  title?: string
  description?: string
  className?: string
}

export function SocialShareButtons({ 
  url = typeof window !== 'undefined' ? window.location.href : 'https://unclemays.com',
  title = "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
  description = "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
  className = ''
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareData = {
    title,
    text: description,
    url
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl()
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log('Error copying URL:', error)
    }
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=UncleMays,BlackFarmers,Chicago,Produce`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const shareToLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedinUrl, '_blank', 'width=600,height=400')
  }

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`
    window.location.href = emailUrl
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {/* Native Share Button (Mobile) */}
      <Button
        onClick={handleShare}
        variant="outline"
        className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {/* Facebook */}
      <Button
        onClick={shareToFacebook}
        variant="outline"
        className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
      >
        <Facebook className="w-4 h-4 mr-2" />
        Facebook
      </Button>

      {/* Twitter */}
      <Button
        onClick={shareToTwitter}
        variant="outline"
        className="bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100 hover:border-sky-300 transition-all duration-200"
      >
        <Twitter className="w-4 h-4 mr-2" />
        Twitter
      </Button>

      {/* LinkedIn */}
      <Button
        onClick={shareToLinkedIn}
        variant="outline"
        className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
      >
        <Linkedin className="w-4 h-4 mr-2" />
        LinkedIn
      </Button>

      {/* Email */}
      <Button
        onClick={shareViaEmail}
        variant="outline"
        className="bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
      >
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>

      {/* Copy URL */}
      <Button
        onClick={handleCopyUrl}
        variant="outline"
        className="bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300 transition-all duration-200"
      >
        {copied ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  )
}



