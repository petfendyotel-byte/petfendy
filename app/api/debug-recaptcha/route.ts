// Debug endpoint for reCAPTCHA troubleshooting
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    return NextResponse.json({
      status: 'reCAPTCHA Debug Information',
      environment: process.env.NODE_ENV,
      siteKey: {
        exists: !!siteKey,
        value: siteKey ? `${siteKey.substring(0, 15)}...` : 'NOT SET',
        isTestKey: siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
      },
      secretKey: {
        exists: !!secretKey,
        value: secretKey ? `${secretKey.substring(0, 15)}...` : 'NOT SET',
        isTestKey: secretKey === '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
      },
      configured: !!(siteKey && secretKey),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testToken = 'test-token-123' } = body
    
    // Test Google reCAPTCHA API directly
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    if (!secretKey) {
      return NextResponse.json({
        error: 'Secret key not configured'
      }, { status: 500 })
    }
    
    const params = new URLSearchParams({
      secret: secretKey,
      response: testToken
    })
    
    console.log('🧪 [Debug] Testing Google reCAPTCHA API...')
    
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })
    
    const result = await response.json()
    
    console.log('📊 [Debug] Google API response:', result)
    
    return NextResponse.json({
      status: 'Google reCAPTCHA API Test',
      request: {
        url: 'https://www.google.com/recaptcha/api/siteverify',
        method: 'POST',
        secretKeyUsed: secretKey ? `${secretKey.substring(0, 15)}...` : 'NOT SET'
      },
      response: {
        success: result.success,
        score: result.score,
        action: result.action,
        challenge_ts: result.challenge_ts,
        hostname: result.hostname,
        'error-codes': result['error-codes']
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [Debug] API test failed:', error)
    return NextResponse.json({
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}