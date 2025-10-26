import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      hasSheetName: !!process.env.GOOGLE_SHEETS_SHEET_NAME,
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY
    }
  })
}

