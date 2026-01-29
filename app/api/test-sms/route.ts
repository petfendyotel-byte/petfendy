import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/lib/sms-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, type, name } = body

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'SMS type is required' }, { status: 400 })
    }

    let result: any = { success: false }

    switch (type) {
      case 'test':
        result.success = await smsService.sendTestInformationalSMS(phone)
        result.message = 'Test SMS sent'
        break

      case 'welcome':
        if (!name) {
          return NextResponse.json({ error: 'Name is required for welcome SMS' }, { status: 400 })
        }
        result.success = await smsService.sendWelcomeSMS(phone, name)
        result.message = 'Welcome SMS sent'
        break

      case 'new-user':
        if (!name) {
          return NextResponse.json({ error: 'Name is required for new user notifications' }, { status: 400 })
        }
        result = await smsService.sendNewUserNotifications(
          name,
          `${name.toLowerCase().replace(' ', '.')}@example.com`,
          phone
        )
        result.message = 'New user notifications sent'
        break

      case 'new-booking':
        if (!name) {
          return NextResponse.json({ error: 'Name is required for booking notifications' }, { status: 400 })
        }
        result = await smsService.sendNewBookingNotifications(
          'hotel',
          name,
          phone,
          'Pet Otel - 25 Ocak 2026, Saat: 14:00'
        )
        result.message = 'Hotel booking notifications sent'
        break

      case 'new-booking-daycare':
        if (!name) {
          return NextResponse.json({ error: 'Name is required for booking notifications' }, { status: 400 })
        }
        result = await smsService.sendNewBookingNotifications(
          'daycare',
          name,
          phone,
          'Pet Kreş - 25 Ocak 2026, Saat: 09:00'
        )
        result.message = 'Daycare booking notifications sent'
        break

      case 'new-booking-taxi':
        if (!name) {
          return NextResponse.json({ error: 'Name is required for booking notifications' }, { status: 400 })
        }
        result = await smsService.sendNewBookingNotifications(
          'taxi',
          name,
          phone,
          'Pet Taksi - 25 Ocak 2026, Saat: 15:30 - Kızılay → Çankaya'
        )
        result.message = 'Taxi booking notifications sent'
        break

      case 'booking':
        result.success = await smsService.sendBookingConfirmationSMS(
          phone,
          'hotel',
          'Pet Otel - 25 Ocak 2026, Saat: 14:00'
        )
        result.message = 'Hotel booking confirmation SMS sent'
        break

      case 'booking-daycare':
        result.success = await smsService.sendBookingConfirmationSMS(
          phone,
          'daycare',
          'Pet Kreş - 25 Ocak 2026, Saat: 09:00'
        )
        result.message = 'Daycare booking confirmation SMS sent'
        break

      case 'booking-taxi':
        result.success = await smsService.sendBookingConfirmationSMS(
          phone,
          'taxi',
          'Pet Taksi - 25 Ocak 2026, Saat: 15:30 - Kızılay → Çankaya'
        )
        result.message = 'Taxi booking confirmation SMS sent'
        break

      default:
        return NextResponse.json({ error: 'Invalid SMS type' }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success || (result.userSMS && result.adminSMS),
      message: result.message,
      details: result
    })

  } catch (error: any) {
    console.error('Test SMS error:', error)
    return NextResponse.json({ 
      error: 'SMS test failed',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'SMS Test API',
    usage: 'POST with { phone, type, name? }',
    types: [
      'test - Simple test SMS',
      'welcome - Welcome SMS (requires name)',
      'new-user - New user notifications (requires name)',
      'new-booking - Hotel booking notifications (requires name)',
      'new-booking-daycare - Daycare booking notifications (requires name)',
      'new-booking-taxi - Taxi booking notifications (requires name)',
      'booking - Hotel booking confirmation only',
      'booking-daycare - Daycare booking confirmation only',
      'booking-taxi - Taxi booking confirmation only'
    ],
    example: {
      phone: '05321234567',
      type: 'new-user',
      name: 'Ahmet Yılmaz'
    }
  })
}