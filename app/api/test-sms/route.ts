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

    console.log(`📱 [SMS Test] Testing ${type} SMS to ${phone}`)

    let result = false
    let message = ''
    let testData: any = {}

    switch (type) {
      case 'welcome':
        result = await smsService.sendWelcomeSMS(phone, name)
        message = 'Hoş geldin SMS\'i gönderildi'
        testData = { name }
        break
      
      case 'verification':
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        result = await smsService.sendVerificationCodeSMS(phone, code)
        message = `Doğrulama kodu SMS\'i gönderildi`
        testData = { code }
        break
      
      case 'booking':
        result = await smsService.sendBookingConfirmationSMS(
          phone, 
          'hotel', 
          'Test Otel Rezervasyonu - 25 Ocak 2026, Saat: 14:00'
        )
        message = 'Rezervasyon onay SMS\'i gönderildi'
        testData = { bookingType: 'hotel', details: 'Test Otel Rezervasyonu - 25 Ocak 2026, Saat: 14:00' }
        break
      
      case 'payment':
        result = await smsService.sendPaymentSuccessSMS(
          phone, 
          '150', 
          'hotel', 
          'TEST123456'
        )
        message = 'Ödeme başarılı SMS\'i gönderildi'
        testData = { amount: '150 TL', bookingRef: 'TEST123456' }
        break
      
      case 'reminder':
        result = await smsService.sendBookingReminderSMS(
          phone,
          'hotel',
          '26 Ocak 2026',
          '14:00'
        )
        message = 'Rezervasyon hatırlatma SMS\'i gönderildi'
        testData = { date: '26 Ocak 2026', time: '14:00' }
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz SMS türü. Geçerli türler: welcome, verification, booking, payment, reminder' },
          { status: 400 }
        )
    }

    const response = {
      success: result,
      message: result ? message : 'SMS gönderilemedi - NetGSM hata kodu console\'da görüntülenecek',
      phone,
      type,
      testData,
      timestamp: new Date().toISOString(),
      note: result ? 'SMS başarıyla gönderildi' : 'Hata detayları için server console\'unu kontrol edin'
    }

    console.log(`📱 [SMS Test] Result:`, response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('SMS Test Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'SMS test hatası',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NetGSM SMS Test API - Petfendy',
    status: 'SMS servisi aktif (NetGSM XML API)',
    usage: {
      method: 'POST',
      endpoint: '/api/test-sms',
      body: {
        phone: '05321234567 (zorunlu)',
        type: 'welcome | verification | booking | payment | reminder',
        name: 'Test Kullanıcı (opsiyonel, sadece welcome için)'
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
      },
      {
        description: 'Rezervasyon hatırlatma SMS\'i test et',
        body: { phone: '05321234567', type: 'reminder' }
      }
    ],
    netgsmInfo: {
      altKullanici: 'bilge.corumlu@gmail.com',
      apiYetkilisi: 'BİLGE GÜLER (petfendyotel@gmail.com)',
      gondericiAdi: 'PETFENDY',
      apiEndpoint: 'https://api.netgsm.com.tr/sms/send/xml',
      encoding: 'TR (Türkçe karakter desteği)',
      iysUyumluluk: {
        ticariSMS: 'iysfilter=11 (İYS kontrollü)',
        bilgilendirmeSMS: 'iysfilter=0 (İYS kontrolsüz)',
        uyari: 'Ticari SMS\'ler sadece İYS\'de kayıtlı numaralara gönderilir'
      }
    }
  })
}