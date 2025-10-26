import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envVars = {
      GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'NOT_SET',
      GOOGLE_SHEETS_SHEET_NAME: process.env.GOOGLE_SHEETS_SHEET_NAME || 'NOT_SET',
      GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 'NOT_SET',
      GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 
        (process.env.GOOGLE_SHEETS_PRIVATE_KEY.length > 50 ? 
          `${process.env.GOOGLE_SHEETS_PRIVATE_KEY.substring(0, 50)}...` : 
          'TOO_SHORT') : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET'
    }

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      environment: envVars,
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

