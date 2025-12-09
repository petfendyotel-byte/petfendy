// Advanced Encryption Service for Sensitive Data
// PCI DSS Compliant - DO NOT store actual card data in production!

import CryptoJS from 'crypto-js';

/**
 * SECURITY WARNING:
 * - Client-side encryption is NOT secure for payment data
 * - In production, card data should go directly to payment gateway (Stripe, Iyzico, etc.)
 * - This is for NON-SENSITIVE data encryption only in test environment
 *
 * For production payment processing:
 * 1. Use Stripe Elements / Iyzico CheckoutForm
 * 2. Never handle raw card data on your servers
 * 3. Tokenization must happen at payment gateway level
 */

// Get encryption key - server-side only in production
const getEncryptionKey = (): string => {
  // Check if we're in a browser context
  const isBrowser = typeof window !== 'undefined';

  if (process.env.NODE_ENV === 'production') {
    if (isBrowser) {
      throw new Error('Client-side encryption is not allowed in production. Use payment gateway tokenization.');
    }
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    if (key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return key;
  }

  // Development/Test environment
  const key = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    console.warn('⚠️ WARNING: Using development encryption key. Set ENCRYPTION_KEY in .env.local');
    return 'dev-only-encryption-key-not-for-production';
  }
  return key;
};

/**
 * Encrypt sensitive data using AES-256
 * Used for temporary card data encryption (card data should never be stored!)
 */
export function encryptData(data: string): string {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Veri şifreleme başarısız');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Veri çözme başarısız');
  }
}

/**
 * Mask card number for display (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return '****';
  return `**** **** **** ${cleaned.slice(-4)}`;
}

/**
 * Hash sensitive data using SHA-256 (one-way)
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * Validate and sanitize card number
 * Uses Luhn algorithm for validation
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Check if it's only digits
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Tokenize card data for secure storage
 * Returns a token instead of actual card data
 */
export function tokenizeCard(cardNumber: string): string {
  // In production, this would call a payment gateway API
  // For now, we generate a secure token
  const last4 = cardNumber.slice(-4);
  const token = generateSecureToken(24);
  return `tok_${token}_${last4}`;
}

/**
 * Sanitize and validate CVV
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * PCI DSS: Card data should NEVER be stored
 * This function ensures we don't accidentally store card data
 */
export function sanitizeForStorage(data: any): any {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'cardNumber',
    'cvv',
    'securityCode',
    'pin',
    'password',
    'passwordHash', // Don't send hash to client
    'verificationCode'
  ];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
}

/**
 * Generate a secure payment nonce
 * Used for one-time payment processing
 */
export function generatePaymentNonce(): string {
  const timestamp = Date.now();
  const random = generateSecureToken(16);
  const combined = `${timestamp}-${random}`;
  return CryptoJS.SHA256(combined).toString();
}

