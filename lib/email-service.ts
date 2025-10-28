// Mock SendGrid Email Service
// In production, replace with actual SendGrid API integration

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
  private apiKey: string = process.env.SENDGRID_API_KEY || "mock_sendgrid_key"
  private fromEmail: string = "noreply@petfendy.com"
  private fromName: string = "Petfendy"

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    // Mock email sending
    console.log("📧 [Email Service] Sending email...")
    console.log("To:", template.to)
    console.log("Subject:", template.subject)
    console.log("Content:", template.text || template.html)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock success response
    return true
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
}

export const emailService = new EmailService()


