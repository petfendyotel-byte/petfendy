import { NextRequest, NextResponse } from 'next/server'
import { protectAPI } from '@/lib/api-waf-middleware'

// E-posta gönderimi için API route
// Mailpit, Resend, SMTP veya diğer servisler ile entegre edilebilir

export async function POST(request: NextRequest) {
  // Bu uç nokta giriş yapmamış ziyaretçilerin akışlarında da kullanılıyor (kayıt doğrulaması,
  // misafir rezervasyon onayı). Kötüye kullanımı sınırlamak için IP başına hız sınırı uygulanır.
  // WAF taraması kapalı: e-posta HTML'indeki "#", "'" gibi karakterler yanlış alarm üretir.
  const protection = await protectAPI(request, {
    endpoint: 'send-email',
    maxRequests: 15,
    windowMs: 10 * 60 * 1000,
    enableWAF: false,
    enableRateLimit: true
  })
  if (!protection.allowed) {
    return protection.response!
  }

  try {
    const { to, subject, html, text } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Tek, geçerli bir alıcı; başlık enjeksiyonu ve boyut sınırları
    if (
      typeof to !== 'string' || typeof subject !== 'string' || typeof html !== 'string' ||
      !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to) || to.length > 254 ||
      /[\r\n]/.test(subject) || subject.length > 200 ||
      html.length > 200_000 || (text !== undefined && (typeof text !== 'string' || text.length > 100_000))
    ) {
      return NextResponse.json({ error: 'Invalid email payload' }, { status: 400 })
    }

    // 1. Resend API kullan (eğer API key varsa)
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Petfendy <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
            text,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Email sent via Resend to ${to}:`, data.id)
          return NextResponse.json({ success: true, provider: 'resend', id: data.id })
        } else {
          const error = await response.text()
          console.error('Resend error:', error)
          // Fallback to SMTP
        }
      } catch (resendError) {
        console.error('Resend connection error:', resendError)
        // Fallback to SMTP
      }
    }

    // 2. SMTP kullan (Mailpit, Gmail, vs.)
    const smtpHost = process.env.SMTP_HOST
    if (smtpHost) {
      try {
        const nodemailer = await import('nodemailer')
        
        const transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          } : undefined, // Mailpit genellikle auth gerektirmez
          tls: {
            rejectUnauthorized: false // Development için
          }
        })

        // SMTP bağlantısını test et
        await transporter.verify()

        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Petfendy" <info@petfendy.com>',
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ''), // HTML'den text oluştur
        })

        console.log(`✅ Email sent via SMTP (${smtpHost}) to ${to}:`, info.messageId)
        console.log(`📧 Mailpit Web UI: ${process.env.MAILPIT_WEB_UI || 'http://localhost:8025'}`)
        return NextResponse.json({ 
          success: true, 
          provider: 'smtp',
          host: smtpHost,
          id: info.messageId,
          mailpitUI: process.env.MAILPIT_WEB_UI || 'http://localhost:8025'
        })
      } catch (smtpError) {
        console.error('SMTP error:', smtpError)
        // Fallback to mock
      }
    }

    // 3. SendGrid kullan (eğer API key varsa)
    const sendGridApiKey = process.env.SENDGRID_API_KEY
    if (sendGridApiKey) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { 
              email: process.env.SENDGRID_FROM_EMAIL || 'info@petfendy.com',
              name: 'Petfendy'
            },
            subject,
            content: [
              { type: 'text/html', value: html },
              ...(text ? [{ type: 'text/plain', value: text }] : [])
            ],
          }),
        })

        if (response.ok) {
          console.log(`✅ Email sent via SendGrid to ${to}`)
          return NextResponse.json({ success: true, provider: 'sendgrid' })
        } else {
          const error = await response.text()
          console.error('SendGrid error:', error)
          // Fallback to mock
        }
      } catch (sendGridError) {
        console.error('SendGrid connection error:', sendGridError)
        // Fallback to mock
      }
    }

    // 4. Mock mode - sadece logla (hiçbir servis yapılandırılmamışsa)
    console.log(`📧 [Mock Email] To: ${to}, Subject: ${subject}`)
    console.log(`📧 [Mock Email] HTML Preview:`, html.substring(0, 200) + '...')
    
    return NextResponse.json({ 
      success: true, 
      provider: 'mock',
      message: 'Email logged (no email service configured)',
      to,
      subject
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
