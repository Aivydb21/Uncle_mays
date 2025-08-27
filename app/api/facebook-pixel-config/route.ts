import { NextResponse } from 'next/server'

export async function GET() {
  const pixelId = process.env.FACEBOOK_PIXEL_ID
  
  if (!pixelId) {
    return NextResponse.json(
      { error: 'Facebook Pixel ID not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({ pixelId })
}
