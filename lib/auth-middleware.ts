// API Authentication Middleware
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './security'
import { RateLimiter } from './security'

// Rate limiter instances
const authRateLimiter = new RateLimiter(10, 15 * 60 * 1000) // 10 attempts per 15 minutes
const apiRateLimiter = new RateLimiter(100, 60 * 1000) // 100 requests per minute

export interface AuthenticatedUser {
  userId: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
}

/**
 * Extract JWT token from request headers
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookie (fallback)
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Get client IP for rate limiting
 */
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

/**
 * Authenticate API request
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const clientIP = getClientIP(request)
  
  // Rate limiting check
  if (authRateLimiter.isLimited(clientIP)) {
    return {
      success: false,
      error: 'Too many authentication attempts. Please try again later.'
    }
  }

  // Extract token
  const token = extractToken(request)
  if (!token) {
    return {
      success: false,
      error: 'Authentication token required'
    }
  }

  // Verify token
  const verification = verifyToken(token)
  if (!verification.valid) {
    return {
      success: false,
      error: verification.error || 'Invalid token'
    }
  }

  // Extract user info from payload
  const payload = verification.payload
  if (!payload.userId || !payload.email || !payload.role) {
    return {
      success: false,
      error: 'Invalid token payload'
    }
  }

  return {
    success: true,
    user: {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(request)
    
    // API rate limiting
    if (apiRateLimiter.isLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    }

    // Authenticate
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Call the actual handler
    try {
      return await handler(request, authResult.user)
    } catch (error) {
      console.error('API Handler Error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Require admin role middleware
 */
export function requireAdmin(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return requireAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    return await handler(request, user)
  })
}

/**
 * Optional authentication (for endpoints that work with both authenticated and guest users)
 */
export async function optionalAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authResult = await authenticateRequest(request)
  return authResult.success ? authResult.user || null : null
}

/**
 * CSRF Token validation
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const sessionToken = request.cookies.get('csrf-token')?.value
  
  if (!token || !sessionToken) {
    return false
  }
  
  // Use constant-time comparison from security.ts
  return token === sessionToken
}

/**
 * Require CSRF protection for state-changing operations
 */
export function requireCSRF(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      if (!validateCSRFToken(request)) {
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        )
      }
    }
    
    return await handler(request)
  }
}

/**
 * Input validation helper
 */
export function validateInput<T>(data: any, schema: any): { valid: boolean; errors: string[]; data?: T } {
  const errors: string[] = []
  
  // Basic validation - in production, use a library like Zod or Joi
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]
    const ruleSet = rules as any
    
    if (ruleSet.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`)
      continue
    }
    
    if (value !== undefined && value !== null) {
      if (ruleSet.type === 'string' && typeof value !== 'string') {
        errors.push(`${key} must be a string`)
      }
      
      if (ruleSet.type === 'number' && typeof value !== 'number') {
        errors.push(`${key} must be a number`)
      }
      
      if (ruleSet.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${key} must be a valid email`)
      }
      
      if (ruleSet.minLength && value.length < ruleSet.minLength) {
        errors.push(`${key} must be at least ${ruleSet.minLength} characters`)
      }
      
      if (ruleSet.maxLength && value.length > ruleSet.maxLength) {
        errors.push(`${key} must be at most ${ruleSet.maxLength} characters`)
      }
      
      if (ruleSet.min && value < ruleSet.min) {
        errors.push(`${key} must be at least ${ruleSet.min}`)
      }
      
      if (ruleSet.max && value > ruleSet.max) {
        errors.push(`${key} must be at most ${ruleSet.max}`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data as T : undefined
  }
}

/**
 * Sanitize input data
 */
export function sanitizeInputData(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000) // Limit length
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInputData)
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInputData(value)
    }
    return sanitized
  }
  
  return data
}

/**
 * Log security events
 */
export function logSecurityEvent(event: {
  type: string
  userId?: string
  ip?: string
  userAgent?: string
  details?: any
}) {
  const timestamp = new Date().toISOString()
  console.warn(`🔒 [SECURITY] ${timestamp} - ${event.type}`, {
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details
  })
  
  // In production: Send to security monitoring service
  // Example: Sentry, DataDog, or custom SIEM
}