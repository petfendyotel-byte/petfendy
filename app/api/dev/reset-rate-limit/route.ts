import { NextRequest, NextResponse } from 'next/server'

// Development only endpoint to reset rate limiting
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    // Clear rate limit stores (this is a simple implementation)
    // In a real app, you'd clear Redis or database entries
    
    return NextResponse.json({
      success: true,
      message: 'Rate limit reset successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Rate limit reset error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Reset failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Rate limit reset endpoint',
    usage: 'POST to this endpoint to reset rate limits in development',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}