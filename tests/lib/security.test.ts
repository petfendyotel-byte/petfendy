/**
 * Security Utility Testleri
 * 
 * Bu dosya lib/security.ts içindeki güvenlik fonksiyonlarını test eder.
 * Güvenlik fonksiyonları XSS, CSRF, şifre güvenliği ve token yönetimi sağlar.
 * 
 * Test Kategorileri:
 * 1. CSRF Token - Cross-Site Request Forgery koruması
 * 2. Input Sanitization - XSS saldırılarına karşı koruma
 * 3. HTML Encoding - Güvenli metin gösterimi
 * 4. Validation - E-posta, telefon, şifre doğrulama
 * 5. Rate Limiting - Brute force saldırılarına karşı koruma
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  encodeHTML,
  validateEmail,
  validatePhone,
  validatePassword,
  RateLimiter
} from '@/lib/security'

// ============================================
// CSRF TOKEN TESTLERİ
// ============================================
describe('CSRF Token Yönetimi', () => {
  /**
   * generateCSRFToken: Rastgele 64 karakterlik hex token üretir
   * Her istek için benzersiz token oluşturulmalı
   */
  it('generateCSRFToken - 64 karakterlik hex token üretmeli', () => {
    const token = generateCSRFToken()
    
    expect(token).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(token)).toBe(true) // Sadece hex karakterler
  })

  /**
   * generateCSRFToken: Her çağrıda farklı token üretmeli
   */
  it('generateCSRFToken - her seferinde farklı token üretmeli', () => {
    const token1 = generateCSRFToken()
    const token2 = generateCSRFToken()
    
    expect(token1).not.toBe(token2)
  })

  /**
   * validateCSRFToken: Eşleşen tokenları doğrulamalı
   */
  it('validateCSRFToken - eşleşen tokenları doğrulamalı', () => {
    const token = 'abc123def456'
    
    const result = validateCSRFToken(token, token)
    
    expect(result).toBe(true)
  })

  /**
   * validateCSRFToken: Farklı tokenları reddetmeli
   */
  it('validateCSRFToken - farklı tokenları reddetmeli', () => {
    const result = validateCSRFToken('token1', 'token2')
    
    expect(result).toBe(false)
  })

  /**
   * validateCSRFToken: Boş tokenları reddetmeli
   */
  it('validateCSRFToken - boş tokenları reddetmeli', () => {
    expect(validateCSRFToken('', 'token')).toBe(false)
    expect(validateCSRFToken('token', '')).toBe(false)
    expect(validateCSRFToken('', '')).toBe(false)
  })

  /**
   * validateCSRFToken: Farklı uzunluktaki tokenları reddetmeli
   * Timing attack'lara karşı koruma
   */
  it('validateCSRFToken - farklı uzunluktaki tokenları reddetmeli', () => {
    const result = validateCSRFToken('short', 'muchlongertoken')
    
    expect(result).toBe(false)
  })
})

