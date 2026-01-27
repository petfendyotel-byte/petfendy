import { NextRequest, NextResponse } from 'next/server'
import { recaptchaService } from '@/lib/recaptcha-service'
import { emailService } from '@/lib/email-service'
import { sanitizeInput, validateEmail, validatePhone } from '@/lib/security'
import { headers } from 'next/headers'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  recaptchaToken: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    const { name, email, phone, subject, message, recaptchaToken } = body

    // Validate required fields
    if (!name || !email || !subject || !message || !recaptchaToken) {
      return NextResponse.json(
        { success: false, error: 'Tüm gerekli alanları doldurun' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedSubject = sanitizeInput(subject)
    const sanitizedMessage = sanitizeInput(message)

    // Validate inputs
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Ad soyad en az 2 karakter olmalıdır' },
        { status: 400 }
      )
    }

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir telefon numarası girin' },
        { status: 400 }
      )
    }

    if (sanitizedSubject.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Konu en az 3 karakter olmalıdır' },
        { status: 400 }
      )
    }

    if (sanitizedMessage.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Mesaj en az 10 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Get client IP for reCAPTCHA verification
    const headersList = headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const remoteip = forwarded?.split(',')[0] || realIp || undefined

    // Verify reCAPTCHA
    const recaptchaResult = await recaptchaService.validateRecaptcha(
      recaptchaToken,
      'contact',
      0.5,
      remoteip
    )

    if (!recaptchaResult.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Güvenlik doğrulaması başarısız',
          details: recaptchaResult.error 
        },
        { status: 400 }
      )
    }

    // Send email to business owner
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'petfendyotel@gmail.com'
    
    try {
      await emailService.sendContactFormEmail(
        ownerEmail,
        {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: phone || '',
          subject: sanitizedSubject,
          message: sanitizedMessage
        }
      )
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError)
      return NextResponse.json(
        { success: false, error: 'E-posta gönderilemedi' },
        { status: 500 }
      )
    }

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmationEmail(
        sanitizedEmail,
        sanitizedName,
        sanitizedSubject
      )
    } catch (confirmationError) {
      console.error('Failed to send confirmation email:', confirmationError)
      // Don't fail the request if confirmation email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sunucu hatası. Lütfen tekrar deneyin.' 
      },
      { status: 500 }
    )
  }
}