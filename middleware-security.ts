// Security Middleware for Next.js
// Implements security headers and protections

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Allowed origins for CORS - configure via environment variable
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Default allowed origins based on environment
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://petfendy.com',
      'https://www.petfendy.com',
    ];
  }

  // Development/Test environment
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
  ];
};

// Validate origin against allowed list
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

// Security middleware
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get('origin');

  // 1. Security Headers (HTTPS enforcement, XSS protection, etc.)

  // Strict-Transport-Security: Force HTTPS for 1 year
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options: Allow same-origin and Google Maps iframes
  // Note: SAMEORIGIN allows iframes from same origin, which is needed for Google Maps embed
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection: Enable XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content-Security-Policy: Prevent XSS and injection attacks
  // PayTR iframe ve Google Maps için izinler eklendi
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.googleapis.com https://*.gstatic.com https://www.paytr.com https://*.paytr.com",
    "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://www.paytr.com https://*.paytr.com",
    "img-src 'self' data: https: https://*.google.com https://*.googleapis.com https://*.gstatic.com https://www.paytr.com https://*.paytr.com",
    "font-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://www.paytr.com",
    "connect-src 'self' https: https://*.google.com https://*.googleapis.com https://www.paytr.com https://*.paytr.com",
    "frame-src 'self' https://*.google.com https://www.google.com https://www.paytr.com https://*.paytr.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' https://www.paytr.com https://*.paytr.com",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Permissions-Policy: Control browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // 2. CORS Headers - Only allow specific origins (no wildcard!)
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  // If origin not allowed, don't set CORS headers (browser will block)

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Max-Age', '86400');

  // 3. Remove sensitive server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Rate limiting function
 * Prevents brute force attacks
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries
  if (now % 1000 === 0) { // Every ~1000ms
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (when behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP
  return request.ip || 'unknown';
}

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
} {
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;
  const pathname = new URL(url).pathname;

  // PayTR webhook ve API endpoint'leri için bot kontrolünü atla
  const trustedPaths = [
    '/api/payment/webhook',
    '/api/payment/paytr',
  ];
  
  if (trustedPaths.some(path => pathname.includes(path))) {
    return { suspicious: false };
  }

  // Check for common bot patterns (exclude payment gateways)
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ];

  // PayTR ve diğer ödeme sistemlerinin user-agent'larını beyaz listeye al
  const trustedAgents = [
    /paytr/i,
    /iyzico/i,
    /stripe/i,
  ];

  if (trustedAgents.some(pattern => pattern.test(userAgent))) {
    return { suspicious: false };
  }

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Bot detected' };
  }

  // Check for SQL injection patterns in URL
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  ];

  if (sqlPatterns.some(pattern => pattern.test(url))) {
    return { suspicious: true, reason: 'SQL injection attempt' };
  }

  // Check for XSS patterns in URL
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  if (xssPatterns.some(pattern => pattern.test(decodeURIComponent(url)))) {
    return { suspicious: true, reason: 'XSS attempt' };
  }

  return { suspicious: false };
}

/**
 * Log security event
 */
export function logSecurityEvent(event: {
  type: string;
  ip: string;
  userAgent?: string;
  url?: string;
  details?: string;
}) {
  const timestamp = new Date().toISOString();
  console.warn(`🚨 [SECURITY] ${timestamp} - ${event.type}`, {
    ip: event.ip,
    userAgent: event.userAgent,
    url: event.url,
    details: event.details,
  });

  // In production: Send to security monitoring service
  // Example: Send to Sentry, DataDog, or custom logging service
}

