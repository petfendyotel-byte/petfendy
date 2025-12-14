// Security utilities for Petfendy platform
import jwt from 'jsonwebtoken';

// JWT Secret - MUST be set via environment variable
// In development, generate with: openssl rand -base64 64
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Development-only fallback with warning
    console.warn('⚠️ WARNING: Using development JWT secret. Set JWT_SECRET in .env.local');
    return 'dev-only-jwt-secret-' + (process.env.NODE_ENV || 'development');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
};

const getJWTRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET environment variable is required in production');
    }
    console.warn('⚠️ WARNING: Using development refresh secret. Set JWT_REFRESH_SECRET in .env.local');
    return 'dev-only-refresh-secret-' + (process.env.NODE_ENV || 'development');
  }
  if (secret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
  return secret;
};

// CSRF token generation and validation (browser-safe)
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) return false;
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  return result === 0;
}

// Enhanced input sanitization to prevent XSS
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/<!--/g, "") // Remove HTML comments
    .replace(/-->/g, "")
    .trim()
    .substring(0, 1000); // Limit length to prevent DoS
}

// HTML entity encoding for safe display
export function encodeHTML(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for server-side
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (Turkish format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Password strength validation - Minimum 12 karakter
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) errors.push("Şifre en az 12 karakter olmalıdır")
  if (!/[A-ZÇĞİÖŞÜ]/.test(password)) errors.push("Şifre büyük harf içermelidir")
  if (!/[a-zçğıöşü]/.test(password)) errors.push("Şifre küçük harf içermelidir")
  if (!/[0-9]/.test(password)) errors.push("Şifre rakam içermelidir")
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Şifre özel karakter içermelidir")
  
  // Tekrar eden karakter kontrolü
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Şifre üç veya daha fazla tekrar eden karakter içermemelidir")
  }

  return { valid: errors.length === 0, errors }
}

const isServer = typeof window === 'undefined'

// IMPORTANT: Password hashing MUST only be done on the server
// These functions are removed to prevent bundling issues with native modules
// Use security-server.ts directly in API routes or server components

// Generate secure JWT token
export function generateToken(userId: string, email: string, role: string = 'user'): string {
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
  };

  return jwt.sign(payload, getJWTSecret(), { algorithm: 'HS256' });
}

// Generate refresh token (longer expiry)
export function generateRefreshToken(userId: string): string {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  return jwt.sign(payload, getJWTRefreshSecret(), { algorithm: 'HS256' });
}

// Verify JWT token
export function verifyToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const payload = jwt.verify(token, getJWTSecret());
    return { valid: true, payload };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const payload = jwt.verify(token, getJWTRefreshSecret());
    return { valid: true, payload };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isLimited(key: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs })
      return false
    }

    if (record.count >= this.maxAttempts) {
      return true
    }

    record.count++
    return false
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}