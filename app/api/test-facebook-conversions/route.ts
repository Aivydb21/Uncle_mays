import { NextRequest, NextResponse } from 'next/server'
import { createFacebookConversionsAPI } from '@/lib/services/facebookConversions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEventCode } = body

    console.log('🧪 Testing Facebook conversion with:', { testEventCode })

    // Create test event data
    const testEventData = {
      event_source_url: 'https://unclemays.com/test-facebook',
      client_user_agent: 'Mozilla/5.0 (Test Browser)',
      custom_data: {
        test_mode: true,
        test_event_code: testEventCode || 'TEST123',
        source: 'test-page'
      }
    }

    // Initialize Facebook API
    const facebookAPI = createFacebookConversionsAPI()

    // Send test lead event
    const result = await facebookAPI.trackLead({
      ...testEventData,
      content_name: 'Test Lead Event',
      content_category: 'Test Page',
      value: 1.00,
      currency: 'USD'
    })

    if (result.success) {
      console.log('✅ Test Facebook conversion successful:', result)
      return NextResponse.json({
        success: true,
        message: 'Test Facebook conversion event sent successfully',
        result,
        testEventCode: testEventCode || 'TEST123'
      })
    } else {
      console.log('❌ Test Facebook conversion failed:', result)
      return NextResponse.json({
        success: false,
        message: 'Test Facebook conversion failed',
        error: result.error,
        result
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test Facebook conversion error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Facebook Conversions Test API endpoint',
    usage: 'POST with optional testEventCode in body'
  })
}





