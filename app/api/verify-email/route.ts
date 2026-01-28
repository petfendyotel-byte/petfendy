// Email Verification API Endpoint
// Handles email verification token validation

import { NextRequest, NextResponse } from 'next/server'
import { emailVerificationService } from '@/lib/email-verification-service'
import { prisma } from '@/lib/prisma'
import { ApiResponseFormatter } from '@/lib/api-response'
import { protectAPI } from '@/lib/api-waf-middleware'

export async function GET(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'verify-email',
    maxRequests: 20,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return ApiResponseFormatter.validationError('Verification token is required')
    }

    // Verify the token
    const verificationResult = emailVerificationService.verifyToken(token)

    if (!verificationResult.valid) {
      return ApiResponseFormatter.validationError(verificationResult.error || 'Invalid verification token')
    }

    // Update user's email verification status in database
    try {
      await prisma.user.update({
        where: { id: verificationResult.userId },
        data: { 
          emailVerified: true,
          emailVerifiedAt: new Date()
        }
      })

      console.log(`✅ [Email Verification] User ${verificationResult.userId} email verified successfully`)

      return ApiResponseFormatter.success({
        message: 'Email başarıyla doğrulandı! Artık tüm özellikleri kullanabilirsiniz.',
        verified: true,
        email: verificationResult.email
      })

    } catch (dbError) {
      console.error('❌ [Email Verification] Database update failed:', dbError)
      
      // Even if DB update fails, the token was valid
      return ApiResponseFormatter.success({
        message: 'Email doğrulandı ancak veritabanı güncellenirken bir sorun oluştu. Lütfen tekrar giriş yapmayı deneyin.',
        verified: true,
        email: verificationResult.email,
        warning: 'Database update failed'
      })
    }

  } catch (error) {
    console.error('❌ [Email Verification] Verification failed:', error)
    return ApiResponseFormatter.error(new Error('Email doğrulama işlemi sırasında bir hata oluştu'))
  }
}

export async function POST(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'verify-email-post',
    maxRequests: 20,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return ApiResponseFormatter.validationError('Verification token is required')
    }

    // Same verification logic as GET
    const verificationResult = emailVerificationService.verifyToken(token)

    if (!verificationResult.valid) {
      return ApiResponseFormatter.validationError(verificationResult.error || 'Invalid verification token')
    }

    // Update user's email verification status
    try {
      const updatedUser = await prisma.user.update({
        where: { id: verificationResult.userId },
        data: { 
          emailVerified: true,
          emailVerifiedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          emailVerifiedAt: true
        }
      })

      console.log(`✅ [Email Verification] User ${verificationResult.userId} email verified via POST`)

      return ApiResponseFormatter.success({
        message: 'Email başarıyla doğrulandı!',
        user: updatedUser
      })

    } catch (dbError) {
      console.error('❌ [Email Verification] Database update failed:', dbError)
      return ApiResponseFormatter.error(new Error('Veritabanı güncellenirken bir hata oluştu'))
    }

  } catch (error) {
    console.error('❌ [Email Verification] POST verification failed:', error)
    return ApiResponseFormatter.error(new Error('Email doğrulama işlemi sırasında bir hata oluştu'))
  }
}