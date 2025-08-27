import { NextResponse } from 'next/server'

export async function GET() {
  const facebookAccessToken = process.env.FACEBOOK_ACCESS_TOKEN
  const facebookPixelId = process.env.FACEBOOK_PIXEL_ID
  
  return NextResponse.json({
    success: true,
    message: 'Facebook environment variables check',
    facebook: {
      accessToken: facebookAccessToken ? `${facebookAccessToken.substring(0, 20)}...` : 'NOT_SET',
      accessTokenLength: facebookAccessToken?.length || 0,
      pixelId: facebookPixelId || 'NOT_SET',
      hasAccessToken: !!facebookAccessToken,
      hasPixelId: !!facebookPixelId
    },
    allEnvVars: Object.keys(process.env).filter(key => key.includes('FACEBOOK')),
    timestamp: new Date().toISOString()
  })
}
