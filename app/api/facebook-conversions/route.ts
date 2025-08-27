import { NextRequest, NextResponse } from 'next/server'
import { createFacebookConversionsAPI } from '@/lib/services/facebookConversions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, eventData } = body

    const facebookAPI = createFacebookConversionsAPI()

    let result

    switch (eventType) {
      case 'purchase':
        result = await facebookAPI.trackPurchase(eventData)
        break
      case 'lead':
        result = await facebookAPI.trackLead(eventData)
        break
      case 'custom':
        result = await facebookAPI.trackCustomEvent(eventData)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid event type. Must be purchase, lead, or custom' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Facebook conversion API error:', error)
    return NextResponse.json(
      { error: 'Failed to send Facebook conversion event' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Facebook Conversions API endpoint' })
}
