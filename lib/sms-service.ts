// SMS Service for Petfendy
// Supports multiple SMS providers (NetGSM, Twilio, etc.)

export interface SMSConfig {
  provider: 'netgsm' | 'twilio' | 'mock'
  apiKey?: string
  apiSecret?: string
  username?: string
  password?: string
  sender?: string
}

export interface SMSMessage {
  to: string
  message: string
}

// SMS Rate Limiting - Prevent SMS bombing
const smsRateLimiter = new Map<string, { count: number; resetTime: number }>()

function checkSMSRateLimit(phone: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxSMS = 5 // 5 SMS per hour per phone number
  
  const record = smsRateLimiter.get(phone)
  
  // Clean up old entries periodically
  if (now % 10000 < 100) {
    for (const [key, value] of smsRateLimiter.entries()) {
      if (now > value.resetTime) {
        smsRateLimiter.delete(key)
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    smsRateLimiter.set(phone, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remaining: maxSMS - 1, resetMs: windowMs }
  }
  
  if (record.count >= maxSMS) {
    return { allowed: false, remaining: 0, resetMs: record.resetTime - now }
  }
  
  record.count++
  return { allowed: true, remaining: maxSMS - record.count, resetMs: record.resetTime - now }
}

class SMSService {
  private config: SMSConfig = { provider: 'mock' }

  configure(config: SMSConfig): void {
    this.config = config
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // Handle Turkish numbers
    if (cleaned.startsWith('0')) {
      cleaned = '90' + cleaned.substring(1)
    } else if (!cleaned.startsWith('90') && cleaned.length === 10) {
      cleaned = '90' + cleaned
    }
    
    return cleaned
  }

  private async sendWithNetGSM(to: string, message: string, isCommercial: boolean = false): Promise<boolean> {
    const { username, password, sender } = this.config
    
    if (!username || !password) {
      console.error('[NetGSM] Missing credentials')
      return false
    }

    try {
      // NetGSM XML API - Resmi dokümantasyona uygun
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
        <mainbody>
          <header>
            <company dession="1"/>
            <usercode>${username}</usercode>
            <password>${password}</password>
            <type>1:n</type>
            <msgheader>${sender || 'PETFENDY'}</msgheader>
            <encoding>TR</encoding>
            <iysfilter>${isCommercial ? '11' : '0'}</iysfilter>
            <appname>PETFENDY</appname>
          </header>
          <body>
            <msg><![CDATA[${message}]]></msg>
            <no>${to}</no>
          </body>
        </mainbody>`

      const response = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/xml',
          'User-Agent': 'PETFENDY-SMS-Service/1.0'
        },
        body: xmlBody
      })

      const result = await response.text()
      
      // NetGSM başarı kodları ve jobid kontrolü
      if (result.startsWith('00') || result.startsWith('01') || result.startsWith('02') || /^\d{17,}$/.test(result)) {
        console.log(`✅ [NetGSM] SMS sent successfully to ${to}`)
        return true
      } else {
        // Hata kodları açıklaması
        const errorMessages: { [key: string]: string } = {
          '20': 'Mesaj metni problemi veya karakter sınırı aşımı',
          '30': 'Geçersiz kullanıcı adı/şifre veya API erişim izni yok',
          '40': 'Mesaj başlığı (gönderici adı) sistemde tanımlı değil',
          '50': 'İYS kontrollü gönderim yapılamıyor',
          '51': 'İYS Marka bilgisi bulunamadı',
          '70': 'Hatalı parametre veya eksik zorunlu alan',
          '80': 'Gönderim sınır aşımı',
          '85': 'Mükerrer gönderim sınır aşımı'
        }
        
        const errorCode = result.trim()
        const errorMessage = errorMessages[errorCode] || `Bilinmeyen hata: ${result}`
        console.error(`❌ [NetGSM] Error ${errorCode}: ${errorMessage}`)
        
        return false
      }
    } catch (error) {
      console.error('[NetGSM] API Error:', error)
      return false
    }
  }

  private async sendWithTwilio(to: string, message: string): Promise<boolean> {
    // Twilio API integration placeholder
    console.log(`📱 [Twilio] Sending SMS to ${to}`)
    console.log(`Message: ${message}`)
    
    // In production, use actual Twilio API
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
  }

  private async sendMock(to: string, message: string): Promise<boolean> {
    console.log(`📱 [Mock SMS] To: ${to}`)
    console.log(`Message: ${message}`)
    await new Promise(resolve => setTimeout(resolve, 200))
    return true
  }

  async sendSMS(data: SMSMessage, isCommercial: boolean = false): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(data.to)
    
    // SMS Rate Limiting Check - Prevent SMS bombing
    const rateLimitCheck = checkSMSRateLimit(formattedPhone)
    if (!rateLimitCheck.allowed) {
      console.warn(`🚫 [SMS] Rate limit exceeded for ${formattedPhone}. Remaining: ${rateLimitCheck.remaining}, Reset in: ${Math.ceil(rateLimitCheck.resetMs / 1000 / 60)} minutes`)
      return false
    }
    
    console.log(`📱 [SMS] Rate limit OK for ${formattedPhone}. Remaining: ${rateLimitCheck.remaining}`)
    
    try {
      switch (this.config.provider) {
        case 'netgsm':
          return await this.sendWithNetGSM(formattedPhone, data.message, isCommercial)
        case 'twilio':
          return await this.sendWithTwilio(formattedPhone, data.message)
        default:
          return await this.sendMock(formattedPhone, data.message)
      }
    } catch (error) {
      console.error('[SMS Service] Error:', error)
      return false
    }
  }

  // ==============================================
  // PETFENDY SMS BİLDİRİMLERİ - SADECE 2 DURUM
  // ==============================================

  // 1. YENİ ÜYELİK BİLDİRİMLERİ
  // Yeni üye olan kullanıcıya hoş geldin SMS'i (Ticari - İYS Kontrollü)
  async sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
    const message = `Merhaba ${name}! Petfendy'ye hoş geldiniz 🐾 Evcil dostlarınız için en iyi hizmeti sunmak için buradayız. Sorularınız için: 0532 307 32 64`
    return this.sendSMS({ to: phone, message }, true) // Ticari SMS - İYS kontrollü
  }

  // Yeni üye bildirimi - Admin'e (Bilgilendirme)
  async sendNewUserNotificationToAdmin(
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<boolean> {
    const adminPhone = process.env.ADMIN_PHONE
    if (!adminPhone) {
      console.error('[SMS] Admin telefon numarası tanımlı değil (ADMIN_PHONE)')
      return false
    }

    const message = `🆕 Yeni Üye! Ad: ${userName}, Tel: ${userPhone}, E-posta: ${userEmail} - Petfendy`
    return this.sendSMS({ to: adminPhone, message }, false) // Admin bildirimi
  }

  // 2. REZERVASYON BİLDİRİMLERİ
  // Rezervasyon onay SMS'i - Kullanıcıya (Ticari - İYS Kontrollü)
  async sendBookingConfirmationSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi' | 'daycare',
    details: string
  ): Promise<boolean> {
    let message = ''
    
    switch (bookingType) {
      case 'hotel':
        message = `✅ Pet Otel rezervasyonunuz onaylandı! ${details} Bu tarihler arasında rezervasyonunuz yapıldı. Sorularınız için: 0532 307 32 64 - Petfendy`
        break
      case 'daycare':
        message = `✅ Pet Kreş kaydınız yapıldı! ${details} Sorularınız için: 0532 307 32 64 - Petfendy`
        break
      case 'taxi':
        message = `✅ Pet Taksi rezervasyonunuz yapıldı! ${details} Sorularınız için: 0532 307 32 64 - Petfendy`
        break
    }
    
    return this.sendSMS({ to: phone, message }, true) // Ticari SMS - İYS kontrollü
  }

  // Yeni rezervasyon bildirimi - Admin'e (Bilgilendirme)
  async sendNewBookingNotificationToAdmin(
    bookingType: 'hotel' | 'taxi' | 'daycare',
    customerName: string,
    customerPhone: string,
    details: string
  ): Promise<boolean> {
    const adminPhone = process.env.ADMIN_PHONE
    if (!adminPhone) {
      console.error('[SMS] Admin telefon numarası tanımlı değil (ADMIN_PHONE)')
      return false
    }

    let message = ''
    
    switch (bookingType) {
      case 'hotel':
        message = `🔔 Yeni Pet Otel Rezervasyonu! Müşteri: ${customerName} (${customerPhone}). ${details}`
        break
      case 'daycare':
        message = `🔔 Yeni Pet Kreş Kaydı! Müşteri: ${customerName} (${customerPhone}). ${details}`
        break
      case 'taxi':
        message = `🔔 Yeni Pet Taksi Rezervasyonu! Müşteri: ${customerName} (${customerPhone}). ${details}`
        break
    }
    
    return this.sendSMS({ to: adminPhone, message }, false) // Admin bildirimi
  }

  // ==============================================
  // TOPLU BİLDİRİM FONKSİYONLARI
  // ==============================================

  // Yeni üyelik - Hem kullanıcıya hem admin'e bildirim gönder
  async sendNewUserNotifications(
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<{ userSMS: boolean; adminSMS: boolean }> {
    const userSMS = await this.sendWelcomeSMS(userPhone, userName)
    const adminSMS = await this.sendNewUserNotificationToAdmin(userName, userEmail, userPhone)
    
    console.log(`📱 [SMS] Yeni üye bildirimleri - Kullanıcı: ${userSMS ? '✅' : '❌'}, Admin: ${adminSMS ? '✅' : '❌'}`)
    
    return { userSMS, adminSMS }
  }

  // Test için bilgilendirme SMS'i (İYS kontrolsüz)
  async sendTestInformationalSMS(phone: string): Promise<boolean> {
    const message = `Petfendy test mesajı. Bu bir bilgilendirme SMS'idir. Test: ${new Date().toLocaleTimeString('tr-TR')}`
    return this.sendSMS({ to: phone, message }, false) // Bilgilendirme - İYS kontrolsüz
  }

  // Yeni rezervasyon - Hem kullanıcıya hem admin'e bildirim gönder
  async sendNewBookingNotifications(
    bookingType: 'hotel' | 'taxi' | 'daycare',
    customerName: string,
    customerPhone: string,
    details: string
  ): Promise<{ userSMS: boolean; adminSMS: boolean }> {
    const userSMS = await this.sendBookingConfirmationSMS(customerPhone, bookingType, details)
    const adminSMS = await this.sendNewBookingNotificationToAdmin(bookingType, customerName, customerPhone, details)
    
    console.log(`📱 [SMS] Rezervasyon bildirimleri - Kullanıcı: ${userSMS ? '✅' : '❌'}, Admin: ${adminSMS ? '✅' : '❌'}`)
    
    return { userSMS, adminSMS }
  }

}

export const smsService = new SMSService()

// Environment'tan otomatik yapılandırma
export function initSMSService(): void {
  const provider = process.env.SMS_PROVIDER as 'netgsm' | 'twilio' | 'mock' || 'mock'
  
  // TEMPORARY: Force mock mode for testing until NetGSM issues are resolved
  const forceMockMode = process.env.SMS_FORCE_MOCK === 'true'
  
  if (forceMockMode) {
    smsService.configure({ provider: 'mock' })
    console.log('📱 SMS Service: FORCED Mock mode (SMS_FORCE_MOCK=true)')
  } else if (provider === 'netgsm') {
    smsService.configure({
      provider: 'netgsm',
      username: process.env.NETGSM_USERNAME,
      password: process.env.NETGSM_PASSWORD,
      sender: process.env.NETGSM_SENDER || 'PETFENDY'
    })
    console.log('📱 SMS Service: NetGSM configured with username:', process.env.NETGSM_USERNAME)
  } else if (provider === 'twilio') {
    smsService.configure({
      provider: 'twilio',
      apiKey: process.env.TWILIO_ACCOUNT_SID,
      apiSecret: process.env.TWILIO_AUTH_TOKEN,
      sender: process.env.TWILIO_PHONE_NUMBER
    })
    console.log('📱 SMS Service: Twilio configured')
  } else {
    smsService.configure({ provider: 'mock' })
    console.log('📱 SMS Service: Mock mode (no real SMS will be sent)')
  }
}

// Server-side'da otomatik başlat
if (typeof window === 'undefined') {
  initSMSService()
}
