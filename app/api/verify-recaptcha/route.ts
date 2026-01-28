import { NextRequest, NextResponse } from 'next/server'
import { recaptchaService } from '@/lib/recaptcha-service'
import { headers } from 'next/headers'

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

    // Get client IP for additional verification
    const headersList = headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const remoteip = forwarded?.split(',')[0] || realIp || undefined

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
    console.error('reCAPTCHA verification error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during reCAPTCHA verification' 
      },
      { status: 500 }
    )
  }
}