import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      hasSheetName: !!process.env.GOOGLE_SHEETS_SHEET_NAME,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'NOT_SET',
      sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'NOT_SET',
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 'NOT_SET',
      privateKeyLength: process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 
        process.env.GOOGLE_SHEETS_PRIVATE_KEY.length : 0
    }

    // Try to import GoogleSheetsService
    let serviceStatus = 'NOT_IMPORTED'
    try {
      const { GoogleSheetsService } = await import('@/lib/services/googleSheets')
      serviceStatus = 'IMPORTED_SUCCESSFULLY'
    } catch (importError) {
      serviceStatus = `IMPORT_FAILED: ${importError instanceof Error ? importError.message : 'Unknown error'}`
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription API debug info',
      environment: envCheck,
      serviceStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

