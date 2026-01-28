// Comprehensive Security Middleware
// Integrates WAF, JWT, Email Verification, and other security measures

import { NextRequest, NextResponse } from 'next/server'
import { jwtService, TokenValidationResult } from './jwt-service'
import { protectAPI } from './api-waf-middleware'
import { ApiResponseFormatter } from './api-response'
import { prisma } from './prisma'

export interface SecurityContext {
  user?: {
    id: string
    email: string
    role?: string
    emailVerified: boolean
  }
  isAuthenticated: boolean
  isEmailVerified: boolean
  isAdmin: boolean
  wafPassed: boolean
}

export interface SecurityOptions {
  requireAuth?: boolean
  requireEmailVerification?: boolean
  requireAdmin?: boolean
  skipWAF?: boolean
  allowUnverifiedEmail?: boolean
}

/**
 * Comprehensive security middleware that applies multiple security layers
 */
export async function applySecurityMiddleware(
  request: NextRequest,
  options: SecurityOptions = {}
): Promise<{
  allowed: boolean
  context?: SecurityContext
  response?: NextResponse
}> {
  
  const context: SecurityContext = {
    isAuthenticated: false,
    isEmailVerified: false,
    isAdmin: false,
    wafPassed: false
  }

  // 1. Apply WAF Protection (unless explicitly skipped)
  if (!options.skipWAF) {
    const wafResult = await protectAPI(request, {
      endpoint: 'security-middleware',
      maxRequests: 200,
      windowMs: 60 * 1000
    })
    if (!wafResult.allowed) {
      return {
        allowed: false,
        response: wafResult.response!
      }
    }
    context.wafPassed = true
  }

  // 2. Extract and validate JWT token
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (token) {
    const tokenValidation = jwtService.validateAccessToken(token)
    
    if (tokenValidation.valid && tokenValidation.payload) {
      // Token is valid, fetch user details
      try {
        const user = await prisma.user.findUnique({
          where: { id: tokenValidation.payload.userId },
          select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            active: true
          }
        })

        if (user && user.active) {
          context.user = user
          context.isAuthenticated = true
          context.isEmailVerified = user.emailVerified
          context.isAdmin = user.role === 'admin'
        }
      } catch (dbError) {
        console.error('❌ [Security] User lookup failed:', dbError)
      }
    } else if (tokenValidation.expired) {
      // Token expired, return specific error for client to refresh
      return {
        allowed: false,
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED',
            message: 'Access token has expired. Please refresh your token.'
          },
          { status: 401 }
        )
      }
    }
  }

  // 3. Check authentication requirement
  if (options.requireAuth && !context.isAuthenticated) {
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Bu işlem için giriş yapmanız gerekiyor.'
        },
        { status: 401 }
      )
    }
  }

  // 4. Check email verification requirement
  if (options.requireEmailVerification && context.isAuthenticated && !context.isEmailVerified) {
    if (!options.allowUnverifiedEmail) {
      return {
        allowed: false,
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Email verification required',
            code: 'EMAIL_VERIFICATION_REQUIRED',
            message: 'Bu işlem için email adresinizi doğrulamanız gerekiyor.',
            user: context.user
          },
          { status: 403 }
        )
      }
    }
  }

  // 5. Check admin requirement
  if (options.requireAdmin && !context.isAdmin) {
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required',
          code: 'ADMIN_REQUIRED',
          message: 'Bu işlem için yönetici yetkisi gerekiyor.'
        },
        { status: 403 }
      )
    }
  }

  return {
    allowed: true,
    context
  }
}

/**
 * Middleware for public endpoints (only WAF protection)
 */
export async function applyPublicSecurity(request: NextRequest) {
  return applySecurityMiddleware(request, { skipWAF: false })
}

/**
 * Middleware for authenticated endpoints
 */
export async function applyAuthSecurity(request: NextRequest) {
  return applySecurityMiddleware(request, { 
    requireAuth: true,
    requireEmailVerification: true
  })
}

/**
 * Middleware for admin endpoints
 */
export async function applyAdminSecurity(request: NextRequest) {
  return applySecurityMiddleware(request, { 
    requireAuth: true,
    requireEmailVerification: true,
    requireAdmin: true
  })
}

/**
 * Middleware for endpoints that allow unverified users (like resend verification)
 */
export async function applyAuthSecurityAllowUnverified(request: NextRequest) {
  return applySecurityMiddleware(request, { 
    requireAuth: true,
    allowUnverifiedEmail: true
  })
}

/**
 * Extract security context from request (for use in API handlers)
 */
export async function getSecurityContext(request: NextRequest): Promise<SecurityContext> {
  const result = await applySecurityMiddleware(request, { skipWAF: true })
  return result.context || {
    isAuthenticated: false,
    isEmailVerified: false,
    isAdmin: false,
    wafPassed: false
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  // Content Security Policy (strict)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.petfendy.com https://maps.googleapis.com https://www.google-analytics.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  return response
}

/**
 * Rate limiting check (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // Clean up old entries periodically
  if (now % 10000 < 100) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
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
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  details: any,
  request: NextRequest,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    method: request.method,
    details
  }

  console.log(`🔒 [Security Event] ${severity.toUpperCase()}: ${event}`, logData)

  // In production, send to SIEM/logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to external logging service (Sentry, DataDog, etc.)
  }
}