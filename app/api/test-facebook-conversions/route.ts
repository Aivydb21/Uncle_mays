import { NextRequest, NextResponse } from 'next/server'
import { createFacebookConversionsAPI } from '@/lib/services/facebookConversions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEventCode } = body

    // Create a test purchase event similar to your sample payload
    const testEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: ['7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068'],
        ph: [null]
      },
      attribution_data: {
        attribution_share: '0.3'
      },
      custom_data: {
        currency: 'USD',
        value: '142.52'
      },
      original_event_data: {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000)
      }
    }

    const facebookAPI = createFacebookConversionsAPI()
    
    if (testEventCode) {
      // Send as test event
      const result = await facebookAPI.testEvent(testEvent, testEventCode)
      return NextResponse.json({ 
        success: true, 
        message: 'Test event sent successfully',
        result,
        event: testEvent
      })
    } else {
      // Send as regular event
      const result = await facebookAPI.trackPurchase({
        email: 'test@example.com', // This will be hashed
        value: 142.52,
        currency: 'USD',
        content_name: 'Test Purchase',
        content_category: 'Test'
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Purchase event sent successfully',
        result
      })
    }

  } catch (error) {
    console.error('Facebook conversion test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send Facebook conversion event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Facebook Conversions Test API endpoint',
    instructions: 'Send a POST request with { "testEventCode": "your_test_code" } to test events'
  })
}
