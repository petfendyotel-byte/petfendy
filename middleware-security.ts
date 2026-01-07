// Security Middleware for Next.js
// Implements PCI-DSS compliant security headers and protections
// For Virtual POS (Sanal POS) integration requirements

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Stricter rate limiting for payment endpoints
const paymentRateLimitStore = new Map<string, { count: number; resetTime: number }>();

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

  // 1. PCI-DSS Compliant Security Headers

  // Strict-Transport-Security: Force HTTPS for 2 years (PCI-DSS requirement)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // X-Frame-Options: Prevent clickjacking (PCI-DSS 6.5.9)
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection: Enable XSS filter (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy: Control referrer information for payment security
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // X-Permitted-Cross-Domain-Policies: Prevent Adobe Flash/PDF cross-domain
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // X-Download-Options: Prevent IE from executing downloads
  response.headers.set('X-Download-Options', 'noopen');

  // Cache-Control: Prevent caching of sensitive data (PCI-DSS requirement)
  if (request.url.includes('/checkout') || request.url.includes('/payment') || request.url.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Content-Security-Policy: Strict CSP for PCI-DSS compliance
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.paytr.com",
    "style-src 'self' 'unsafe-inline' https://*.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://*.google.com https://www.google.com https://maps.google.com https://maps.googleapis.com https://*.paytr.com https://*.openstreetmap.org https://www.openstreetmap.org",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' https://*.paytr.com",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Permissions-Policy: Restrict browser features (enhanced for payment security)
  // Note: Only using standardized features supported by modern browsers
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(self), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()'
  );

  // Cross-Origin headers for additional security
  // Note: Cross-Origin-Embedder-Policy is relaxed for pages with Google Maps iframe
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Only apply strict COEP on payment pages, not on pages with external embeds like maps
  const isPaymentPage = request.url.includes('/checkout') || request.url.includes('/payment');
  if (isPaymentPage) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  } else {
    response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }

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
 * Prevents brute force attacks (PCI-DSS 6.5.10)
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Clean up old entries periodically
  if (now % 10000 < 100) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
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
 * Stricter rate limiting for payment endpoints
 * PCI-DSS requirement for protecting cardholder data
 */
export function checkPaymentRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute - very strict for payment
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const record = paymentRateLimitStore.get(ip);

  // Clean up old entries
  if (now % 5000 < 100) {
    for (const [key, value] of paymentRateLimitStore.entries()) {
      if (now > value.resetTime) {
        paymentRateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    paymentRateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, retryAfter: 0 };
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

  // Fallback
  return 'unknown';
}

/**
 * Detect suspicious patterns (PCI-DSS 6.5 - Injection Flaws)
 */
export function detectSuspiciousActivity(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
} {
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;
  const method = request.method;

  // Block requests without User-Agent (potential automated attacks)
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, reason: 'Missing or invalid User-Agent', severity: 'medium' };
  }

  // Check for malicious bot patterns
  const maliciousBotPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /gobuster/i,
    /dirbuster/i,
    /wpscan/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /burpsuite/i,
  ];

  if (maliciousBotPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Malicious scanner detected', severity: 'critical' };
  }

  // Check for SQL injection patterns in URL (PCI-DSS 6.5.1)
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /union[\s\+]+select/i,
    /select[\s\+]+.*[\s\+]+from/i,
    /insert[\s\+]+into/i,
    /drop[\s\+]+table/i,
    /delete[\s\+]+from/i,
    /update[\s\+]+.*[\s\+]+set/i,
    /exec[\s\+]+/i,
    /execute[\s\+]+/i,
    /xp_cmdshell/i,
    /sp_executesql/i,
  ];

  const decodedUrl = decodeURIComponent(url);
  if (sqlPatterns.some(pattern => pattern.test(decodedUrl))) {
    return { suspicious: true, reason: 'SQL injection attempt', severity: 'critical' };
  }

  // Check for XSS patterns (PCI-DSS 6.5.7)
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<svg[\s\S]*?onload/gi,
    /expression\s*\(/gi,
  ];

  if (xssPatterns.some(pattern => pattern.test(decodedUrl))) {
    return { suspicious: true, reason: 'XSS attempt', severity: 'critical' };
  }

  // Check for path traversal (PCI-DSS 6.5.8)
  const pathTraversalPatterns = [
    /\.\.\//g,
    /\.\.%2f/gi,
    /\.\.%5c/gi,
    /%2e%2e%2f/gi,
    /%2e%2e\//gi,
    /\.\.%255c/gi,
    /etc\/passwd/gi,
    /etc\/shadow/gi,
    /windows\/system32/gi,
  ];

  if (pathTraversalPatterns.some(pattern => pattern.test(decodedUrl))) {
    return { suspicious: true, reason: 'Path traversal attempt', severity: 'high' };
  }

  // Check for command injection
  const cmdInjectionPatterns = [
    /;\s*ls/gi,
    /;\s*cat/gi,
    /;\s*rm/gi,
    /;\s*wget/gi,
    /;\s*curl/gi,
    /\|\s*cat/gi,
    /`.*`/g,
    /\$\(.*\)/g,
  ];

  if (cmdInjectionPatterns.some(pattern => pattern.test(decodedUrl))) {
    return { suspicious: true, reason: 'Command injection attempt', severity: 'critical' };
  }

  // Check for LDAP injection
  const ldapPatterns = [
    /\)\(\|/gi,
    /\)\(\&/gi,
    /\*\)\(/gi,
  ];

  if (ldapPatterns.some(pattern => pattern.test(decodedUrl))) {
    return { suspicious: true, reason: 'LDAP injection attempt', severity: 'high' };
  }

  // Block suspicious HTTP methods
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(method)) {
    return { suspicious: true, reason: `Blocked HTTP method: ${method}`, severity: 'medium' };
  }

  return { suspicious: false };
}

/**
 * Log security event (PCI-DSS 10.2 - Audit Trails)
 */
export function logSecurityEvent(event: {
  type: string;
  ip: string;
  userAgent?: string;
  url?: string;
  details?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}) {
  const timestamp = new Date().toISOString();
  const severityEmoji = {
    low: '⚠️',
    medium: '🟠',
    high: '🔴',
    critical: '🚨',
  };

  const emoji = event.severity ? severityEmoji[event.severity] : '🚨';

  console.warn(`${emoji} [SECURITY] ${timestamp} - ${event.type}`, {
    ip: event.ip,
    userAgent: event.userAgent,
    url: event.url,
    details: event.details,
    severity: event.severity || 'unknown',
  });

  // In production: Send to security monitoring service (SIEM)
  // PCI-DSS requires centralized logging
  // Example: Send to Sentry, DataDog, Splunk, or custom SIEM
}

/**
 * Validate and sanitize input (PCI-DSS 6.5.1)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Check if request is for payment endpoint
 */
export function isPaymentEndpoint(url: string): boolean {
  const paymentPaths = [
    '/checkout',
    '/payment',
    '/api/payment',
    '/api/checkout',
    '/api/order',
  ];

  return paymentPaths.some(path => url.includes(path));
}

/**
 * Generate CSRF token (PCI-DSS 6.5.9)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Mask sensitive data for logging (PCI-DSS 3.4)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '****';
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

