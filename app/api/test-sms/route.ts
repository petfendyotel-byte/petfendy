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
      
      case 'new-user':
        const testResult = await smsService.sendNewUserNotifications(
          name,
          'test@example.com',
          phone
        )
        result = testResult.userSMS && testResult.adminSMS
        message = `Yeni üye bildirimleri gönderildi - Kullanıcı: ${testResult.userSMS ? '✅' : '❌'}, Admin: ${testResult.adminSMS ? '✅' : '❌'}`
        testData = { userSMS: testResult.userSMS, adminSMS: testResult.adminSMS }
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
      
      case 'new-booking':
        const bookingResult = await smsService.sendNewBookingNotifications(
          'hotel',
          name,
          phone,
          'Test Otel Rezervasyonu - 25 Ocak 2026, Saat: 14:00'
        )
        result = bookingResult.userSMS && bookingResult.adminSMS
        message = `Rezervasyon bildirimleri gönderildi - Kullanıcı: ${bookingResult.userSMS ? '✅' : '❌'}, Admin: ${bookingResult.adminSMS ? '✅' : '❌'}`
        testData = { userSMS: bookingResult.userSMS, adminSMS: bookingResult.adminSMS }
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz SMS türü. Geçerli türler: welcome, new-user, booking, new-booking' },
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
    message: 'Petfendy SMS Test API - Sadeleştirilmiş Versiyon',
    status: 'SMS servisi aktif (NetGSM XML API)',
    usage: {
      method: 'POST',
      endpoint: '/api/test-sms',
      body: {
        phone: '05321234567 (zorunlu)',
        type: 'welcome | new-user | booking | new-booking',
        name: 'Test Kullanıcı (opsiyonel)'
      }
    },
    smsTypes: {
      welcome: 'Sadece kullanıcıya hoş geldin SMS\'i',
      'new-user': 'Hem kullanıcıya hem admin\'e yeni üye bildirimi',
      booking: 'Sadece kullanıcıya rezervasyon onay SMS\'i',
      'new-booking': 'Hem kullanıcıya hem admin\'e rezervasyon bildirimi'
    },
    examples: [
      {
        description: 'Hoş geldin SMS\'i test et',
        body: { phone: '05321234567', type: 'welcome', name: 'Ahmet Yılmaz' }
      },
      {
        description: 'Yeni üye bildirimleri test et (kullanıcı + admin)',
        body: { phone: '05321234567', type: 'new-user', name: 'Ahmet Yılmaz' }
      },
      {
        description: 'Rezervasyon onay SMS\'i test et',
        body: { phone: '05321234567', type: 'booking' }
      },
      {
        description: 'Rezervasyon bildirimleri test et (kullanıcı + admin)',
        body: { phone: '05321234567', type: 'new-booking', name: 'Ahmet Yılmaz' }
      }
    ],
    adminPhone: process.env.ADMIN_PHONE || 'Tanımlı değil',
    netgsmInfo: {
      altKullanici: 'bilge.corumlu@gmail.com',
      apiYetkilisi: 'BİLGE GÜLER (petfendyotel@gmail.com)',
      gondericiAdi: 'PETFENDY',
      apiEndpoint: 'https://api.netgsm.com.tr/sms/send/xml',
      encoding: 'TR (Türkçe karakter desteği)',
      kullanim: 'Sadece yeni üyelik ve rezervasyon bildirimleri',
      iysUyumluluk: {
        ticariSMS: 'Kullanıcılara gönderilen SMS\'ler (İYS kontrollü)',
        bilgilendirmeSMS: 'Admin\'e gönderilen SMS\'ler (İYS kontrolsüz)'
      }
    }
  })
}