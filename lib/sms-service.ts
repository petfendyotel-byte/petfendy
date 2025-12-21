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

  private async sendWithNetGSM(to: string, message: string): Promise<boolean> {
    // NetGSM API integration placeholder
    console.log(`📱 [NetGSM] Sending SMS to ${to}`)
    console.log(`Message: ${message}`)
    
    // In production, use actual NetGSM API:
    // const response = await fetch('https://api.netgsm.com.tr/sms/send/get', {
    //   method: 'POST',
    //   body: new URLSearchParams({
    //     usercode: this.config.username!,
    //     password: this.config.password!,
    //     gsmno: to,
    //     message: message,
    //     msgheader: this.config.sender || 'PETFENDY'
    //   })
    // })
    
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
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

  async sendSMS(data: SMSMessage): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(data.to)
    
    try {
      switch (this.config.provider) {
        case 'netgsm':
          return await this.sendWithNetGSM(formattedPhone, data.message)
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

  // Yeni üyelik bildirimi - Kullanıcıya
  async sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
    const message = `Merhaba ${name}! Petfendy'ye hoş geldiniz 🐾 Evcil dostlarınız için en iyi hizmeti sunmak için buradayız. Sorularınız için: 0850 XXX XX XX`
    return this.sendSMS({ to: phone, message })
  }

  // Yeni üyelik bildirimi - İşletme sahibine
  async sendNewUserNotificationSMS(
    ownerPhone: string,
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<boolean> {
    const message = `🆕 Yeni Üye! Ad: ${userName}, Tel: ${userPhone}, E-posta: ${userEmail} - Petfendy`
    return this.sendSMS({ to: ownerPhone, message })
  }

  // Doğrulama kodu SMS
  async sendVerificationCodeSMS(phone: string, code: string): Promise<boolean> {
    const message = `Petfendy doğrulama kodunuz: ${code}. Bu kod 15 dakika geçerlidir.`
    return this.sendSMS({ to: phone, message })
  }

  // Rezervasyon onay SMS - Kullanıcıya
  async sendBookingConfirmationSMS(
    phone: string,
    bookingType: 'hotel' | 'taxi',
    details: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Pet Otel' : 'Pet Taksi'
    const message = `✅ ${typeText} rezervasyonunuz onaylandı! ${details} - Petfendy`
    return this.sendSMS({ to: phone, message })
  }

  // Rezervasyon bildirimi - İşletme sahibine
  async sendNewBookingNotificationSMS(
    ownerPhone: string,
    bookingType: 'hotel' | 'taxi',
    customerName: string,
    customerPhone: string,
    details: string
  ): Promise<boolean> {
    const typeText = bookingType === 'hotel' ? 'Otel' : 'Taksi'
    const message = `🔔 Yeni ${typeText} Rezervasyonu! Müşteri: ${customerName} (${customerPhone}). ${details}`
    return this.sendSMS({ to: ownerPhone, message })
  }
}

export const smsService = new SMSService()
