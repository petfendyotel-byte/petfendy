// Mock SendGrid Email Service
// In production, replace with actual SendGrid API integration

import type { EmailServiceConfig } from './types'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface InvoiceEmailData {
  customerName: string
  customerEmail: string
  invoiceNumber: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  pdfUrl?: string
}

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  bookingType: "hotel" | "taxi"
  bookingDetails: string
  bookingDate: Date
  totalAmount: number
}

class EmailService {
  private config: EmailServiceConfig | null = null

  configure(config: EmailServiceConfig): void {
    this.config = config
  }

  private async sendWithProvider(
    provider: EmailServiceConfig['provider'],
    apiKey: string,
    fromEmail: string,
    fromName: string,
    template: EmailTemplate
  ): Promise<boolean> {
    // Mock email sending (placeholders for real SDKs)
    console.log(`📧 [Email Service] Sending via ${provider}...`)
    console.log("From:", fromName, `<${fromEmail}>`)
    console.log("To:", template.to)
    console.log("Subject:", template.subject)
    console.log("Content:", template.text || template.html)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock success
    return !!apiKey
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    // Eğer konfigürasyon yapılmadıysa mock değerlerle devam et
    if (!this.config) {
      return this.sendWithProvider(
        'sendgrid',
        process.env.SENDGRID_API_KEY || 'mock_sendgrid_key',
        'noreply@petfendy.com',
        'Petfendy',
        template
      )
    }

    const primaryOk = await this.sendWithProvider(
      this.config.provider,
      this.config.primaryApiKey,
      this.config.primaryFromEmail,
      this.config.primaryFromName,
      template
    )

    if (primaryOk) return true

    // Fallback dene
    if (this.config.fallbackProvider && this.config.fallbackApiKey && this.config.fallbackFromEmail && this.config.fallbackFromName) {
      console.log('[Email Service] Primary failed, trying fallback...')
      return this.sendWithProvider(
        this.config.fallbackProvider,
        this.config.fallbackApiKey,
        this.config.fallbackFromEmail,
        this.config.fallbackFromName,
        template
      )
    }

    return false
  }

