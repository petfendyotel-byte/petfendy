import { NextRequest, NextResponse } from 'next/server'

// Email test endpoint - Mailpit bağlantısını test etmek için
// Güvenlik: Production'da devre dışı
const isProduction = process.env.NODE_ENV === 'production'
const PROD_GUARD = NextResponse.json({ error: 'Not Found' }, { status: 404 })

export async function GET(request: NextRequest) {
  if (isProduction) return PROD_GUARD
  try {
    // Test email gönder
    const testEmailResponse = await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@petfendy.com',
        subject: '🐾 Petfendy Email Test - Mailpit Bağlantısı',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F97316 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { padding: 30px; background: #f9fafb; }
              .test-info { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐾 Petfendy Email Test</h1>
                <p>Mailpit Bağlantı Testi</p>
              </div>
              <div class="content">
                <div class="test-info">
                  <h2>✅ Email Sistemi Çalışıyor!</h2>
                  <p><strong>Test Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                  <p><strong>Gönderen:</strong> info@petfendy.com</p>
                  <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Yapılandırılmamış'}</p>
                  <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 'Yapılandırılmamış'}</p>
                </div>
                <p>Bu email Mailpit üzerinden başarıyla gönderildi!</p>
                <p>Mailpit Web UI'da bu emaili görebilirsiniz.</p>
              </div>
              <div class="footer">
                <p>© 2025 Petfendy | Test Email</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Petfendy Email Test

Email sistemi çalışıyor!
Test Tarihi: ${new Date().toLocaleString('tr-TR')}
Gönderen: info@petfendy.com
SMTP Host: ${process.env.SMTP_HOST || 'Yapılandırılmamış'}
SMTP Port: ${process.env.SMTP_PORT || 'Yapılandırılmamış'}

Bu email Mailpit üzerinden başarıyla gönderildi!
        `
      })
    })

    const emailResult = await testEmailResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Email test completed',
      timestamp: new Date().toISOString(),
      emailResult,
      smtpConfig: {
        host: process.env.SMTP_HOST || 'Not configured',
        port: process.env.SMTP_PORT || 'Not configured',
        secure: process.env.SMTP_SECURE || 'false',
        from: process.env.EMAIL_FROM || 'Not configured'
      }
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        smtpConfig: {
          host: process.env.SMTP_HOST || 'Not configured',
          port: process.env.SMTP_PORT || 'Not configured',
          secure: process.env.SMTP_SECURE || 'false',
          from: process.env.EMAIL_FROM || 'Not configured'
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (isProduction) return PROD_GUARD
  try {
    const { to, subject, message } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Custom test email gönder
    const testEmailResponse = await fetch(`${request.nextUrl.origin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: subject || '🐾 Petfendy Custom Test Email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F97316 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { padding: 30px; background: #f9fafb; }
              .message-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🐾 Petfendy</h1>
                <p>Custom Test Email</p>
              </div>
              <div class="content">
                <div class="message-box">
                  <h2>Test Mesajı</h2>
                  <p>${message || 'Bu bir test emailidir.'}</p>
                  <p><strong>Gönderim Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                </div>
              </div>
              <div class="footer">
                <p>© 2025 Petfendy | info@petfendy.com</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    const emailResult = await testEmailResponse.json()

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      timestamp: new Date().toISOString(),
      emailResult
    })

  } catch (error) {
    console.error('Custom email test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Custom email test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}