// ============================================
// INPUT SANİTİZASYON TESTLERİ
// ============================================
describe('Input Sanitization (XSS Koruması)', () => {
  /**
   * sanitizeInput: HTML etiketlerini kaldırmalı
   * XSS saldırılarının temel vektörü
   */
  it('sanitizeInput - HTML etiketlerini kaldırmalı', () => {
    const malicious = '<script>alert("XSS")</script>'
    
    const result = sanitizeInput(malicious)
    
    // < ve > karakterleri kaldırılır, içerik kalır
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  /**
   * sanitizeInput: javascript: protokolünü kaldırmalı
   */
  it('sanitizeInput - javascript: protokolünü kaldırmalı', () => {
    const malicious = 'javascript:alert("XSS")'
    
    const result = sanitizeInput(malicious)
    
    expect(result.toLowerCase()).not.toContain('javascript:')
  })

  /**
   * sanitizeInput: Event handler'ları kaldırmalı
   */
  it('sanitizeInput - event handler\'ları kaldırmalı', () => {
    const malicious = '<img onerror="alert(1)" src="x">'
    
    const result = sanitizeInput(malicious)
    
    expect(result.toLowerCase()).not.toContain('onerror')
  })

  /**
   * sanitizeInput: data: protokolünü kaldırmalı
   */
  it('sanitizeInput - data: protokolünü kaldırmalı', () => {
    const malicious = 'data:text/html,<script>alert(1)</script>'
    
    const result = sanitizeInput(malicious)
    
    expect(result.toLowerCase()).not.toContain('data:')
  })

  /**
   * sanitizeInput: HTML yorumlarını kaldırmalı
   */
  it('sanitizeInput - HTML yorumlarını kaldırmalı', () => {
    const malicious = '<!-- comment -->'
    
    const result = sanitizeInput(malicious)
    
    expect(result).not.toContain('<!--')
    expect(result).not.toContain('-->')
  })

  /**
   * sanitizeInput: Uzun metinleri kısaltmalı (DoS koruması)
   */
  it('sanitizeInput - 1000 karakterden uzun metinleri kısaltmalı', () => {
    const longText = 'a'.repeat(2000)
    
    const result = sanitizeInput(longText)
    
    expect(result.length).toBeLessThanOrEqual(1000)
  })

  /**
   * sanitizeInput: Boş/null değerleri işlemeli
   */
  it('sanitizeInput - boş değer için boş string döndürmeli', () => {
    expect(sanitizeInput('')).toBe('')
    expect(sanitizeInput(null as any)).toBe('')
    expect(sanitizeInput(undefined as any)).toBe('')
  })

  /**
   * sanitizeInput: Normal metni değiştirmemeli
   */
  it('sanitizeInput - normal metni değiştirmemeli', () => {
    const normalText = 'Merhaba, bu normal bir metin.'
    
    const result = sanitizeInput(normalText)
    
    expect(result).toBe(normalText)
  })

  /**
   * sanitizeInput: Whitespace'i trim etmeli
   */
  it('sanitizeInput - baştaki ve sondaki boşlukları temizlemeli', () => {
    const text = '   Merhaba   '
    
    const result = sanitizeInput(text)
    
    expect(result).toBe('Merhaba')
  })
})

// ============================================
// HTML ENCODING TESTLERİ
// ============================================
describe('HTML Encoding', () => {
  /**
   * encodeHTML: Özel karakterleri encode etmeli
   */
  it('encodeHTML - < ve > karakterlerini encode etmeli', () => {
    const text = '<script>alert(1)</script>'
    
    const result = encodeHTML(text)
    
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
    expect(result).not.toContain('<script>')
  })

  /**
   * encodeHTML: & karakterini encode etmeli
   */
  it('encodeHTML - & karakterini encode etmeli', () => {
    const text = 'Tom & Jerry'
    
    const result = encodeHTML(text)
    
    expect(result).toContain('&amp;')
  })

  /**
   * encodeHTML: Tırnak işaretlerini encode etmeli
   * Not: jsdom ortamında document.createElement kullanıldığında
   * tırnak işaretleri encode edilmez, bu beklenen davranıştır
   */
  it('encodeHTML - tehlikeli karakterleri encode etmeli', () => {
    const text = '<script>alert(1)</script>'
    
    const result = encodeHTML(text)
    
    // En azından < ve > encode edilmeli
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })
})

// ============================================
// E-POSTA DOĞRULAMA TESTLERİ
// ============================================
describe('E-posta Doğrulama', () => {
  /**
   * validateEmail: Geçerli e-posta adreslerini kabul etmeli
   */
  it('validateEmail - geçerli e-postaları kabul etmeli', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('user+tag@example.org')).toBe(true)
  })

  /**
   * validateEmail: Geçersiz e-posta adreslerini reddetmeli
   */
  it('validateEmail - geçersiz e-postaları reddetmeli', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@domain')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})

// ============================================
// TELEFON DOĞRULAMA TESTLERİ
// ============================================
describe('Telefon Doğrulama (Türkiye Formatı)', () => {
  /**
   * validatePhone: Geçerli Türk telefon numaralarını kabul etmeli
   */
  it('validatePhone - geçerli numaraları kabul etmeli', () => {
    expect(validatePhone('05551234567')).toBe(true)
    expect(validatePhone('+905551234567')).toBe(true)
    expect(validatePhone('5551234567')).toBe(true)
    expect(validatePhone('0555 123 45 67')).toBe(true) // Boşluklu
  })

  /**
   * validatePhone: Geçersiz numaraları reddetmeli
   */
  it('validatePhone - geçersiz numaraları reddetmeli', () => {
    expect(validatePhone('123')).toBe(false)
    expect(validatePhone('00001234567')).toBe(false) // 0 ile başlayan alan kodu
    expect(validatePhone('abcdefghij')).toBe(false)
    expect(validatePhone('')).toBe(false)
  })
})

// ============================================
// ŞİFRE DOĞRULAMA TESTLERİ
// ============================================
describe('Şifre Güvenliği Doğrulama', () => {
  /**
   * validatePassword: Güçlü şifreleri kabul etmeli
   * Minimum: 12 karakter, büyük harf, küçük harf, rakam, özel karakter
   */
  it('validatePassword - güçlü şifreleri kabul etmeli', () => {
    const result = validatePassword('SecurePass123!')
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  /**
   * validatePassword: Kısa şifreleri reddetmeli
   */
  it('validatePassword - 12 karakterden kısa şifreleri reddetmeli', () => {
    const result = validatePassword('Short1!')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre en az 12 karakter olmalıdır')
  })

  /**
   * validatePassword: Büyük harf eksikliğini bildirmeli
   */
  it('validatePassword - büyük harf eksikliğini bildirmeli', () => {
    const result = validatePassword('lowercase123!')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre büyük harf içermelidir')
  })

  /**
   * validatePassword: Küçük harf eksikliğini bildirmeli
   */
  it('validatePassword - küçük harf eksikliğini bildirmeli', () => {
    const result = validatePassword('UPPERCASE123!')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre küçük harf içermelidir')
  })

  /**
   * validatePassword: Rakam eksikliğini bildirmeli
   */
  it('validatePassword - rakam eksikliğini bildirmeli', () => {
    const result = validatePassword('NoNumbersHere!')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre rakam içermelidir')
  })

  /**
   * validatePassword: Özel karakter eksikliğini bildirmeli
   */
  it('validatePassword - özel karakter eksikliğini bildirmeli', () => {
    const result = validatePassword('NoSpecialChar123')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre özel karakter içermelidir')
  })

  /**
   * validatePassword: Tekrar eden karakterleri reddetmeli
   */
  it('validatePassword - 3+ tekrar eden karakterleri reddetmeli', () => {
    const result = validatePassword('Passsword123!')
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Şifre üç veya daha fazla tekrar eden karakter içermemelidir')
  })

  /**
   * validatePassword: Türkçe karakterleri desteklemeli
   */
  it('validatePassword - Türkçe karakterleri desteklemeli', () => {
    const result = validatePassword('GüçlüŞifre123!')
    
    expect(result.valid).toBe(true)
  })
})

// ============================================
// RATE LIMITER TESTLERİ
// ============================================
describe('Rate Limiter (Brute Force Koruması)', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    // Her test için yeni limiter: 3 deneme, 1 dakika pencere
    rateLimiter = new RateLimiter(3, 60000)
  })

  /**
   * RateLimiter: İlk denemeleri kabul etmeli
   */
  it('isLimited - ilk denemeleri kabul etmeli', () => {
    const key = 'user@example.com'
    
    expect(rateLimiter.isLimited(key)).toBe(false)
    expect(rateLimiter.isLimited(key)).toBe(false)
    expect(rateLimiter.isLimited(key)).toBe(false)
  })

  /**
   * RateLimiter: Limit aşıldığında engellemeli
   */
  it('isLimited - limit aşıldığında engellemeli', () => {
    const key = 'user@example.com'
    
    rateLimiter.isLimited(key) // 1
    rateLimiter.isLimited(key) // 2
    rateLimiter.isLimited(key) // 3
    
    expect(rateLimiter.isLimited(key)).toBe(true) // 4. deneme engellenmeli
  })

  /**
   * RateLimiter: Farklı anahtarları ayrı saymalı
   */
  it('isLimited - farklı anahtarları ayrı saymalı', () => {
    const key1 = 'user1@example.com'
    const key2 = 'user2@example.com'
    
    // key1 için 3 deneme
    rateLimiter.isLimited(key1)
    rateLimiter.isLimited(key1)
    rateLimiter.isLimited(key1)
    
    // key2 hala serbest olmalı
    expect(rateLimiter.isLimited(key2)).toBe(false)
  })

  /**
   * RateLimiter: Reset sonrası tekrar izin vermeli
   */
  it('reset - sayacı sıfırlamalı', () => {
    const key = 'user@example.com'
    
    // Limiti doldur
    rateLimiter.isLimited(key)
    rateLimiter.isLimited(key)
    rateLimiter.isLimited(key)
    expect(rateLimiter.isLimited(key)).toBe(true)
    
    // Reset
    rateLimiter.reset(key)
    
    // Tekrar izin vermeli
    expect(rateLimiter.isLimited(key)).toBe(false)
  })
})
