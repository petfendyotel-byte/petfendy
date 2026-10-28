import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canonicalRedirectTarget, PATHNAME_HEADER } from './lib/seo';
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
  defaultLocale: 'tr',
  // Prefix is part of the canonical URL for both languages.
  localePrefix: 'always',
  // Unprefixed URLs always map to Turkish. Accept-Language must not send
  // Googlebot to /en while the sitemap lists /tr.
  localeDetection: false,
  // hreflang, including x-default, is rendered in HTML metadata.
  alternateLinks: false,
});

// 308 keeps the method (the permanent form of the previous 307s).
const PERMANENT_REDIRECT = 308;

function requestHost(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-host');
  const raw = (forwarded || request.headers.get('host') || request.nextUrl.host || '').split(',')[0].trim();
  return raw;
}

function requestProtocol(request: NextRequest): string {
  return (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol || 'https').replace(/:$/, '');
}

function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  const secureResponse = securityMiddleware(request);
  secureResponse.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-middleware-')) return;
    response.headers.set(key, value);
  });
  return response;
}

function forwardRequestHeader(response: NextResponse, name: string, value: string) {
  const overrideKey = 'x-middleware-override-headers';
  const current = response.headers.get(overrideKey);
  const names = new Set(
    (current ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  );
  names.add(name);
  response.headers.set(overrideKey, Array.from(names).join(','));
  response.headers.set(`x-middleware-request-${name}`, value);
}

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

  // 3. One permanent hop to the canonical host + path.
  // `/` → `/tr/home` (marketing homepage). `/booking/hotel` → `/tr/booking/hotel`.
  // `/tr` itself stays: that route is the account screen, not the homepage.
  const pathname = request.nextUrl.pathname;
  const redirectTarget = canonicalRedirectTarget({
    host: requestHost(request),
    protocol: requestProtocol(request),
    pathname,
    search: request.nextUrl.search,
  });
  if (redirectTarget) {
    const redirectResponse = NextResponse.redirect(redirectTarget, PERMANENT_REDIRECT);
    applySecurityHeaders(request, redirectResponse);
    redirectResponse.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    return redirectResponse;
  }

  // 4. Apply internationalization
  const response = intlMiddleware(request);

  // 5. Apply security headers and expose the public pathname to metadata.
  if (response) {
    applySecurityHeaders(request, response);
    // Redirects leave the app; only successful responses need the pathname for metadata.
    if (!response.headers.get('location')) {
      forwardRequestHeader(response, PATHNAME_HEADER, pathname);
    }
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    return response;
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export const config = {
  // Match all routes except static files and api
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)']
};
