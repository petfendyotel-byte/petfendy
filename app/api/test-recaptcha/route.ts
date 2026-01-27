import { NextRequest, NextResponse } from 'next/server'
import { recaptchaService } from '@/lib/recaptcha-service'

export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  return NextResponse.json({
    status: 'reCAPTCHA Configuration Test',
    siteKey: siteKey ? `${siteKey.substring(0, 10)}...` : 'NOT SET',
    secretKey: secretKey ? `${secretKey.substring(0, 10)}...` : 'NOT SET',
    configured: !!(siteKey && secretKey),
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { token, action = 'test' } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    const result = await recaptchaService.validateRecaptcha(token, action, 0.5)

    return NextResponse.json({
      success: result.valid,
      score: result.score,
      error: result.error,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('reCAPTCHA test error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}