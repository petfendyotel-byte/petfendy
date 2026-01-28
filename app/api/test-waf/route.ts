import { NextRequest, NextResponse } from 'next/server'
import { wafService } from '@/lib/waf-service'
import { protectAPI } from '@/lib/api-waf-middleware'

// WAF Test Endpoint - For testing attack detection
export async function GET(request: NextRequest) {
  // Light protection for test endpoint
  const protection = await protectAPI(request, {
    endpoint: 'waf-test',
    maxRequests: 100,
    windowMs: 60 * 1000,
    enableWAF: false, // Disable WAF for testing
    enableRateLimit: true
  })

  if (!protection.allowed) {
    return protection.response!
  }

  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('test')

  return NextResponse.json({
    message: 'WAF Test Endpoint',
    availableTests: [
      'sql-injection: ?test=sql&payload=\' OR 1=1--',
      'xss: ?test=xss&payload=<script>alert(1)</script>',
      'path-traversal: ?test=path&payload=../../../etc/passwd',
      'command-injection: ?test=cmd&payload=; ls -la',
      'bot-detection: Send malicious User-Agent header'
    ],
    currentTest: testType,
    payload: searchParams.get('payload'),
    userAgent: request.headers.get('user-agent'),
    ip: getClientIP(request),
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  // Enable WAF for POST testing
  const protection = await protectAPI(request, {
    endpoint: 'waf-test-post',
    maxRequests: 50,
    windowMs: 60 * 1000,
    enableWAF: true, // Enable WAF to test blocking
    enableRateLimit: true
  })

  if (!protection.allowed) {
    return protection.response!
  }

  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: 'WAF Test - Request passed all security checks',
      receivedData: body,
      wafStatus: 'PASSED',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Invalid JSON payload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}

// Simulate attack patterns for testing
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const attack = searchParams.get('attack')

  // Simulate different attack patterns
  const attackPayloads = {
    'sql': "' UNION SELECT * FROM users--",
    'xss': '<script>alert("XSS")</script>',
    'path': '../../../etc/passwd',
    'cmd': '; rm -rf /',
    'nosql': '{"$ne": null}',
    'ldap': ')(&(objectClass=*))'
  }

  const payload = attack ? attackPayloads[attack as keyof typeof attackPayloads] : ''

  // This will likely be blocked by WAF
  const protection = await protectAPI(request, {
    endpoint: 'waf-attack-simulation',
    maxRequests: 10,
    windowMs: 60 * 1000,
    enableWAF: true,
    enableRateLimit: true
  })

  if (!protection.allowed) {
    return protection.response!
  }

  return NextResponse.json({
    message: 'Attack simulation - This should have been blocked!',
    attack: attack,
    payload: payload,
    warning: 'If you see this, WAF might not be working correctly',
    timestamp: new Date().toISOString()
  })
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}