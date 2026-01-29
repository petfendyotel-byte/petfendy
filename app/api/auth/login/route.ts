import { NextRequest, NextResponse } from 'next/server'
import { validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'
import { jwtService } from '@/lib/jwt-service'
import bcrypt from 'bcryptjs'

// Login validation schema
const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
  recaptchaToken: { required: true, type: 'string' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, loginSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_LOGIN_DATA',
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz giriş verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { email, password, recaptchaToken } = validation.data!

    // Verify reCAPTCHA
    const recaptchaResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://petfendy.com'}/api/verify-recaptcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: recaptchaToken,
        action: 'login',
        minScore: 0.5
      })
    })

    if (!recaptchaResponse.ok) {
      logSecurityEvent({
        type: 'RECAPTCHA_FAILED',
        details: { email, action: 'login' }
      })
      return NextResponse.json({ 
        error: 'Güvenlik doğrulaması başarısız' 
      }, { status: 400 })
    }

    const recaptchaResult = await recaptchaResponse.json()
    if (!recaptchaResult.success) {
      return NextResponse.json({ 
        error: 'Güvenlik doğrulaması başarısız' 
      }, { status: 400 })
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Find user in database
    const prisma = (await import('@/lib/prisma')).default
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (!user) {
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        details: { email: sanitizedEmail, reason: 'user_not_found' }
      })
      return NextResponse.json({ 
        error: 'E-posta veya şifre hatalı' 
      }, { status: 401 })
    }

    // Check if user is active
    if (!user.active) {
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        userId: user.id,
        details: { email: sanitizedEmail, reason: 'user_inactive' }
      })
      return NextResponse.json({ 
        error: 'Hesabınız devre dışı bırakılmış' 
      }, { status: 401 })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      logSecurityEvent({
        type: 'LOGIN_FAILED',
        userId: user.id,
        details: { email: sanitizedEmail, reason: 'invalid_password' }
      })
      return NextResponse.json({ 
        error: 'E-posta veya şifre hatalı' 
      }, { status: 401 })
    }

    // Check if email is verified (optional - can be enforced later)
    if (!user.emailVerified) {
      logSecurityEvent({
        type: 'LOGIN_UNVERIFIED',
        userId: user.id,
        details: { email: sanitizedEmail }
      })
      // For now, allow login but warn user
      // return NextResponse.json({ 
      //   error: 'E-posta adresinizi doğrulamanız gerekiyor' 
      // }, { status: 403 })
    }

    // Generate JWT tokens
    const tokens = await jwtService.generateTokenPair(user.id, user.role)

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    // Log successful login
    logSecurityEvent({
      type: 'USER_LOGIN',
      userId: user.id,
      details: { 
        email: sanitizedEmail,
        emailVerified: user.emailVerified
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role
      },
      tokens
    })

  } catch (error: any) {
    console.error('Login error:', error)
    
    logSecurityEvent({
      type: 'LOGIN_ERROR',
      details: { error: error.message }
    })
    
    return NextResponse.json({ 
      error: 'Giriş işlemi sırasında hata oluştu' 
    }, { status: 500 })
  }
}