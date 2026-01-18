import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/lib/sms-service'

export async function POST(request: NextRequest) {
  try {
    const { phone, type = 'welcome', name = 'Test Kullanıcı' } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Telefon numarası gerekli' },
        { status: 400 }
      )
    }

    let result = false
    let message = ''

    switch (type) {
      case 'welcome':
        result = await smsService.sendWelcomeSMS(phone, name)
        message = 'Hoş geldin SMS\'i gönderildi'
        break
      
      case 'verification':
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        result = await smsService.sendVerificationCodeSMS(phone, code)
        message = `Doğrulama kodu SMS\'i gönderildi: ${code}`
        break
      
      case 'booking':
        result = await smsService.sendBookingConfirmationSMS(
          phone, 
          'hotel', 
          'Test Otel Rezervasyonu - 25 Ocak 2026'
        )
        message = 'Rezervasyon onay SMS\'i gönderildi'
        break
      
      case 'payment':
        result = await smsService.sendPaymentSuccessSMS(
          phone, 
          '150', 
          'hotel', 
          'TEST123'
        )
        message = 'Ödeme başarılı SMS\'i gönderildi'
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz SMS türü' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result,
      message: result ? message : 'SMS gönderilemedi',
      phone,
      type
    })

  } catch (error) {
    console.error('SMS Test Error:', error)
    return NextResponse.json(
      { success: false, error: 'SMS test hatası' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SMS Test API',
    usage: {
      method: 'POST',
      body: {
        phone: '05321234567',
        type: 'welcome | verification | booking | payment',
        name: 'Test Kullanıcı (opsiyonel)'
      }
    },
    examples: [
      {
        description: 'Hoş geldin SMS\'i test et',
        body: { phone: '05321234567', type: 'welcome', name: 'Ahmet Yılmaz' }
      },
      {
        description: 'Doğrulama kodu SMS\'i test et',
        body: { phone: '05321234567', type: 'verification' }
      },
      {
        description: 'Rezervasyon onay SMS\'i test et',
        body: { phone: '05321234567', type: 'booking' }
      },
      {
        description: 'Ödeme başarılı SMS\'i test et',
        body: { phone: '05321234567', type: 'payment' }
      }
    ]
  })
}