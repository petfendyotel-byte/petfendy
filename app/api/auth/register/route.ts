import { NextRequest, NextResponse } from 'next/server'
import { validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'
import { emailVerificationService } from '@/lib/email-verification-service'
import { jwtService } from '@/lib/jwt-service'
import { smsService } from '@/lib/sms-service'
import bcrypt from 'bcryptjs'

// Registration validation schema
const registerSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  email: { required: true, type: 'email' },
  phone: { required: true, type: 'string', minLength: 10, maxLength: 20 },
  password: { required: true, type: 'string', minLength: 8, maxLength: 100 },
  recaptchaToken: { required: false, type: 'string' } // Optional for backward compatibility
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, registerSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_REGISTRATION_DATA',
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz kayıt verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { name, email, phone, password, recaptchaToken } = validation.data!

    // Verify reCAPTCHA (only if token provided and reCAPTCHA is configured)
    if (recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://petfendy.com'}/api/verify-recaptcha`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: recaptchaToken,
            action: 'register',
            minScore: 0.5
          })
        })

        if (recaptchaResponse.ok) {
          const recaptchaResult = await recaptchaResponse.json()
          if (!recaptchaResult.success) {
            logSecurityEvent({
              type: 'RECAPTCHA_FAILED',
              details: { email, action: 'register', score: recaptchaResult.score }
            })
            return NextResponse.json({ 
              error: 'Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.' 
            }, { status: 400 })
          }
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError)
        // Continue with registration if reCAPTCHA fails (don't block users)
      }
    }

    // Sanitize user input
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedPhone = sanitizeInput(phone.replace(/\D/g, ''))

    // Check if user already exists
    const prisma = (await import('@/lib/prisma')).default
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedEmail },
          { phone: sanitizedPhone }
        ]
      }
    })

    if (existingUser) {
      logSecurityEvent({
        type: 'DUPLICATE_REGISTRATION',
        details: { email: sanitizedEmail, phone: sanitizedPhone }
      })
      return NextResponse.json({ 
        error: 'Bu e-posta veya telefon numarası zaten kayıtlı' 
      }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        passwordHash,
        emailVerified: false,
        emailVerifiedAt: null,
        active: true,
        verificationCode,
        verificationCodeExpiry: verificationExpiry,
        role: 'USER'
      }
    })

    // Send verification email
    try {
      await emailVerificationService.sendVerificationEmail(
        sanitizedEmail,
        sanitizedName,
        verificationCode
      )
    } catch (emailError) {
      console.error('Verification email error:', emailError)
      // Don't fail registration if email fails
    }

    // Send welcome SMS and admin notification
    try {
      await smsService.sendNewUserNotifications(
        sanitizedName,
        sanitizedEmail,
        sanitizedPhone
      )
    } catch (smsError) {
      console.error('SMS notification error:', smsError)
      // Don't fail registration if SMS fails
    }

    // Generate JWT tokens
    const tokens = await jwtService.generateTokenPair(user.id, user.role)

    // Log successful registration
    logSecurityEvent({
      type: 'USER_REGISTERED',
      userId: user.id,
      details: { 
        email: sanitizedEmail,
        name: sanitizedName,
        phone: sanitizedPhone
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Kayıt başarılı. E-posta adresinizi doğrulayın.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role
      },
      tokens
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    logSecurityEvent({
      type: 'REGISTRATION_ERROR',
      details: { error: error.message }
    })
    
    return NextResponse.json({ 
      error: 'Kayıt işlemi sırasında hata oluştu' 
    }, { status: 500 })
  }
}