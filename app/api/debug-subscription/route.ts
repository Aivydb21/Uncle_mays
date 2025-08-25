import { NextRequest, NextResponse } from 'next/server'
import { AirtableService, SubscriptionData } from '@/lib/services/airtable'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, zipCode, interests, source = 'hero' } = body

    console.log('🔍 Debug: Received data:', { email, zipCode, interests, source })

    // Test data creation
    const subscriptionData: SubscriptionData = {
      email,
      zipCode,
      interests: interests || [],
      source,
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Debug: Formatted data for Airtable:', subscriptionData)

    // Try to create the subscription
    const result = await AirtableService.createSubscription(subscriptionData)
    
    console.log('🔍 Debug: Airtable result:', result)

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test subscription created successfully!',
        data: subscriptionData,
        result: result
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to create test subscription',
        data: subscriptionData,
        error: 'AirtableService.createSubscription returned false'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('🔍 Debug: Error details:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Debug subscription failed',
      error: error.message,
      stack: error.stack,
      details: 'Check server console for more information'
    }, { status: 500 })
  }
}
