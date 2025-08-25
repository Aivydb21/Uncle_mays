import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/services/googleSheets'

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID
    const sheetName = process.env.SHEET_NAME || 'Sheet1'
    
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        message: 'Google Sheets not configured',
        error: 'SPREADSHEET_ID is not set in environment variables',
        nextSteps: [
          'Create a Google Sheet',
          'Share it with "Anyone with link can edit"',
          'Copy the spreadsheet ID from the URL',
          'Add it to .env.local as SPREADSHEET_ID'
        ]
      }, { status: 400 })
    }

    // Initialize the service
    GoogleSheetsService.initialize(spreadsheetId, sheetName)
    
    // Try to read from the sheet
    const subscriptions = await GoogleSheetsService.getSubscriptions()
    
    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful!',
      spreadsheetId: spreadsheetId,
      sheetName: sheetName,
      currentSubscriptions: subscriptions.length,
      status: 'Ready to collect data'
    })
    
  } catch (error: any) {
    console.error('Google Sheets test error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Google Sheets connection failed',
      error: error.message,
      suggestion: 'Check your spreadsheet ID and sharing settings'
    }, { status: 500 })
  }
}
