import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_TABLE_NAME

    if (!apiKey || !baseId || !tableName) {
      return NextResponse.json({
        success: false,
        message: 'Missing environment variables',
        hasApiKey: !!apiKey,
        hasBaseId: !!baseId,
        hasTableName: !!tableName
      }, { status: 400 })
    }

    // Test basic connection
    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to list tables (basic read permission)
    const tables = await base.tables()
    
    return NextResponse.json({
      success: true,
      message: 'Basic Airtable connection successful!',
      baseId: baseId,
      tableName: tableName,
      tablesFound: tables.length,
      permissions: 'Read access confirmed'
    })
    
  } catch (error: any) {
    console.error('Airtable permissions test error:', error)
    
    let errorType = 'Unknown'
    let suggestion = 'Check your Airtable configuration'
    
    if (error.error === 'NOT_AUTHORIZED') {
      errorType = 'Permission Denied'
      suggestion = 'Create new API key with read/write permissions'
    } else if (error.error === 'NOT_FOUND') {
      errorType = 'Base/Table Not Found'
      suggestion = 'Check base ID and table name'
    } else if (error.error === 'INVALID_API_KEY') {
      errorType = 'Invalid API Key'
      suggestion = 'Check your API key format'
    }
    
    return NextResponse.json({
      success: false,
      message: 'Airtable permissions test failed',
      errorType: errorType,
      error: error.error,
      message: error.message,
      suggestion: suggestion
    }, { status: 500 })
  }
}
