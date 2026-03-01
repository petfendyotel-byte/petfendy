import { NextRequest, NextResponse } from 'next/server'

// Güvenlik: Production'da devre dışı
const isProduction = process.env.NODE_ENV === 'production'
const PROD_GUARD = NextResponse.json({ error: 'Not Found' }, { status: 404 })

export async function GET() {
  if (isProduction) return PROD_GUARD
  return NextResponse.json({
    message: 'Distance API Test Working!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  if (isProduction) return PROD_GUARD
  try {
    const body = await request.json()
    
    return NextResponse.json({ 
      message: 'POST request received',
      body,
      fallbackDistance: 1170, // Ankara → İzmir fallback
      method: 'fallback',
      success: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON',
      success: false 
    }, { status: 400 })
  }
}