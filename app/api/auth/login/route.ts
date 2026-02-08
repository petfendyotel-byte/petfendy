import { NextRequest, NextResponse } from 'next/server'
import { validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'
import { jwtService } from '@/lib/jwt-service'
import bcrypt from 'bcryptjs'

// Login validation schema
const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
  recaptchaToken: { required: false, type: 'string' } // Optional for backward compatibility
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

    // Verify reCAPTCHA (only if token provided and reCAPTCHA is configured)
    if (recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://petfendy.com'}/api/verify-recaptcha`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: recaptchaToken,
            action: 'login',
            minScore: 0.5
          })
        })

        if (recaptchaResponse.ok) {
          const recaptchaResult = await recaptchaResponse.json()
          if (!recaptchaResult.success) {
            logSecurityEvent({
              type: 'RECAPTCHA_FAILED',
              details: { email, action: 'login', score: recaptchaResult.score }
            })
            return NextResponse.json({ 
              error: 'Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.' 
            }, { status: 400 })
          }
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError)
        // Continue with login if reCAPTCHA fails (don't block users)
      }
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Find user in database
    let user = null
    let prisma = null
    
    try {
      prisma = (await import('@/lib/prisma')).default
      user = await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      })
    } catch (dbError) {
      console.error('Database connection error, using fallback auth:', dbError)
      
      // FALLBACK: Test user for demo/development when DB is not available
      if (sanitizedEmail === 'petfendyotel@gmail.com') {
        const bcrypt = require('bcryptjs')
        const testPasswordHash = '$2b$12$1nEZKNLzKANQ7AfOKWzBueUBIRTMYQcoOwjILo7a1pbqetqJzMHbG' // ErikUzum52707+.
        const passwordValid = await bcrypt.compare(password, testPasswordHash)
        
        if (passwordValid) {
          const testUser = {
            id: 'admin-1',
            email: sanitizedEmail,
            name: 'Admin User',
            phone: '+905551234567',
            role: 'admin',
            active: true,
            emailVerified: true,
            passwordHash: testPasswordHash
          }
          
          // Generate JWT tokens
          const tokens = await jwtService.generateTokenPair(testUser.id, testUser.role)
          
          return NextResponse.json({
            success: true,
            message: 'Giriş başarılı (Test Mode)',
            user: {
              id: testUser.id,
              name: testUser.name,
              email: testUser.email,
              phone: testUser.phone,
              emailVerified: testUser.emailVerified,
              role: testUser.role
            },
            tokens
          })
        }
      }
      
      return NextResponse.json({ 
        error: 'Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.' 
      }, { status: 503 })
    }

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

    // Update last login time (only if prisma is available)
    if (prisma) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }
        })
      } catch (updateError) {
        console.error('Failed to update last login time:', updateError)
        // Don't fail login if update fails
      }
    }

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