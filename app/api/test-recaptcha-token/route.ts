import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [Test reCAPTCHA] Token test endpoint called')
    
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    console.log('🎫 [Test reCAPTCHA] Token received, length:', token.length)
    console.log('🎫 [Test reCAPTCHA] Token preview:', token.substring(0, 50) + '...')
    
    // Try to decode the token (it's a JWT-like structure)
    try {
      const parts = token.split('.')
      console.log('🔍 [Test reCAPTCHA] Token parts count:', parts.length)
      
      if (parts.length >= 2) {
        // Decode the payload (second part)
        const payload = Buffer.from(parts[1], 'base64url').toString('utf8')
        console.log('📋 [Test reCAPTCHA] Token payload:', payload)
      }
    } catch (decodeError) {
      console.log('⚠️ [Test reCAPTCHA] Could not decode token:', decodeError)
    }
    
    // Test with Google API directly
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Secret key not configured' },
        { status: 500 }
      )
    }
    
    console.log('🔑 [Test reCAPTCHA] Using secret key:', secretKey.substring(0, 15) + '...')
    
    const params = new URLSearchParams({
      secret: secretKey,
      response: token
    })
    
    console.log('📡 [Test reCAPTCHA] Making request to Google...')
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })
    
    console.log('📊 [Test reCAPTCHA] Google response status:', response.status)
    
    const data = await response.json()
    console.log('📋 [Test reCAPTCHA] Google response:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      tokenLength: token.length,
      googleResponse: data,
      analysis: {
        hasAction: !!data.action,
        actionValue: data.action,
        actionLength: (data.action || '').length,
        hasScore: typeof data.score === 'number',
        scoreValue: data.score,
        isV3: typeof data.score === 'number' && !!data.action
      }
    })
    
  } catch (error) {
    console.error('❌ [Test reCAPTCHA] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}