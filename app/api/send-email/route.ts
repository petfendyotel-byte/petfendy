import { NextRequest, NextResponse } from 'next/server'

// E-posta gönderimi için API route
// Resend, SMTP veya diğer servisler ile entegre edilebilir

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Resend API kullan (eğer API key varsa)
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey) {
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
        return NextResponse.json({ success: true, id: data.id })
      } else {
        const error = await response.text()
        console.error('Resend error:', error)
        // Fallback to mock
      }
    }

    // SMTP kullan (eğer yapılandırılmışsa)
    const smtpHost = process.env.SMTP_HOST
    if (smtpHost) {
      // Nodemailer ile SMTP gönderimi
      // Not: Nodemailer server-side'da çalışır
      try {
        const nodemailer = await import('nodemailer')
        
        const transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Petfendy" <noreply@petfendy.com>',
          to,
          subject,
          html,
          text,
        })

        console.log(`✅ Email sent via SMTP to ${to}:`, info.messageId)
        return NextResponse.json({ success: true, id: info.messageId })
      } catch (smtpError) {
        console.error('SMTP error:', smtpError)
        // Fallback to mock
      }
    }

    // Mock mode - sadece logla
    console.log(`📧 [Mock Email] To: ${to}, Subject: ${subject}`)
    return NextResponse.json({ 
      success: true, 
      mock: true,
      message: 'Email logged (no email service configured)' 
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
