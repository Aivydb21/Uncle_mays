interface FacebookConversionData {
  eventType: string
  eventData: any
}

interface FacebookAPIResponse {
  success: boolean
  message?: string
  error?: string
}

export class FacebookConversionsAPI {
  private accessToken: string
  private pixelId: string

  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || ''
    this.pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''
  }

  private async sendToFacebookAPI(eventData: any): Promise<FacebookAPIResponse> {
    if (!this.accessToken || !this.pixelId) {
      throw new Error('Facebook access token or pixel ID not configured')
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.pixelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: this.accessToken,
          data: [eventData]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Facebook API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      return { success: true, message: 'Event sent successfully', ...result }
    } catch (error) {
      console.error('Facebook API error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async trackPurchase(eventData: any): Promise<FacebookAPIResponse> {
    const facebookEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventData.event_source_url || 'https://unclemays.com',
      user_data: {
        em: eventData.email ? this.hashEmail(eventData.email) : undefined,
        ph: eventData.phone ? this.hashPhone(eventData.phone) : undefined,
        external_id: eventData.external_id,
        client_ip_address: eventData.client_ip_address,
        client_user_agent: eventData.client_user_agent,
        fbc: eventData.fbc,
        fbp: eventData.fbp
      },
      custom_data: {
        value: eventData.value || 0,
        currency: eventData.currency || 'USD',
        content_name: eventData.content_name || 'Produce Box',
        content_category: eventData.content_category || 'Groceries',
        content_ids: eventData.content_ids || [],
        content_type: eventData.content_type || 'product',
        delivery_category: eventData.delivery_category || 'home_delivery'
      }
    }

    return this.sendToFacebookAPI(facebookEvent)
  }

  async trackLead(eventData: any): Promise<FacebookAPIResponse> {
    const facebookEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventData.event_source_url || 'https://unclemays.com',
      user_data: {
        em: eventData.email ? this.hashEmail(eventData.email) : undefined,
        ph: eventData.phone ? this.hashPhone(eventData.phone) : undefined,
        external_id: eventData.external_id,
        client_ip_address: eventData.client_ip_address,
        client_user_agent: eventData.client_user_agent,
        fbc: eventData.fbc,
        fbp: eventData.fbp
      },
      custom_data: {
        value: eventData.value || 1.00,
        currency: eventData.currency || 'USD',
        content_name: eventData.content_name || 'Newsletter Subscription',
        content_category: eventData.content_category || 'Lead Generation',
        content_ids: eventData.content_ids || [],
        content_type: eventData.content_type || 'product_group'
      }
    }

    return this.sendToFacebookAPI(facebookEvent)
  }

  async trackCustomEvent(eventData: any): Promise<FacebookAPIResponse> {
    const facebookEvent = {
      event_name: eventData.event_name || 'CustomEvent',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventData.event_source_url || 'https://unclemays.com',
      user_data: {
        em: eventData.email ? this.hashEmail(eventData.email) : undefined,
        ph: eventData.phone ? this.hashPhone(eventData.phone) : undefined,
        external_id: eventData.external_id,
        client_ip_address: eventData.client_ip_address,
        client_user_agent: eventData.client_user_agent,
        fbc: eventData.fbc,
        fbp: eventData.fbp
      },
      custom_data: eventData.custom_data || {}
    }

    return this.sendToFacebookAPI(facebookEvent)
  }

  // Simple hashing functions for user data (in production, use proper cryptographic hashing)
  private hashEmail(email: string): string {
    // This is a simple hash for demo purposes
    // In production, use proper SHA256 hashing
    return btoa(email.toLowerCase().trim())
  }

  private hashPhone(phone: string): string {
    // This is a simple hash for demo purposes
    // In production, use proper SHA256 hashing
    return btoa(phone.replace(/\D/g, ''))
  }
}

export function createFacebookConversionsAPI(): FacebookConversionsAPI {
  return new FacebookConversionsAPI()
}

