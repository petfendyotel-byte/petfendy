import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityMiddleware, checkRateLimit, getClientIP, detectSuspiciousActivity, logSecurityEvent } from './middleware-security';

const intlMiddleware = createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export default function middleware(request: NextRequest) {
  // 1. Security checks
  const clientIP = getClientIP(request);
  
  // Check for suspicious activity
  const suspiciousCheck = detectSuspiciousActivity(request);
  if (suspiciousCheck.suspicious) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
      url: request.url,
      details: suspiciousCheck.reason,
    });
    
    // Block suspicious requests
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Rate limiting
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
      url: request.url,
    });
    
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
      },
    });
  }

  // 3. Apply internationalization
  const response = intlMiddleware(request);

  // 4. Apply security headers
  const secureResponse = securityMiddleware(request);
  
  // Merge headers from both middlewares
  if (response) {
    secureResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    // Add rate limit info
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    
    return response;
  }

  return secureResponse;
}

export const config = {
  // Match all routes except static files and api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)']
};

