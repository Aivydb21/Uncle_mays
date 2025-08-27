interface FacebookConversionEvent {
  event_name: string
  event_time: number
  action_source: string
  user_data: {
    em?: string[]
    ph?: string[]
    external_id?: string[]
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string
    fbp?: string
  }
  custom_data?: {
    currency?: string
    value?: string | number
    content_name?: string
    content_category?: string
    content_ids?: string[]
    content_type?: string
    [key: string]: any
  }
  event_source_url?: string
  event_id?: string
}

interface FacebookConversionsPayload {
  data: FacebookConversionEvent[]
  access_token: string
  test_event_code?: string
}

export class FacebookConversionsAPI {
  private accessToken: string
  private pixelId: string
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor(accessToken: string, pixelId: string) {
    this.accessToken = accessToken
    this.pixelId = pixelId
  }

  private async sendEvent(payload: FacebookConversionsPayload): Promise<any> {
    const url = `${this.baseUrl}/${this.pixelId}/events`
    
    try {
      console.log('Sending Facebook event to:', url)
      console.log('Payload:', JSON.stringify(payload, null, 2))
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      console.log('Facebook API response status:', response.status)
      console.log('Facebook API response body:', responseText)

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}: ${responseText}`)
      }

      const result = responseText ? JSON.parse(responseText) : {}
      return result
    } catch (error) {
      console.error('Error sending Facebook conversion event:', error)
      throw error
    }
  }

  // Hash email for privacy using SHA256
  private async hashEmail(email: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(email.toLowerCase().trim())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  // Send a purchase event
  async trackPurchase(data: {
    email: string
    value: number
    currency?: string
    content_ids?: string[]
    content_name?: string
    content_category?: string
    event_id?: string
    fbc?: string
    fbp?: string
  }): Promise<any> {
    const hashedEmail = await this.hashEmail(data.email)
    
    const event: FacebookConversionEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: [hashedEmail],
        fbc: data.fbc,
        fbp: data.fbp,
      },
      custom_data: {
        currency: data.currency || 'USD',
        value: data.value.toString(),
        content_ids: data.content_ids,
        content_name: data.content_name,
        content_category: data.content_category,
      },
      event_id: data.event_id,
    }

    const payload: FacebookConversionsPayload = {
      data: [event],
      access_token: this.accessToken,
    }

    return this.sendEvent(payload)
  }

  // Send a lead event
  async trackLead(data: {
    email: string
    value?: number
    currency?: string
    content_name?: string
    content_category?: string
    event_id?: string
    fbc?: string
    fbp?: string
  }): Promise<any> {
    const hashedEmail = await this.hashEmail(data.email)
    
    const event: FacebookConversionEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: [hashedEmail],
        fbc: data.fbc,
        fbp: data.fbp,
      },
      custom_data: {
        currency: data.currency || 'USD',
        value: data.value?.toString() || '0',
        content_name: data.content_name,
        content_category: data.content_category,
      },
      event_id: data.event_id,
    }

    const payload: FacebookConversionsPayload = {
      data: [event],
      access_token: this.accessToken,
    }

    return this.sendEvent(payload)
  }

  // Send a custom event
  async trackCustomEvent(data: {
    event_name: string
    email?: string
    value?: number
    currency?: string
    custom_data?: Record<string, any>
    event_id?: string
    fbc?: string
    fbp?: string
  }): Promise<any> {
    const hashedEmail = data.email ? await this.hashEmail(data.email) : undefined
    
    const event: FacebookConversionEvent = {
      event_name: data.event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: hashedEmail ? [hashedEmail] : undefined,
        fbc: data.fbc,
        fbp: data.fbp,
      },
      custom_data: {
        currency: data.currency || 'USD',
        value: data.value?.toString(),
        ...data.custom_data,
      },
      event_id: data.event_id,
    }

    const payload: FacebookConversionsPayload = {
      data: [event],
      access_token: this.accessToken,
    }

    return this.sendEvent(payload)
  }

  // Test event (for development)
  async testEvent(event: FacebookConversionEvent, testEventCode: string): Promise<any> {
    const payload: FacebookConversionsPayload = {
      data: [event],
      access_token: this.accessToken,
      test_event_code: testEventCode,
    }

    return this.sendEvent(payload)
  }
}

// Utility function to create the service instance
export function createFacebookConversionsAPI(): FacebookConversionsAPI {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
  const pixelId = process.env.FACEBOOK_PIXEL_ID

  if (!accessToken) {
    throw new Error('FACEBOOK_ACCESS_TOKEN environment variable is required')
  }

  if (!pixelId) {
    throw new Error('FACEBOOK_PIXEL_ID environment variable is required')
  }

  return new FacebookConversionsAPI(accessToken, pixelId)
}
