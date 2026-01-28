// API WAF Middleware - Protects API endpoints from attacks
import { NextRequest, NextResponse } from 'next/server'
import { wafService } from './waf-service'

interface WAFMiddlewareOptions {
  enableBlocking?: boolean
  logOnly?: boolean
  customRules?: string[]
  whitelist?: string[]
}

export interface WAFResult {
  allowed: boolean
  blocked: boolean
  suspicious: boolean
  attacks: string[]
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip: string
}

/**
 * WAF Middleware for API routes
 */
export async function withWAF(
  request: NextRequest,
  options: WAFMiddlewareOptions = {}
): Promise<{ result: WAFResult; response?: NextResponse }> {
  const {
    enableBlocking = true,
    logOnly = false,
    whitelist = []
  } = options

  // Extract request information
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const url = request.url
  const method = request.method

  // Convert headers to object
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Get request body if present
  let body = ''
  try {
    if (request.body && method !== 'GET') {
      const clonedRequest = request.clone()
      body = await clonedRequest.text()
    }
  } catch (error) {
    // Body might not be readable, continue without it
  }

  // Check whitelist
  if (whitelist.includes(ip)) {
    return {
      result: {
        allowed: true,
        blocked: false,
        suspicious: false,
        attacks: [],
        reason: 'IP whitelisted',
        severity: 'low',
        ip
      }
    }
  }

  // Analyze request with WAF
  const analysis = wafService.analyzeRequest({
    ip,
    userAgent,
    url,
    method,
    headers,
    body
  })

  const result: WAFResult = {
    allowed: !analysis.blocked,
    blocked: analysis.blocked,
    suspicious: analysis.suspicious,
    attacks: analysis.attacks,
    reason: analysis.reason,
    severity: analysis.severity,
    ip
  }

  // Log security events
  if (analysis.suspicious || analysis.blocked) {
    logSecurityEvent({
      type: analysis.blocked ? 'WAF_BLOCKED' : 'WAF_SUSPICIOUS',
      ip,
      userAgent,
      url,
      method,
      attacks: analysis.attacks,
      severity: analysis.severity,
      reason: analysis.reason,
      botAnalysis: analysis.botAnalysis
    })
  }

  // Return blocking response if needed
  if (analysis.blocked && enableBlocking && !logOnly) {
    const response = new NextResponse(
      JSON.stringify({
        error: 'Request blocked by security system',
        code: 'WAF_BLOCKED',
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-WAF-Status': 'BLOCKED',
          'X-WAF-Reason': analysis.reason,
          'X-WAF-Severity': analysis.severity,
          'X-Request-ID': generateRequestId()
        }
      }
    )

    return { result, response }
  }

  // Add WAF headers to response for monitoring
  return { result }
}

/**
 * Get client IP address with proxy support
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (when behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  const xClientIp = request.headers.get('x-client-ip')
  if (xClientIp) {
    return xClientIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Log security events with structured format
 */
function logSecurityEvent(event: {
  type: string
  ip: string
  userAgent: string
  url: string
  method: string
  attacks: string[]
  severity: string
  reason: string
  botAnalysis: any
}) {
  const timestamp = new Date().toISOString()
  const severityEmoji = {
    low: '⚠️',
    medium: '🟠',
    high: '🔴',
    critical: '🚨'
  }

  const emoji = severityEmoji[event.severity as keyof typeof severityEmoji] || '🚨'

  console.warn(`${emoji} [WAF] ${timestamp} - ${event.type}`, {
    ip: event.ip,
    userAgent: event.userAgent,
    url: event.url,
    method: event.method,
    attacks: event.attacks,
    severity: event.severity,
    reason: event.reason,
    botInfo: {
      isBot: event.botAnalysis.isBot,
      isMalicious: event.botAnalysis.isMalicious,
      confidence: event.botAnalysis.confidence,
      reason: event.botAnalysis.reason
    }
  })

  // In production: Send to SIEM/monitoring service
  // Example: Sentry, DataDog, Splunk, etc.
}

/**
 * Rate limiting specifically for API endpoints
 */
const apiRateLimits = new Map<string, { count: number; resetTime: number }>()

export function checkAPIRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetMs: number } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const record = apiRateLimits.get(key)

  // Clean up old entries periodically
  if (now % 10000 < 100) {
    for (const [k, v] of apiRateLimits.entries()) {
      if (now > v.resetTime) {
        apiRateLimits.delete(k)
      }
    }
  }

  if (!record || now > record.resetTime) {
    apiRateLimits.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetMs: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetMs: record.resetTime - now }
}

/**
 * Enhanced API protection wrapper
 */
export async function protectAPI(
  request: NextRequest,
  options: {
    endpoint: string
    maxRequests?: number
    windowMs?: number
    enableWAF?: boolean
    enableRateLimit?: boolean
    whitelist?: string[]
  }
): Promise<{ allowed: boolean; response?: NextResponse; wafResult?: WAFResult }> {
  const {
    endpoint,
    maxRequests = 100,
    windowMs = 60 * 1000,
    enableWAF = true,
    enableRateLimit = true,
    whitelist = []
  } = options

  const ip = getClientIP(request)

  // Check whitelist
  if (whitelist.includes(ip)) {
    return { allowed: true }
  }

  // WAF Protection
  if (enableWAF) {
    const { result, response } = await withWAF(request, { whitelist })
    if (response) {
      return { allowed: false, response, wafResult: result }
    }
  }

  // Rate Limiting
  if (enableRateLimit) {
    const rateLimit = checkAPIRateLimit(ip, endpoint, maxRequests, windowMs)
    if (!rateLimit.allowed) {
      const response = new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(rateLimit.resetMs / 1000),
          requestId: generateRequestId(),
          timestamp: new Date().toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetMs).toISOString(),
            'X-Request-ID': generateRequestId()
          }
        }
      )

      logSecurityEvent({
        type: 'API_RATE_LIMIT_EXCEEDED',
        ip,
        userAgent: request.headers.get('user-agent') || '',
        url: request.url,
        method: request.method,
        attacks: ['RATE_LIMIT'],
        severity: 'medium',
        reason: `Rate limit exceeded for endpoint ${endpoint}`,
        botAnalysis: { isBot: false, isMalicious: false, confidence: 0, reason: '' }
      })

      return { allowed: false, response }
    }
  }

  return { allowed: true }
}