  async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .invoice-table th, .invoice-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { font-size: 18px; font-weight: bold; color: #4F46E5; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Petfendy</h1>
            <p>Evcil Hayvan Hizmetleri</p>
          </div>
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            <p>Siparişiniz başarıyla tamamlandı. Fatura detaylarınız aşağıdadır:</p>
            
            <p><strong>Fatura No:</strong> ${data.invoiceNumber}</p>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Ürün/Hizmet</th>
                  <th>Miktar</th>
                  <th>Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${data.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₺${item.price.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <p class="total">Toplam Tutar: ₺${data.totalAmount.toFixed(2)}</p>
            
            ${data.pdfUrl ? `<p><a href="${data.pdfUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Faturayı İndir</a></p>` : ""}
            
            <p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
          </div>
          <div class="footer">
            <p>© 2025 Petfendy. Tüm hakları saklıdır.</p>
            <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Merhaba ${data.customerName},

Siparişiniz başarıyla tamamlandı.

Fatura No: ${data.invoiceNumber}
Toplam Tutar: ₺${data.totalAmount.toFixed(2)}

Ürünler:
${data.items.map((item) => `- ${item.name} (x${item.quantity}): ₺${item.price.toFixed(2)}`).join("\n")}

Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.

Teşekkürler,
Petfendy Ekibi
    `

    return this.sendEmail({
      to: data.customerEmail,
      subject: `Petfendy Faturası - ${data.invoiceNumber}`,
      html: htmlContent,
      text: textContent,
    })
  }

  async sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Petfendy</h1>
            <p>Rezervasyon Onayı</p>
          </div>
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            <p>Rezervasyonunuz başarıyla oluşturuldu!</p>
            
            <div class="booking-details">
              <p><strong>Rezervasyon Türü:</strong> ${data.bookingType === "hotel" ? "Pet Otel" : "Hayvan Taksi"}</p>
              <p><strong>Tarih:</strong> ${data.bookingDate.toLocaleString("tr-TR")}</p>
              <p><strong>Detaylar:</strong> ${data.bookingDetails}</p>
              <p><strong>Toplam Tutar:</strong> ₺${data.totalAmount.toFixed(2)}</p>
            </div>
            
            <p>Rezervasyonunuzla ilgili herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
            <p>İyi günler dileriz! 🐕🐈</p>
          </div>
          <div class="footer">
            <p>© 2025 Petfendy. Tüm hakları saklıdır.</p>
            <p>İletişim: info@petfendy.com | +90 555 123 4567</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Merhaba ${data.customerName},

Rezervasyonunuz başarıyla oluşturuldu!

Rezervasyon Türü: ${data.bookingType === "hotel" ? "Pet Otel" : "Hayvan Taksi"}
Tarih: ${data.bookingDate.toLocaleString("tr-TR")}
Detaylar: ${data.bookingDetails}
Toplam Tutar: ₺${data.totalAmount.toFixed(2)}

İyi günler dileriz!

Petfendy Ekibi
    `

    return this.sendEmail({
      to: data.customerEmail,
      subject: "Petfendy Rezervasyon Onayı",
      html: htmlContent,
      text: textContent,
    })
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `https://petfendy.com/reset-password?token=${resetToken}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Şifre Sıfırlama</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Şifreyi Sıfırla</a>
          <p style="margin-top: 20px;">Bu bağlantı 1 saat geçerlidir.</p>
          <p>Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: "Petfendy - Şifre Sıfırlama",
      html: htmlContent,
      text: `Şifrenizi sıfırlamak için: ${resetUrl}`,
    })
  }

  async sendVerificationEmail(email: string, verificationCode: string, name: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .code { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Petfendy</h1>
            <p>E-posta Doğrulama</p>
          </div>
          <div class="content">
            <h2>Merhaba ${name},</h2>
            <p>Petfendy'ye hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki doğrulama kodunu kullanın:</p>
            
            <div class="code">${verificationCode}</div>
            
            <p>Bu kod 15 dakika geçerlidir.</p>
            <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          </div>
          <div class="footer">
            <p>© 2025 Petfendy. Tüm hakları saklıdır.</p>
            <p>İletişim: info@petfendy.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Merhaba ${name},

Petfendy'ye hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki doğrulama kodunu kullanın:

Doğrulama Kodu: ${verificationCode}

Bu kod 15 dakika geçerlidir.

Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.

Petfendy Ekibi
    `

    return this.sendEmail({
      to: email,
      subject: "Petfendy - E-posta Doğrulama",
      html: htmlContent,
      text: textContent,
    })
  }

  async sendContactFormEmail(data: {
    name: string
    email: string
    phone: string
    message: string
  }): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #F97316 100%); color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; margin-top: 20px; }
          .info-row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #8B5CF6; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Yeni İletişim Mesajı</h1>
            <p>Petfendy İletişim Formu</p>
          </div>
          <div class="content">
            <div class="info-row">
              <div class="label">Gönderen:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="info-row">
              <div class="label">E-posta:</div>
              <div class="value">${data.email}</div>
            </div>
            <div class="info-row">
              <div class="label">Telefon:</div>
              <div class="value">${data.phone || 'Belirtilmedi'}</div>
            </div>
            <div class="info-row">
              <div class="label">Mesaj:</div>
              <div class="message-box">${data.message}</div>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              Bu mesaj ${new Date().toLocaleString('tr-TR')} tarihinde gönderildi.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Yeni İletişim Mesajı - Petfendy

Gönderen: ${data.name}
E-posta: ${data.email}
Telefon: ${data.phone || 'Belirtilmedi'}

Mesaj:
${data.message}

---
Bu mesaj ${new Date().toLocaleString('tr-TR')} tarihinde gönderildi.
    `

    return this.sendEmail({
      to: "petfendyotel@gmail.com",
      subject: `Yeni İletişim Mesajı - ${data.name}`,
      html: htmlContent,
      text: textContent,
    })
  }
}

  // Yeni üyelik bildirimi - Kullanıcıya hoş geldin e-postası
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F97316 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .welcome-box { background: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .features { display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0; }
          .feature { background: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 150px; text-align: center; }
          .feature-icon { font-size: 32px; margin-bottom: 10px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #F97316 0%, #EC4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Petfendy'ye Hoş Geldiniz!</h1>
            <p>Evcil dostlarınız için en iyi hizmet</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Merhaba ${name}! 👋</h2>
              <p>Petfendy ailesine katıldığınız için çok mutluyuz!</p>
              <p>Artık evcil hayvanlarınız için en kaliteli otel ve taksi hizmetlerine erişebilirsiniz.</p>
            </div>
            
            <h3>Hizmetlerimiz:</h3>
            <div class="features">
              <div class="feature">
                <div class="feature-icon">🏨</div>
                <strong>Pet Otel</strong>
                <p>Konforlu konaklama</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🚕</div>
                <strong>Pet Taksi</strong>
                <p>Güvenli ulaşım</p>
              </div>
              <div class="feature">
                <div class="feature-icon">✂️</div>
                <strong>Bakım</strong>
                <p>Profesyonel bakım</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://petfendy.46.62.236.59.sslip.io/tr/home" class="cta-button">Hemen Rezervasyon Yap</a>
            </div>
            
            <p style="margin-top: 30px;">Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
            <p>Sevgilerle,<br><strong>Petfendy Ekibi</strong> 🐕🐈</p>
          </div>
          <div class="footer">
            <p>© 2025 Petfendy. Tüm hakları saklıdır.</p>
            <p>İletişim: petfendyotel@gmail.com | +90 555 123 4567</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Merhaba ${name}!

Petfendy ailesine hoş geldiniz! 🐾

Artık evcil hayvanlarınız için en kaliteli otel ve taksi hizmetlerine erişebilirsiniz.

Hizmetlerimiz:
- Pet Otel: Konforlu konaklama
- Pet Taksi: Güvenli ulaşım
- Bakım: Profesyonel bakım hizmetleri

Hemen rezervasyon yapmak için: https://petfendy.46.62.236.59.sslip.io/tr/home

Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.

Sevgilerle,
Petfendy Ekibi
    `

    return this.sendEmail({
      to: email,
      subject: "🐾 Petfendy'ye Hoş Geldiniz!",
      html: htmlContent,
      text: textContent,
    })
  }

  // Yeni üyelik bildirimi - İşletme sahibine
  async sendNewUserNotificationToOwner(
    ownerEmail: string,
    userName: string,
    userEmail: string,
    userPhone: string
  ): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .user-card { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { color: #666; }
          .info-value { font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 Yeni Üye Kaydı!</h1>
            <p>Petfendy'ye yeni bir kullanıcı katıldı</p>
          </div>
          <div class="content">
            <p>Merhaba,</p>
            <p>Sisteme yeni bir kullanıcı kaydoldu. Detaylar aşağıdadır:</p>
            
            <div class="user-card">
              <div class="info-row">
                <span class="info-label">👤 Ad Soyad:</span>
                <span class="info-value">${userName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📧 E-posta:</span>
                <span class="info-value">${userEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📱 Telefon:</span>
                <span class="info-value">${userPhone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Kayıt Tarihi:</span>
                <span class="info-value">${new Date().toLocaleString('tr-TR')}</span>
              </div>
            </div>
            
            <p>Admin panelinden kullanıcı detaylarını görüntüleyebilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu bildirim otomatik olarak gönderilmiştir.</p>
            <p>© 2025 Petfendy</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Yeni Üye Kaydı - Petfendy

Sisteme yeni bir kullanıcı kaydoldu:

Ad Soyad: ${userName}
E-posta: ${userEmail}
Telefon: ${userPhone}
Kayıt Tarihi: ${new Date().toLocaleString('tr-TR')}

Admin panelinden kullanıcı detaylarını görüntüleyebilirsiniz.
    `

    return this.sendEmail({
      to: ownerEmail,
      subject: `🆕 Yeni Üye: ${userName} - Petfendy`,
      html: htmlContent,
      text: textContent,
    })
  }
}

export const emailService = new EmailService()


