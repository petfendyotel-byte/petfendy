import { NextRequest, NextResponse } from 'next/server'
import { recaptchaService } from '@/lib/recaptcha-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [reCAPTCHA] Verify endpoint called')
    
    const body = await request.json()
    console.log('📝 [reCAPTCHA] Request body:', { 
      hasToken: !!body.token, 
      action: body.action, 
      minScore: body.minScore 
    })
    
    const { token, action, minScore = 0.5 } = body

    if (!token) {
      console.log('❌ [reCAPTCHA] No token provided')
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    if (!action) {
      console.log('❌ [reCAPTCHA] No action provided')
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    console.log('🔑 [reCAPTCHA] Environment check:', {
      hasSiteKey: !!siteKey,
      hasSecretKey: !!secretKey,
      siteKeyPrefix: siteKey?.substring(0, 10),
      secretKeyPrefix: secretKey?.substring(0, 10)
    })

    if (!secretKey) {
      console.log('❌ [reCAPTCHA] Secret key not configured')
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA not configured on server' },
        { status: 500 }
      )
    }

    // Get client IP for additional verification
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    const remoteip = cfConnectingIp || forwarded?.split(',')[0] || realIp || undefined
    
    console.log('🌐 [reCAPTCHA] Client IP:', remoteip)

    // Verify reCAPTCHA token with production keys
    console.log('🔄 [reCAPTCHA] Starting validation...')
    const result = await recaptchaService.validateRecaptcha(
      token,
      action,
      minScore,
      remoteip
    )
    
    console.log('📊 [reCAPTCHA] Validation result:', {
      valid: result.valid,
      score: result.score,
      error: result.error
    })

    if (!result.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          score: result.score 
        },
        { status: 400 }
      )
    }

    console.log('✅ [reCAPTCHA] Verification successful')
    return NextResponse.json({
      success: true,
      score: result.score,
      message: 'reCAPTCHA verification successful'
    })

  } catch (error) {
    console.error('❌ [reCAPTCHA] Verification error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during reCAPTCHA verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}