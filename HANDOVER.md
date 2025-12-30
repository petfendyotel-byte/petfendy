# 🐾 Petfendy Project Handover Documentation

**Prepared:** January 2025  
**Project:** Petfendy - Evcil Hayvan Oteli ve Köpek Eğitim Merkezi  
**Stack:** Next.js 16, TypeScript, Tailwind CSS, Shadcn/ui  
**GitHub:** https://github.com/cetinibs/petfendy

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Architecture](#project-architecture)
3. [Module Interactions](#module-interactions)
4. [Third-Party Integrations](#third-party-integrations)
5. [Security Audit & Vulnerabilities](#security-audit--vulnerabilities)
6. [Developer Onboarding](#developer-onboarding)
7. [Deployment Pipeline](#deployment-pipeline)
8. [Next Steps & Priorities](#next-steps--priorities)

---

## 1. Executive Summary

### What is Petfendy?

Petfendy is a **full-stack pet hotel and training center reservation platform** built for Ankara-based business. The system handles:
- 🏨 **Hotel room reservations** for pets (dogs, cats, birds, rabbits)
- 🚕 **Pet taxi service** (inter-city transport)
- 💳 **Secure payment processing** (PCI DSS compliant architecture)
- 📧 **Email confirmations** and invoicing
- 👥 **User authentication** with email verification
- 🔐 **Admin dashboard** for order management, pricing, and reports

### Key Statistics

- **Lines of Code:** ~20,450+
- **Components:** 100+ React components
- **Dependencies:** 70+ npm packages
- **Languages:** TypeScript, JavaScript
- **Supported Locales:** Turkish (default), English

### Current State

✅ **Production-Ready Features:**
- Complete UI with modern design
- Multi-language support (TR/EN)
- Guest checkout flow
- Admin dashboard with reporting
- Security middleware (rate limiting, XSS/CSRF protection)
- Mock payment gateway (ready for real integration)

⚠️ **Currently Mock:**
- Database (using localStorage)
- Email service
- Payment processing
- Authentication backend

---

## 2. Project Architecture

### 2.1 Directory Structure

```
petfendy.com/
├── app/
│   ├── [locale]/               # Internationalized routes
│   │   ├── layout.tsx          # Root layout (i18n, auth context)
│   │   ├── page.tsx            # Main dashboard (login/user panel)
│   │   └── home/page.tsx       # Public homepage (guest reservations)
│   └── globals.css             # Global styles
│
├── components/
│   ├── auth-context.tsx        # ⭐ Authentication provider
│   ├── admin-dashboard.tsx      # ⭐ Admin panel
│   ├── cart.tsx                # Shopping cart management
│   ├── payment-modal.tsx       # ⭐ PCI DSS payment form
│   ├── hotel-booking.tsx       # Hotel reservation UI
│   ├── taxi-booking.tsx        # Taxi service UI
│   ├── user-profile.tsx        # User profile & reservations
│   ├── login-form.tsx         # Login component
│   ├── register-form.tsx       # Registration (email verification)
│   └── ui/                     # 50+ Shadcn components
│
├── lib/
│   ├── types.ts                # ⭐ TypeScript interfaces
│   ├── security.ts             # ⭐ JWT, bcrypt, validation
│   ├── encryption.ts            # ⭐ AES-256, PCI DSS
│   ├── storage.ts              # LocalStorage management
│   ├── payment-service-secure.ts  # Payment gateway (mock)
│   ├── email-service.ts        # Email sending (mock)
│   └── mock-data.ts            # Development data
│
├── i18n/
│   ├── request.ts              # next-intl configuration
│   └── messages/
│       ├── tr.json            # Turkish translations
│       └── en.json            # English translations
│
├── middleware.ts                # ⭐ Main middleware
├── middleware-security.ts      # ⭐ Security layer
├── public/
│   └── petfendy-logo.svg      # Brand logo
│
├── SECURITY.md                 # Security documentation
├── SECURITY-SUMMARY.md         # Security summary
├── README.md                   # Project overview
└── package.json                # Dependencies & scripts
```

### 2.2 Technology Stack

#### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Utility-first styling
- **Shadcn/ui**: 50+ pre-built accessible components
- **next-intl**: Internationalization (TR/EN)
- **Lucide React**: Icon library

#### Security
- **bcryptjs**: Password hashing (12 rounds)
- **jsonwebtoken**: JWT authentication
- **crypto-js**: AES-256 encryption
- **custom middleware**: Rate limiting, security headers

#### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **TypeScript**: Type checking

#### Export/Services (Mock)
- **xlsx**: Excel export
- **jspdf**: PDF export
- **Custom email service**: Mock implementation

### 2.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Request                           │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              middleware.ts (Security Layer)                │
│  • Rate limiting (100 req/15min per IP)                   │
│  • Suspicious activity detection                          │
│  • Security headers (CSP, HSTS, X-Frame-Options)          │
│  • CORS configuration                                      │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         next-intl Middleware (Localization)                │
│  • Route localization (/tr/, /en/)                        │
│  • Message loading                                         │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Auth Provider Context                          │
│  • JWT token management                                    │
│  • User state management                                   │
│  • Session persistence (sessionStorage)                   │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Page Components                                │
│  • Hotel/Taxi booking UI                                   │
│  • Cart management                                          │
│  • Payment processing                                       │
│  • Admin dashboard                                          │
└────────────────────────┬──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          lib/storage.ts (Data Layer)                        │
│  • localStorage (development)                              │
│  • Ready for PostgreSQL migration                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Module Interactions

### 3.1 Authentication Flow

**Entry Points:**
- `app/[locale]/page.tsx` → Login/Register
- `app/[locale]/home/page.tsx` → Guest homepage

**Core Modules:**
```
components/auth-context.tsx
  ├── lib/security.ts (JWT generation, bcrypt hashing)
  ├── lib/storage.ts (Token persistence)
  └── components/login-form.tsx (Login UI)
```

**Flow:**
1. User enters credentials → `login-form.tsx`
2. Input validation → `lib/security.ts` (email/phone format)
3. Mock authentication → `mock-data.ts`
4. Password verification → `bcryptjs.compare()`
5. JWT generation → `jsonwebtoken.sign()`
6. Token storage → `sessionStorage` via `lib/storage.ts`
7. Context update → `auth-context.tsx` propagates user state
8. Redirect → Dashboard or cart

### 3.2 Reservation Flow

**Hotel Booking:**
```
app/[locale]/home/page.tsx
  └── User selects room & dates
       └── Calculates price (nights × rate)
            └── Adds to cart (lib/storage.ts)
                 └── Toast notification
                      └── Optional login redirect
```

**Taxi Booking:**
```
app/[locale]/home/page.tsx
  └── User selects service & cities
       └── Calculates distance & price
            └── Adds to cart
                 └── Navigation to cart
```

### 3.3 Payment Flow

```
components/cart.tsx
  └── User clicks "Siparişi Tamamla"
       ├── Authentication check (redirect if not logged in)
       └── Opens payment-modal.tsx
            ├── Card input validation (Luhn algorithm)
            ├── CVV validation (3-4 digits)
            ├── Invoice type selection (individual/corporate)
            └── Calls lib/payment-service-secure.ts
                 ├── Mock payment processing
                 ├── Order creation
                 ├── Email confirmation (lib/email-service.ts)
                 └── Cart cleared (lib/storage.ts)
```

### 3.4 Admin Dashboard Flow

```
components/admin-dashboard.tsx
  ├── Orders management
  │   └── Filter/pagination/export (Excel, CSV, PDF)
  ├── Room management (CRUD)
  ├── Taxi service management (CRUD)
  ├── Dynamic pricing (date-based room prices)
  └── Reports & analytics
       └── Revenue calculations (daily/weekly/monthly)
```

---

## 4. Third-Party Integrations

### 4.1 Currently Integrated (Mock)

| Service | Purpose | Implementation | Status |
|---------|---------|----------------|---------|
| **crypto-js** | AES-256 encryption | `lib/encryption.ts` | ⚠️ Needs real key management |
| **bcryptjs** | Password hashing | `lib/security.ts` | ✅ Production-ready |
| **jsonwebtoken** | Authentication | `lib/security.ts` | ⚠️ Hard-coded secret |
| **xlsx** | Excel export | `components/admin-dashboard.tsx` | ✅ Working |
| **jspdf** | PDF export | `components/admin-dashboard.tsx` | ✅ Working |
| **@vercel/analytics** | Analytics | `app/[locale]/layout.tsx` | ✅ Deployed on Vercel |

### 4.2 Environment Variables Required

**Current (Development):**
```bash
# JWT Secrets (HARD-CODED - MUST CHANGE!)
JWT_SECRET=petfendy-jwt-secret-change-in-production
JWT_REFRESH_SECRET=petfendy-refresh-secret-change-in-production

# Encryption Key (HARD-CODED - MUST CHANGE!)
NEXT_PUBLIC_ENCRYPTION_KEY=petfendy-secret-key-change-in-production-2025
```

**Production (Required Before Launch):**
```bash
# Generate with: openssl rand -base64 32
JWT_SECRET=<generate-random-64-char-string>
JWT_REFRESH_SECRET=<generate-random-64-char-string>

# Generate with: openssl rand -base64 32
NEXT_PUBLIC_ENCRYPTION_KEY=<generate-random-64-char-string>

# Database
DATABASE_URL=postgresql://user:pass@host:5432/petfendy

# Email Service (SendGrid, Resend, or AWS SES)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@petfendy.com

# Payment Gateway (İyzico, PayTR, Stripe)
PAYMENT_API_KEY=xxx
PAYMENT_SECRET_KEY=xxx
PAYMENT_MERCHANT_ID=xxx

# Redis (for rate limiting & sessions)
REDIS_URL=redis://localhost:6379

# Optional: Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 4.3 Vendor Lock-In Assessment

**✅ Low Lock-In:**
- `bcryptjs` → Can migrate to Argon2 or native Node crypto
- `jsonwebtoken` → Can migrate to PASETO or OAuth2
- `crypto-js` → Can replace with Node crypto (better performance)
- `xlsx` / `jspdf` → Standard formats, easy to swap

**⚠️ Medium Lock-In:**
- `@radix-ui/*` (50+ components) → Would require UI rewrite
- `next-intl` → Message file structure tied to library
- `shadcn/ui` → Tailored to this design system

**🔴 High Lock-In:**
- **Next.js 16** → Hard to migrate to another framework
- **Vercel Analytics** → Can be disabled/removed
- **localStorage** → Client-side only, not production-ready

### 4.4 Migration Risks

**Database Migration:**
- Current: `localStorage` (browser only)
- Target: PostgreSQL, MongoDB, or Supabase
- Risk: **HIGH** - Requires complete data layer rewrite
- Estimated effort: 2-3 weeks

**Authentication Migration:**
- Current: Mock JWT with localStorage
- Target: Auth0, Clerk, or Firebase Auth
- Risk: **MEDIUM** - JWT structure compatible
- Estimated effort: 1 week

**Payment Gateway:**
- Current: Mock implementation
- Target: İyzico, PayTR, or Stripe
- Risk: **MEDIUM** - Well-defined interface
- Estimated effort: 2-3 weeks

---

## 5. Security Audit & Vulnerabilities

### 5.1 ⚠️ CRITICAL Issues (Fix Immediately)

#### 1. Hard-Coded Secrets (HIGH RISK)

**Location:**
```typescript
// lib/security.ts:6
const JWT_SECRET = process.env.JWT_SECRET || 'petfendy-jwt-secret-change-in-production';

// lib/encryption.ts:7
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'petfendy-secret-key-change-in-production-2025';
```

**Risk:** Anyone can forge tokens, decrypt data

**Fix:**
```bash
# Generate new secrets
openssl rand -base64 32  # Run 3 times for each secret

# Add to .env.local (NEVER commit!)
JWT_SECRET=<generated-secret-1>
JWT_REFRESH_SECRET=<generated-secret-2>
NEXT_PUBLIC_ENCRYPTION_KEY=<generated-secret-3>
```

#### 2. localStorage Storage (Data Loss Risk)

**Location:** `lib/storage.ts`

**Risk:**
- Data lost on cache clear
- Not shared across devices
- No backend persistence

**Fix:** Migrate to PostgreSQL with Prisma or Supabase

#### 3. Client-Side Encryption Key Exposure

**Location:** `lib/encryption.ts:7`
```typescript
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '...'
```

**Risk:** `NEXT_PUBLIC_*` variables are exposed in browser bundle

**Fix:** Move encryption to API routes (server-side only)

#### 4. TypeScript Build Errors Ignored

**Location:** `next.config.mjs:7`
```javascript
typescript: {
  ignoreBuildErrors: true,  // ⚠️ CRITICAL
}
```

**Risk:** Potential runtime errors slip through

**Fix:**
```javascript
typescript: {
  ignoreBuildErrors: false,
}
```
Then fix all TypeScript errors

### 5.2 🔴 HIGH Priority Security Fixes

#### 5. Missing HTTPS Enforcement
- No redirect to HTTPS in production
- Add redirect in `middleware.ts`

#### 6. No Cookie Security Flags
- JWT stored in `sessionStorage`
- Should use HttpOnly cookies
- Need SameSite and Secure flags

#### 7. Rate Limiting in Memory
- No persistence across server restarts
- Vulnerable to cluster deployment
- Migrate to Redis

#### 8. Input Validation Gaps
- Not all inputs sanitized
- Phone validation only Turkish format
- Email validation basic regex

### 5.3 🟡 MEDIUM Priority Issues

#### 9. Dependency Vulnerabilities

Check with:
```bash
npm audit
npm audit fix
```

Known issues:
- `bcryptjs@3.0.2` - Old version, upgrade to 3.1.0+
- `react@19.2.0` - Very recent, monitor for bugs
- Peer dependency conflicts with `vaul@0.9.9`

#### 10. CSP Too Permissive

**Location:** `middleware-security.ts:35-47`
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'"  // ❌ TOO LAX
"style-src 'self' 'unsafe-inline'"                 // ❌ TOO LAX
```

**Fix:** Use nonces for inline scripts

#### 11. No SQL Injection Protection
- Mock data doesn't need it
- Must add when migrating to real DB
- Use parameterized queries (Prisma/TypeORM)

#### 12. Missing Audit Logging
- No logs for payment attempts
- No audit trail for admin actions
- Add centralized logging (Winston, Pino)

### 5.4 🟢 LOW Priority Security Improvements

#### 13. Brute Force Protection
- Basic rate limiting exists
- Should add account lockout after 5 failed attempts
- Re-captcha on login/register

#### 14. Password Policy Enforcement
- Validator exists but not enforced everywhere
- Add visual strength meter
- Force password change on compromise

#### 15. Session Management
- Token expiration: 24 hours (acceptable)
- No refresh token rotation
- Add remember-me functionality

---

## 6. Developer Onboarding

### 6.1 Prerequisites

**Required:**
- Node.js 18+ (LTS recommended)
- npm 10+ or pnpm 8+
- Git
- VS Code (recommended)
- PostgreSQL 14+ (for production)

**Optional:**
- Redis (for rate limiting)
- Docker (for local development)

### 6.2 Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/cetinibs/petfendy.git
cd petfendy

# 2. Install dependencies
npm install --legacy-peer-deps
# OR
pnpm install --legacy-peer-deps

# 3. Create environment file
cp .env.example .env.local

# 4. Generate secrets
openssl rand -base64 32  # Copy output to JWT_SECRET
openssl rand -base64 32  # Copy output to JWT_REFRESH_SECRET
openssl rand -base64 32  # Copy output to NEXT_PUBLIC_ENCRYPTION_KEY

# 5. Edit .env.local with generated secrets
# (Don't commit this file!)

# 6. Start development server
npm run dev

# 7. Open browser
# http://localhost:3000
```

### 6.3 Common Issues & Solutions

#### Issue 1: Port Already in Use
```bash
# Kill node processes
taskkill /F /IM node.exe 2>$null  # Windows
# OR
pkill -f node  # Linux/Mac
```

#### Issue 2: TypeScript Errors
```bash
# Current config ignores errors
# To see actual errors:
npm run lint
```

#### Issue 3: Peer Dependency Conflicts
```bash
# Already handled with --legacy-peer-deps
# If issues persist:
npm install --force
```

#### Issue 4: Build Fails
```bash
# Clear Next.js cache
rm -rf .next  # Linux/Mac
# OR
Remove-Item -Recurse -Force .next  # Windows
npm run dev
```

### 6.4 Available Scripts

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint (may fail)
```

### 6.5 Development Workflow

1. **Create feature branch**
```bash
git checkout -b feature/new-feature
```

2. **Make changes**
   - Edit files in `components/`, `lib/`, or `app/`
   - Run `npm run dev` to see changes live

3. **Test**
   - Manual testing in browser
   - Check console for errors

4. **Commit & Push**
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 6.6 Testing Accounts

**Admin:**
```
Email: admin@petfendy.com
Password: admin123
```

**User:**
```
Email: user@example.com
Password: password123
```

**Test Payment:**
```
Card: 4242 4242 4242 4242
Date: 12/30
CVV: 123
```

---

## 7. Deployment Pipeline

### 7.1 Current Setup

**Platform:** Vercel (assumed from `@vercel/analytics`)

**Deployment Flow:**
```
Git push to main
  ↓
Vercel auto-deploys
  ↓
Runs: npm run build
  ↓
Static assets + SSR pages
```

### 7.2 Pre-Deployment Checklist

```bash
[ ] All hard-coded secrets removed
[ ] Environment variables set in Vercel dashboard
[ ] Database connection tested
[ ] Email service configured
[ ] Payment gateway API keys added
[ ] HTTPS enforced
[ ] Analytics configured
[ ] Error monitoring enabled (Sentry)
[ ] Backup strategy in place
[ ] Security headers verified
[ ] Rate limiting production values set
[ ] CDN configured (if using)
```

### 7.3 Environment Configuration (Vercel)

**Required Variables:**
```
JWT_SECRET=
JWT_REFRESH_SECRET=
NEXT_PUBLIC_ENCRYPTION_KEY=
DATABASE_URL=
SENDGRID_API_KEY=
FROM_EMAIL=
PAYMENT_API_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_MERCHANT_ID=
SENTRY_DSN=
```

### 7.4 Build Configuration

**next.config.mjs** needs updates:
```javascript
// Production config
const nextConfig = {
  // Remove this line after fixing TS errors:
  typescript: {
    ignoreBuildErrors: true,  // ❌ Remove
  },
  
  images: {
    unoptimized: true,  // ✅ Keep for Vercel
  },
  
  // Add security headers in production
  async headers() {
    return [{
      source: '/:path*',
      headers: securityHeaders
    }]
  }
}
```

### 7.5 Infrastructure Requirements

**Current (Development):**
- Static hosting (Vercel/Netlify)
- Client-side storage (localStorage)
- No database required

**Production (Recommended):**
- **Web:** Vercel, Netlify, or AWS Amplify
- **Database:** PostgreSQL (Supabase, Railway, Neon)
- **Cache:** Redis (Upstash, Railway)
- **Email:** SendGrid, Resend, AWS SES
- **Payment:** İyzico, PayTR, or Stripe
- **Monitoring:** Sentry, LogRocket
- **CDN:** Cloudflare or Vercel Edge

**Estimated Monthly Cost (Production):**
- Vercel Hobby: $0-20
- Database (Supabase): $0-25
- Redis (Upstash): $0-10
- Email (SendGrid): $0-15
- Payment Gateway: 2.9% + $0.30 per transaction
- **Total:** $35-70/month + transaction fees

---

## 8. Next Steps & Priorities

### 8.1 🚨 MUST-FIX Before Production

**Critical Security (Week 1)**
1. ✅ Generate new secrets (JWT, encryption keys)
2. ✅ Add `.env.local` to `.gitignore`
3. ✅ Remove hard-coded secrets from code
4. ✅ Add HTTPS redirect in production
5. ✅ Fix TypeScript config (`ignoreBuildErrors: false`)
6. ✅ Migrate from localStorage to database
7. ✅ Add proper session management (HttpOnly cookies)

**Estimated Time:** 1-2 weeks

### 8.2 📅 Short-Term Improvements (Month 1)

**Backend Migration**
1. Set up PostgreSQL (Supabase recommended)
2. Create schema based on `lib/types.ts`
3. Migrate from localStorage to Prisma ORM
4. Add API routes in `app/api/`
5. Implement real authentication flow

**Payment Integration**
1. Choose payment gateway (İyzico/PayTR/Stripe)
2. Integrate real payment API
3. Remove mock payment service
4. Add webhook handling
5. Implement refund logic

**Email Service**
1. Integrate SendGrid or Resend
2. Create email templates
3. Add transaction emails
4. Set up SPF/DKIM records

**Estimated Time:** 3-4 weeks

### 8.3 📅 Mid-Term Enhancements (Month 2-3)

**Performance**
1. Add Redis for caching & sessions
2. Implement API rate limiting
3. Add CDN for static assets
4. Optimize bundle size
5. Add image optimization

**Monitoring**
1. Set up Sentry for error tracking
2. Add application logging (Winston/Pino)
3. Configure uptime monitoring
4. Create dashboard for metrics

**Features**
1. Add SMS notifications
2. Implement real-time order updates (WebSocket)
3. Add admin notifications for new orders
4. Create customer support chat

**Estimated Time:** 4-6 weeks

### 8.4 📅 Long-Term Roadmap (Months 3-6)

**Scale & Reliability**
1. Add database replicas
2. Implement horizontal scaling
3. Add load balancing
4. Create disaster recovery plan
5. Set up automated backups

**User Experience**
1. Mobile app (React Native)
2. Push notifications
3. Loyalty program
4. Referral system

**Business Features**
1. Dynamic pricing algorithm
2. Revenue forecasting
3. Customer analytics
4. Multi-branch support

**Estimated Time:** 6+ months

---

## 9. Key Files Reference

### Critical Files to Understand

| File | Purpose | Developer |
|------|---------|-----------|
| `lib/types.ts` | Data models | All |
| `lib/security.ts` | Authentication | Backend |
| `lib/encryption.ts` | Card encryption | Backend |
| `components/auth-context.tsx` | User state | Frontend |
| `components/payment-modal.tsx` | PCI DSS form | Frontend |
| `middleware.ts` | Request pipeline | All |
| `middleware-security.ts` | Security headers | Backend |
| `lib/storage.ts` | Data persistence | All |

### Quick Reference Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build               # Production build
npm run lint                # Check code quality

# Git
git pull origin main        # Update code
git push origin feature/X   # Deploy feature

# Database (when implemented)
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Run migrations

# Testing (to be added)
npm test                    # Run unit tests
npm run test:e2e            # E2E tests
```

---

## 10. Support & Resources

**Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Security:**
- [OWASP Top 10](https://owasp.org/Top10/)
- [Next.js Security](https://nextjs.org/docs/going-to-production)

**Deployment:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 📞 Contact

**Project Owner:** [Your Name]  
**Email:** [Your Email]  
**GitHub:** https://github.com/cetinibs/petfendy

---

**Last Updated:** January 2025  
**Documentation Version:** 1.0  
**Project Status:** Ready for Security Fixes & Production Migration

