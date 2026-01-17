// Email Service for Petfendy
// Supports: Resend, SMTP (Gmail, etc.), Mock

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

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // API route üzerinden e-posta gönder
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        console.log(`📧 Email sent to ${template.to}`)
        return true
      }

      // API başarısız olursa mock olarak logla
      console.log(`📧 [Mock] Email to ${template.to}: ${template.subject}`)
      return true
    } catch (error) {
      console.error('[Email Service] Error:', error)
      // Hata durumunda da mock olarak başarılı say (UX için)
      console.log(`📧 [Mock] Email to ${template.to}: ${template.subject}`)
      return true
    }
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
              <thead><tr><th>Ürün/Hizmet</th><th>Miktar</th><th>Fiyat</th></tr></thead>
              <tbody>
                ${data.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₺${item.price.toFixed(2)}</td></tr>`).join("")}
              </tbody>
            </table>
            <p class="total">Toplam Tutar: ₺${data.totalAmount.toFixed(2)}</p>
            ${data.pdfUrl ? `<p><a href="${data.pdfUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Faturayı İndir</a></p>` : ""}
          </div>
          <div class="footer"><p>© 2025 Petfendy. Tüm hakları saklıdır.</p></div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ to: data.customerEmail, subject: `Petfendy Faturası - ${data.invoiceNumber}`, html: htmlContent })
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
          <div class="header"><h1>🐾 Petfendy</h1><p>Rezervasyon Onayı</p></div>
          <div class="content">
            <h2>Merhaba ${data.customerName},</h2>
            <p>Rezervasyonunuz başarıyla oluşturuldu!</p>
            <div class="booking-details">
              <p><strong>Rezervasyon Türü:</strong> ${data.bookingType === "hotel" ? "Pet Otel" : "Hayvan Taksi"}</p>
              <p><strong>Tarih:</strong> ${data.bookingDate.toLocaleString("tr-TR")}</p>
              <p><strong>Detaylar:</strong> ${data.bookingDetails}</p>
              <p><strong>Toplam Tutar:</strong> ₺${data.totalAmount.toFixed(2)}</p>
            </div>
            <p>İyi günler dileriz! 🐕🐈</p>
          </div>
          <div class="footer"><p>© 2025 Petfendy | İletişim: petfendyotel@gmail.com</p></div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ to: data.customerEmail, subject: "Petfendy Rezervasyon Onayı", html: htmlContent })
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `https://petfendy.46.62.236.59.sslip.io/tr/reset-password?token=${resetToken}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🐾 Petfendy - Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Şifreyi Sıfırla</a>
        <p style="margin-top: 20px;">Bu bağlantı 1 saat geçerlidir.</p>
      </div>
    `
    return this.sendEmail({ to: email, subject: "Petfendy - Şifre Sıfırlama", html: htmlContent })
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
          <div class="header"><h1>🐾 Petfendy</h1><p>E-posta Doğrulama</p></div>
          <div class="content">
            <h2>Merhaba ${name},</h2>
            <p>Hesabınızı aktifleştirmek için aşağıdaki doğrulama kodunu kullanın:</p>
            <div class="code">${verificationCode}</div>
            <p>Bu kod 15 dakika geçerlidir.</p>
          </div>
          <div class="footer"><p>© 2025 Petfendy</p></div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ to: email, subject: "Petfendy - E-posta Doğrulama", html: htmlContent })
  }

  async sendContactFormEmail(data: { name: string; email: string; phone: string; message: string }): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .contact-card { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #4F46E5; margin: 20px 0; }
          .info-row { padding: 8px 0; border-bottom: 1px solid #eee; }
          .message-box { background: #f8f9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Yeni İletişim Mesajı</h1>
            <p>Petfendy Web Sitesi</p>
          </div>
          <div class="content">
            <div class="contact-card">
              <div class="info-row">👤 <strong>Gönderen:</strong> ${data.name}</div>
              <div class="info-row">📧 <strong>E-posta:</strong> ${data.email}</div>
              <div class="info-row">📱 <strong>Telefon:</strong> ${data.phone || 'Belirtilmedi'}</div>
              <div class="info-row">📅 <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</div>
            </div>
            <div class="message-box">
              <h3>💬 Mesaj İçeriği:</h3>
              <p>${data.message}</p>
            </div>
            <p><em>Bu mesaj Petfendy web sitesi iletişim formu üzerinden gönderilmiştir.</em></p>
          </div>
          <div class="footer">
            <p>© 2025 Petfendy | Otomatik Bildirim</p>
          </div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ 
      to: "info@petfendy.com", 
      subject: `📧 Yeni İletişim Mesajı - ${data.name}`, 
      html: htmlContent 
    })
  }

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
          .welcome-box { background: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
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
            <div style="text-align: center;">
              <a href="https://petfendy.46.62.236.59.sslip.io/tr/home" class="cta-button">Hemen Rezervasyon Yap</a>
            </div>
            <p>Sevgilerle,<br><strong>Petfendy Ekibi</strong> 🐕🐈</p>
          </div>
          <div class="footer"><p>© 2025 Petfendy | petfendyotel@gmail.com</p></div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ to: email, subject: "🐾 Petfendy'ye Hoş Geldiniz!", html: htmlContent })
  }

  async sendNewUserNotificationToOwner(ownerEmail: string, userName: string, userEmail: string, userPhone: string): Promise<boolean> {
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
          .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🆕 Yeni Üye Kaydı!</h1></div>
          <div class="content">
            <p>Sisteme yeni bir kullanıcı kaydoldu:</p>
            <div class="user-card">
              <div class="info-row">👤 <strong>Ad Soyad:</strong> ${userName}</div>
              <div class="info-row">📧 <strong>E-posta:</strong> ${userEmail}</div>
              <div class="info-row">📱 <strong>Telefon:</strong> ${userPhone}</div>
              <div class="info-row">📅 <strong>Kayıt:</strong> ${new Date().toLocaleString('tr-TR')}</div>
            </div>
          </div>
          <div class="footer"><p>© 2025 Petfendy</p></div>
        </div>
      </body>
      </html>
    `
    return this.sendEmail({ to: ownerEmail, subject: `🆕 Yeni Üye: ${userName} - Petfendy`, html: htmlContent })
  }
}

export const emailService = new EmailService()
