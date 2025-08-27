import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    console.log('🔐 Testing Google Auth...')
    
    // Check environment variables
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME
    
    if (!privateKey || !clientEmail || !spreadsheetId || !sheetName) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        env: { hasPrivateKey: !!privateKey, hasClientEmail: !!clientEmail, hasSpreadsheetId: !!spreadsheetId, hasSheetName: !!sheetName }
      }, { status: 500 })
    }

    try {
      // Set up Google Sheets authentication
      const auth = new google.auth.GoogleAuth({
        credentials: {
          private_key: privateKey.replace(/\\n/g, '\n'),
          client_email: clientEmail,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      console.log('✅ Auth created successfully')
      
      const sheets = google.sheets({ version: 'v4', auth })
      
      // Try to get basic spreadsheet info
      console.log('📊 Testing spreadsheet access...')
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      })
      
      console.log('✅ Spreadsheet accessed successfully')
      
      // Try to get sheet info
      console.log('📋 Testing sheet access...')
      const sheet = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName
      })
      
      console.log('✅ Sheet accessed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Google Sheets authentication and access working',
        spreadsheet: {
          title: spreadsheet.data.properties?.title,
          sheets: spreadsheet.data.sheets?.map(s => s.properties?.title)
        },
        sheetData: {
          rowCount: sheet.data.values?.length || 0,
          firstRow: sheet.data.values?.[0] || []
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (authError) {
      console.error('❌ Google Auth error:', authError)
      return NextResponse.json({
        success: false,
        error: 'Google Auth failed',
        details: authError instanceof Error ? authError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
