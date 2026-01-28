// Resend Email Verification API Endpoint
// Allows users to request a new verification email

import { NextRequest, NextResponse } from 'next/server'
import { emailVerificationService } from '@/lib/email-verification-service'
import { prisma } from '@/lib/prisma'
import { ApiResponseFormatter } from '@/lib/api-response'
import { protectAPI } from '@/lib/api-waf-middleware'
import { sanitizeEmail } from '@/lib/input-sanitizer'

export async function POST(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'resend-verification',
    maxRequests: 10,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const body = await request.json()
    const { email, userId } = body

    // Input validation and sanitization
    if (!email && !userId) {
      return ApiResponseFormatter.validationError('Email veya kullanıcı ID gereklidir')
    }

    let user
    
    if (email) {
      // Sanitize email input
      const sanitizedEmail = sanitizeEmail(email)
      if (!sanitizedEmail) {
        return ApiResponseFormatter.validationError('Geçersiz email formatı')
      }

      // Find user by email
      user = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true
        }
      })
    } else if (userId) {
      // Find user by ID
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true
        }
      })
    }

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return ApiResponseFormatter.success({
        message: 'Eğer bu email adresi sistemde kayıtlıysa, doğrulama emaili gönderildi.',
        sent: true
      })
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return ApiResponseFormatter.validationError('Bu email adresi zaten doğrulanmış')
    }

    // Check if user has pending verification (rate limiting)
    if (emailVerificationService.hasPendingVerification(user.id)) {
      // Try to resend (with built-in rate limiting)
      const resendResult = await emailVerificationService.resendVerification(user.id, user.email)
      
      if (!resendResult.success) {
        return ApiResponseFormatter.validationError(resendResult.error || 'Doğrulama emaili gönderilemedi')
      }

      return ApiResponseFormatter.success({
        message: 'Doğrulama emaili tekrar gönderildi. Lütfen email kutunuzu kontrol edin.',
        sent: true,
        email: user.email
      })
    }

    // Generate new verification token and send email
    const resendResult = await emailVerificationService.resendVerification(user.id, user.email)
    
    if (!resendResult.success) {
      return ApiResponseFormatter.validationError(resendResult.error || 'Doğrulama emaili gönderilemedi')
    }

    console.log(`📧 [Resend Verification] Email sent to ${user.email} for user ${user.id}`)

    return ApiResponseFormatter.success({
      message: 'Doğrulama emaili gönderildi. Lütfen email kutunuzu kontrol edin.',
      sent: true,
      email: user.email
    })

  } catch (error) {
    console.error('❌ [Resend Verification] Failed:', error)
    return ApiResponseFormatter.error(new Error('Doğrulama emaili gönderilirken bir hata oluştu'))
  }
}

// GET endpoint for checking verification status
export async function GET(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'verification-status',
    maxRequests: 50,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')

    if (!email && !userId) {
      return ApiResponseFormatter.validationError('Email veya kullanıcı ID gereklidir')
    }

    let user
    
    if (email) {
      const sanitizedEmail = sanitizeEmail(email)
      if (!sanitizedEmail) {
        return ApiResponseFormatter.validationError('Geçersiz email formatı')
      }

      user = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          emailVerifiedAt: true
        }
      })
    } else if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          emailVerifiedAt: true
        }
      })
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const hasPendingVerification = emailVerificationService.hasPendingVerification(user.id)
    const stats = emailVerificationService.getStats()

    return ApiResponseFormatter.success({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt
      },
      hasPendingVerification,
      canResend: !hasPendingVerification || !user.emailVerified,
      stats: {
        totalPendingVerifications: stats.totalPendingVerifications,
        recentVerifications: stats.recentVerifications
      }
    })

  } catch (error) {
    console.error('❌ [Verification Status] Failed:', error)
    return ApiResponseFormatter.error(new Error('Doğrulama durumu kontrol edilirken bir hata oluştu'))
  }
}