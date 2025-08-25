import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/services/airtable'

export async function GET(request: NextRequest) {
  try {
    // Test Airtable connection by trying to read from the table
    const testEmail = 'test@example.com'
    const existingSubscription = await AirtableService.checkExistingSubscription(testEmail)
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful!',
      testResult: {
        email: testEmail,
        exists: existingSubscription,
        tableAccess: 'Working'
      },
      nextSteps: [
        'Table connection is working',
        'You can now test form submissions',
        'Check that your table has the correct field names'
      ]
    })
    
  } catch (error: any) {
    console.error('Airtable test error:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Unknown error occurred'
    let suggestion = 'Check your Airtable configuration'
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key'
      suggestion = 'Check AIRTABLE_API_KEY in .env.local'
    } else if (error.message?.includes('base')) {
      errorMessage = 'Invalid base ID'
      suggestion = 'Check AIRTABLE_BASE_ID in .env.local'
    } else if (error.message?.includes('table')) {
      errorMessage = 'Table not found or access denied'
      suggestion = 'Create "Subscriptions" table in your Airtable base'
    } else if (error.message?.includes('field')) {
      errorMessage = 'Field not found'
      suggestion = 'Check field names in your Airtable table'
    }
    
    return NextResponse.json({
      success: false,
      message: 'Airtable connection failed',
      error: errorMessage,
      suggestion: suggestion,
      details: error.message
    }, { status: 500 })
  }
}
