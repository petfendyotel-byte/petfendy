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
  if (isPaymentEndpoint(url)) {
    const paymentRateLimit = checkPaymentRateLimit(clientIP);
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

  // General rate limiting
  const rateLimit = checkRateLimit(clientIP);
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

  // 3. Redirect root locale paths to /home
  const pathname = request.nextUrl.pathname;
  
  // Skip redirect if already on /home path
  if (pathname.endsWith('/home')) {
    // Continue to intl middleware
  }
  // Redirect root to /tr/home
  else if (pathname === '/' || pathname === '') {
    const redirectUrl = new URL('/tr/home', request.url);
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }
  // Redirect /tr or /en to /tr/home or /en/home
  else if (pathname === '/tr' || pathname === '/en' || pathname === '/tr/' || pathname === '/en/') {
    const locale = pathname.startsWith('/en') ? 'en' : 'tr';
    const redirectUrl = new URL(`/${locale}/home`, request.url);
    return NextResponse.redirect(redirectUrl, { status: 308 });
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

