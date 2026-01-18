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

      console.log(`📱 [NetGSM] Sending SMS to ${to}, Commercial: ${isCommercial}`)

      const response = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/xml',
          'User-Agent': 'PETFENDY-SMS-Service/1.0'
        },
        body: xmlBody
      })

      const result = await response.text()
      console.log(`📱 [NetGSM] Response: ${result}`)
      
      // NetGSM başarı kodları ve jobid kontrolü
      if (result.startsWith('00') || result.startsWith('01') || result.startsWith('02') || /^\d{17,}$/.test(result)) {
        console.log(`✅ [NetGSM] SMS sent successfully to ${to}. JobID: ${result}`)
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

  // Yeni üyelik bildirimi - Kullanıcıya (Bilgilendirme)
  async sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
    const message = `Merhaba ${name}! Petfendy'ye hoş geldiniz 🐾 Evcil dostlarınız için en iyi hizmeti sunmak için buradayız. Sorularınız için: 0532 307 32 64`
    return this.sendSMS({ to: phone, message }, false) // Bilgilendirme SMS'i
  }

  // Yeni üyelik bildirimi - İşletme sahibine (Bilgilendirme)
  async sendNewUserNotificationSMS(
    ownerPhone: string,
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<boolean> {
    const message = `🆕 Yeni Üye! Ad: ${userName}, Tel: ${userPhone}, E-posta: ${userEmail} - Petfendy`
    return this.sendSMS({ to: ownerPhone, message }, false) // Bilgilendirme SMS'i
  }

  // Doğrulama kodu SMS (Bilgilendirme)
  async sendVerificationCodeSMS(phone: string, code: string): Promise<boolean> {
    const message = `Petfendy doğrulama kodunuz: ${code}. Bu kod 15 dakika geçerlidir.`
    return this.sendSMS({ to: phone, message }, false) // Bilgilendirme SMS'i
  }

  // Rezervasyon onay SMS - Kullanıcıya (Bilgilendirme)
  async sendBookingConfirmationSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi',
    details: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const message = `✅ ${typeText} rezervasyonunuz onaylandı! ${details} - Petfendy`
    return this.sendSMS({ to: phone, message }, false) // Bilgilendirme SMS'i
  }

  // Rezervasyon bildirimi - İşletme sahibine (Bilgilendirme)
  async sendNewBookingNotificationSMS(
    ownerPhone: string,
    bookingType: 'hotel' | 'taxi',
    customerName: string,
    customerPhone: string,
    details: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Otel' : 'Taksi'
    const message = `🔔 Yeni ${typeText} Rezervasyonu! Müşteri: ${customerName} (${customerPhone}). ${details}`
    return this.sendSMS({ to: ownerPhone, message }, false) // Bilgilendirme SMS'i
  }

  // =============================================
  // ÖDEME BİLDİRİMLERİ
  // =============================================

  // Ödeme başarılı - Müşteriye
  async sendPaymentSuccessSMS(
    phone: string,
    amount: string,
    bookingType: 'hotel' | 'taxi',
    bookingRef: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const message = `✅ Ödemeniz alındı! ${typeText} - ${amount} TL. Ref: ${bookingRef}. Detaylar için: petfendy.com - Petfendy`
    return this.sendSMS({ to: phone, message })
  }

  // Ödeme başarılı - İşletme sahibine
  async sendPaymentReceivedNotificationSMS(
    ownerPhone: string,
    customerName: string,
    amount: string,
    bookingType: 'hotel' | 'taxi',
    bookingRef: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Otel' : 'Taksi'
    const message = `💰 Ödeme Alındı! ${typeText} - ${amount} TL. Müşteri: ${customerName}. Ref: ${bookingRef}`
    return this.sendSMS({ to: ownerPhone, message })
  }

  // Ödeme başarısız - Müşteriye
  async sendPaymentFailedSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi'
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const message = `❌ ${typeText} ödemeniz başarısız oldu. Lütfen tekrar deneyin veya farklı bir kart kullanın. Destek: 0532 307 32 64 - Petfendy`
    return this.sendSMS({ to: phone, message })
  }

  // Rezervasyon hatırlatma - Müşteriye (Bilgilendirme)
  async sendBookingReminderSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi',
    date: string,
    time: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const message = `⏰ Hatırlatma: ${typeText} rezervasyonunuz yarın ${date} saat ${time}'de. Sorularınız için: 0532 307 32 64 - Petfendy`
    return this.sendSMS({ to: phone, message }, false) // Bilgilendirme SMS'i
  }

  // İptal bildirimi - Müşteriye
  async sendBookingCancelledSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi',
    refundAmount?: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const refundText = refundAmount ? ` ${refundAmount} TL iade edilecektir.` : ''
    const message = `🚫 ${typeText} rezervasyonunuz iptal edildi.${refundText} Sorularınız için: 0532 307 32 64 - Petfendy`
    return this.sendSMS({ to: phone, message })
  }

  // İade bildirimi - Müşteriye
  async sendRefundProcessedSMS(
    phone: string,
    amount: string,
    bookingRef: string
  ): Promise<boolean> {
    const message = `💳 İadeniz işleme alındı! ${amount} TL, 7-14 iş günü içinde kartınıza yansıyacaktır. Ref: ${bookingRef} - Petfendy`
    return this.sendSMS({ to: phone, message })
  }
}

export const smsService = new SMSService()

// Environment'tan otomatik yapılandırma
export function initSMSService(): void {
  const provider = process.env.SMS_PROVIDER as 'netgsm' | 'twilio' | 'mock' || 'mock'
  
  if (provider === 'netgsm') {
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
