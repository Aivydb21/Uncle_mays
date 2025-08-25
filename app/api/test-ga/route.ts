import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    
    if (!measurementId) {
      return NextResponse.json({
        success: false,
        message: 'Google Analytics not configured',
        error: 'NEXT_PUBLIC_GA_MEASUREMENT_ID is not set in environment variables'
      }, { status: 400 })
    }
    
    if (!measurementId.startsWith('G-')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Google Analytics ID format',
        error: 'Measurement ID should start with G-',
        currentValue: measurementId
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Analytics configuration looks good!',
      measurementId: measurementId,
      status: 'Ready to track',
      nextSteps: [
        'Visit your landing page to see GA tracking in action',
        'Check browser console for gtag messages',
        'Look for pageview events in your GA dashboard'
      ]
    })
    
  } catch (error) {
    console.error('Google Analytics test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error testing Google Analytics configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
