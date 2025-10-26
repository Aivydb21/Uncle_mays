import { NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/services/googleSheets'

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Sheet1'
    
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SHEETS_SPREADSHEET_ID not set',
        env: { spreadsheetId, sheetName }
      }, { status: 500 })
    }

    // Try to initialize the service
    try {
      GoogleSheetsService.initialize(spreadsheetId, sheetName)
      
      return NextResponse.json({
        success: true,
        message: 'Google Sheets service initialized successfully',
        config: { spreadsheetId, sheetName },
        timestamp: new Date().toISOString()
      })
    } catch (initError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Google Sheets service',
        details: initError instanceof Error ? initError.message : 'Unknown error',
        config: { spreadsheetId, sheetName },
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

