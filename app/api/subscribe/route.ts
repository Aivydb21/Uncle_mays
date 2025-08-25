import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService, SubscriptionData } from '@/lib/services/googleSheets'
import { MailchimpService } from '@/lib/services/mailchimp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, zipCode, interests, source = 'hero' } = body

    // Basic validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!zipCode || zipCode.length < 5) {
      return NextResponse.json(
        { error: 'Valid zip code is required' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets service
    const spreadsheetId = process.env.SPREADSHEET_ID
    const sheetName = process.env.SHEET_NAME || 'Sheet1'
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Google Sheets not configured. Please set SPREADSHEET_ID.' },
        { status: 500 }
      )
    }

    GoogleSheetsService.initialize(spreadsheetId, sheetName)

    // Check if subscriber already exists
    const existingSubscription = await GoogleSheetsService.checkExistingSubscription(email)
    
    if (existingSubscription) {
      // Update existing subscription
      const updated = await GoogleSheetsService.updateSubscription(email, { zipCode, interests })
      if (updated) {
        console.log('✅ Existing subscription updated:', email)
      }
    } else {
      // Create new subscription
      const subscriptionData: SubscriptionData = {
        email,
        zipCode,
        interests: interests || [],
        source,
        timestamp: new Date().toISOString()
      }

      const saved = await GoogleSheetsService.createSubscription(subscriptionData)
      if (!saved) {
        return NextResponse.json(
          { error: 'Failed to save subscription. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Add to Mailchimp
    const mailchimpData = {
      email,
      zipCode,
      interests: interests || [],
      source
    }

    const mailchimpSuccess = await MailchimpService.addSubscriber(mailchimpData)
    
    if (!mailchimpSuccess) {
      console.warn('⚠️ Failed to add to Mailchimp, but saved to Google Sheets:', email)
      // Don't fail the request if Mailchimp fails, since we saved to Google Sheets
    }

    // Send welcome email (optional)
    await MailchimpService.sendWelcomeEmail(email)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! We\'ll keep you updated on Uncle Mays Produce.',
      isNewSubscriber: !existingSubscription
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
