import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Distance API Test Working!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
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