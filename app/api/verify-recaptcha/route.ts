import { NextRequest, NextResponse } from 'next/server'
import { recaptchaService } from '@/lib/recaptcha-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action, minScore = 0.5 } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
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

    // Verify reCAPTCHA token with production keys
    const result = await recaptchaService.validateRecaptcha(
      token,
      action,
      minScore,
      remoteip
    )

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

    return NextResponse.json({
      success: true,
      score: result.score,
      message: 'reCAPTCHA verification successful'
    })

  } catch (error) {
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