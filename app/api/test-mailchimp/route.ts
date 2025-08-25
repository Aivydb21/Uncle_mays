import { NextRequest, NextResponse } from 'next/server'
import { MailchimpService } from '@/lib/services/mailchimp'

export async function GET(request: NextRequest) {
  try {
    // Test Mailchimp connection by getting list stats
    const stats = await MailchimpService.getListStats()
    
    if (stats) {
      return NextResponse.json({
        success: true,
        message: 'Mailchimp connection successful!',
        stats: {
          totalSubscribers: stats.totalSubscribers,
          unsubscribeCount: stats.unsubscribeCount,
          lastSubscriber: stats.lastSubscriber
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to get Mailchimp stats',
        error: 'Could not retrieve list information'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Mailchimp test error:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Unknown error occurred'
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key - check AIRTABLE_API_KEY'
    } else if (error.message?.includes('server')) {
      errorMessage = 'Invalid server prefix - check MAILCHIMP_SERVER_PREFIX'
    } else if (error.message?.includes('list')) {
      errorMessage = 'Invalid list ID - check MAILCHIMP_LIST_ID'
    }
    
    return NextResponse.json({
      success: false,
      message: 'Mailchimp connection failed',
      error: errorMessage,
      details: error.message
    }, { status: 500 })
  }
}
