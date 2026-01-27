import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  securityMiddleware, 
  checkRateLimit, 
  checkPaymentRateLimit,
  getClientIP, 
  detectSuspiciousActivity, 
  logSecurityEvent,
  isPaymentEndpoint 
} from './middleware-security';

const intlMiddleware = createMiddleware({
  locales: ['tr', 'en'],
  defaultLocale: 'tr'
});

export default function middleware(request: NextRequest) {
  // 1. Security checks
  const clientIP = getClientIP(request);
  const url = request.url;

  // Check for suspicious activity
  const suspiciousCheck = detectSuspiciousActivity(request);
  if (suspiciousCheck.suspicious) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
      url: url,
      details: suspiciousCheck.reason,
      severity: suspiciousCheck.severity,
    });
    
    // Block suspicious requests
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Rate limiting - stricter for payment endpoints
  // More lenient in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isPaymentEndpoint(url)) {
    const maxRequests = isDevelopment ? 200 : 50; // Much higher in dev
    const paymentRateLimit = checkPaymentRateLimit(clientIP, maxRequests);
    if (!paymentRateLimit.allowed) {
      logSecurityEvent({
        type: 'PAYMENT_RATE_LIMIT_EXCEEDED',
        ip: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
        url: url,
        severity: 'high',
      });
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': paymentRateLimit.retryAfter.toString(),
        },
      });
    }
  }

  // General rate limiting - very lenient in development
  const maxGeneralRequests = isDevelopment ? 1000 : 300; // Much higher in dev
  const rateLimit = checkRateLimit(clientIP, maxGeneralRequests);
  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
      url: url,
      severity: 'medium',
    });
    
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
      },
    });
  }

  // 3. Handle locale redirects
  const pathname = request.nextUrl.pathname;
  
  // Only redirect exact root path to /tr/home
  // Let next-intl handle other locale routing
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/tr/home', request.url));
  }

  // 4. Apply internationalization
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

