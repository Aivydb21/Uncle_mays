import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService, SubscriptionData } from '@/lib/services/googleSheets'
import { MailchimpService } from '@/lib/services/mailchimp'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting subscription process...')
    
    const body = await request.json()
    const { email, zipCode, interests, source = 'hero' } = body
    
    console.log('📝 Received data:', { email, zipCode, interests, source })

    // Basic validation
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email:', email)
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!zipCode || zipCode.length < 5) {
      console.log('❌ Invalid zip code:', zipCode)
      return NextResponse.json(
        { error: 'Valid zip code is required' },
        { status: 400 }
      )
    }

    // Initialize Google Sheets service
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1'
    
    console.log('🔧 Initializing with:', { spreadsheetId, sheetName })
    
    if (!spreadsheetId) {
      console.log('❌ Missing spreadsheet ID')
      return NextResponse.json(
        { error: 'Google Sheets not configured. Please set GOOGLE_SHEETS_SPREADSHEET_ID.' },
        { status: 500 }
      )
    }

    try {
      GoogleSheetsService.initialize(spreadsheetId, sheetName)
      console.log('✅ Google Sheets service initialized')
    } catch (initError) {
      console.error('❌ Failed to initialize Google Sheets service:', initError)
      return NextResponse.json(
        { error: 'Failed to initialize Google Sheets service' },
        { status: 500 }
      )
    }

    // Check if subscriber already exists
    console.log('🔍 Checking for existing subscription...')
    let existingSubscription: boolean
    try {
      existingSubscription = await GoogleSheetsService.checkExistingSubscription(email)
      console.log('🔍 Existing subscription check result:', existingSubscription)
    } catch (checkError) {
      console.error('❌ Error checking existing subscription:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing subscription' },
        { status: 500 }
      )
    }
    
    if (existingSubscription) {
      console.log('🔄 Updating existing subscription...')
      try {
        const updated = await GoogleSheetsService.updateSubscription(email, { zipCode, interests })
        if (updated) {
          console.log('✅ Existing subscription updated:', email)
        } else {
          console.log('⚠️ Failed to update existing subscription')
        }
      } catch (updateError) {
        console.error('❌ Error updating subscription:', updateError)
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        )
      }
    } else {
      console.log('🆕 Creating new subscription...')
      try {
        const subscriptionData: SubscriptionData = {
          email,
          zipCode,
          interests: interests || [],
          source,
          timestamp: new Date().toISOString()
        }

        const saved = await GoogleSheetsService.createSubscription(subscriptionData)
        if (!saved) {
          console.log('❌ Failed to save subscription')
          return NextResponse.json(
            { error: 'Failed to save subscription. Please try again.' },
            { status: 500 }
          )
        }
        console.log('✅ New subscription created:', email)
      } catch (createError) {
        console.error('❌ Error creating subscription:', createError)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }
    }

    // Add to Mailchimp (optional)
    try {
      const mailchimpData = {
        email,
        zipCode,
        interests: interests || [],
        source
      }

      const mailchimpSuccess = await MailchimpService.addSubscriber(mailchimpData)
      
      if (!mailchimpSuccess) {
        console.warn('⚠️ Failed to add to Mailchimp, but saved to Google Sheets:', email)
      } else {
        console.log('✅ Added to Mailchimp:', email)
      }
    } catch (mailchimpError) {
      console.warn('⚠️ Mailchimp error (non-critical):', mailchimpError)
    }

    // Send welcome email (optional)
    try {
      await MailchimpService.sendWelcomeEmail(email)
      console.log('✅ Welcome email sent:', email)
    } catch (welcomeError) {
      console.warn('⚠️ Welcome email error (non-critical):', welcomeError)
    }

    console.log('🎉 Subscription process completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! We\'ll keep you updated on Uncle Mays Produce.',
      isNewSubscriber: !existingSubscription
    })

  } catch (error) {
    console.error('❌ Subscription error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
