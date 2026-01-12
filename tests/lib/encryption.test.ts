/**
 * Encryption Utility Testleri
 * 
 * Bu dosya lib/encryption.ts içindeki şifreleme fonksiyonlarını test eder.
 * PCI DSS uyumlu şifreleme, kart doğrulama ve hassas veri yönetimi sağlar.
 * 
 * Test Kategorileri:
 * 1. Veri Şifreleme/Çözme - AES-256 şifreleme
 * 2. Kart Numarası Doğrulama - Luhn algoritması
 * 3. Maskeleme - Hassas verilerin güvenli gösterimi
 * 4. Tokenization - Kart verisi tokenizasyonu
 * 5. Sanitization - Hassas verilerin temizlenmesi
 * 6. Ödeme Gateway Doğrulama - PayTR, Paratika
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  maskCardNumber,
  hashData,
  generateSecureToken,
  validateCardNumber,
  tokenizeCard,
  validateCVV,
  sanitizeForStorage,
  generatePaymentNonce,
  maskCredential,
  validatePaymentCredentials,
  sanitizePaymentUrl
} from '@/lib/encryption'

// ============================================
// KART NUMARASI MASKELEME TESTLERİ
// ============================================
describe('Kart Numarası Maskeleme', () => {
  /**
   * maskCardNumber: Sadece son 4 haneyi göstermeli
   * PCI DSS gereksinimi: Kart numarası tam gösterilmemeli
   */
  it('maskCardNumber - sadece son 4 haneyi göstermeli', () => {
    const cardNumber = '4111111111111111'
    
    const result = maskCardNumber(cardNumber)
    
    expect(result).toBe('**** **** **** 1111')
  })

  /**
   * maskCardNumber: Boşluklu kart numarasını işlemeli
   */
  it('maskCardNumber - boşluklu numarayı işlemeli', () => {
    const cardNumber = '4111 1111 1111 1111'
    
    const result = maskCardNumber(cardNumber)
    
    expect(result).toBe('**** **** **** 1111')
  })

  /**
   * maskCardNumber: Kısa numara için **** döndürmeli
   */
  it('maskCardNumber - kısa numara için **** döndürmeli', () => {
    const cardNumber = '123'
    
    const result = maskCardNumber(cardNumber)
    
    expect(result).toBe('****')
  })
})

// ============================================
// HASH FONKSİYONU TESTLERİ
// ============================================
describe('Veri Hashleme (SHA-256)', () => {
  /**
   * hashData: Aynı veri için aynı hash üretmeli
   * Deterministic olmalı
   */
  it('hashData - aynı veri için aynı hash üretmeli', () => {
    const data = 'test-data'
    
    const hash1 = hashData(data)
    const hash2 = hashData(data)
    
    expect(hash1).toBe(hash2)
  })

  /**
   * hashData: Farklı veriler için farklı hash üretmeli
   */
  it('hashData - farklı veriler için farklı hash üretmeli', () => {
    const hash1 = hashData('data1')
    const hash2 = hashData('data2')
    
    expect(hash1).not.toBe(hash2)
  })

  /**
   * hashData: 64 karakterlik hex string döndürmeli (SHA-256)
   */
  it('hashData - 64 karakterlik hex string döndürmeli', () => {
    const hash = hashData('test')
    
    expect(hash).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true)
  })
})

// ============================================
// GÜVENLİ TOKEN ÜRETİMİ TESTLERİ
// ============================================
describe('Güvenli Token Üretimi', () => {
  /**
   * generateSecureToken: Belirtilen uzunlukta token üretmeli
   */
  it('generateSecureToken - varsayılan 32 byte token üretmeli', () => {
    const token = generateSecureToken()
    
    // 32 byte = 64 hex karakter
    expect(token).toHaveLength(64)
  })

  /**
   * generateSecureToken: Özel uzunlukta token üretmeli
   */
  it('generateSecureToken - özel uzunlukta token üretmeli', () => {
    const token = generateSecureToken(16)
    
    // 16 byte = 32 hex karakter
    expect(token).toHaveLength(32)
  })

  /**
   * generateSecureToken: Her seferinde farklı token üretmeli
   */
  it('generateSecureToken - her seferinde farklı token üretmeli', () => {
    const token1 = generateSecureToken()
    const token2 = generateSecureToken()
    
    expect(token1).not.toBe(token2)
  })
})

// ============================================
// KART NUMARASI DOĞRULAMA TESTLERİ (LUHN)
// ============================================
describe('Kart Numarası Doğrulama (Luhn Algoritması)', () => {
  /**
   * validateCardNumber: Geçerli Visa kartını kabul etmeli
   */
  it('validateCardNumber - geçerli Visa kartını kabul etmeli', () => {
    // Test kart numarası (Visa)
    const result = validateCardNumber('4111111111111111')
    
    expect(result).toBe(true)
  })

  /**
   * validateCardNumber: Geçerli Mastercard'ı kabul etmeli
   */
  it('validateCardNumber - geçerli Mastercard\'ı kabul etmeli', () => {
    // Test kart numarası (Mastercard)
    const result = validateCardNumber('5500000000000004')
    
    expect(result).toBe(true)
  })

  /**
   * validateCardNumber: Boşluklu numarayı işlemeli
   */
  it('validateCardNumber - boşluklu numarayı işlemeli', () => {
    const result = validateCardNumber('4111 1111 1111 1111')
    
    expect(result).toBe(true)
  })

  /**
   * validateCardNumber: Geçersiz Luhn numarasını reddetmeli
   */
  it('validateCardNumber - geçersiz Luhn numarasını reddetmeli', () => {
    const result = validateCardNumber('4111111111111112') // Son hane yanlış
    
    expect(result).toBe(false)
  })

  /**
   * validateCardNumber: Harf içeren numarayı reddetmeli
   */
  it('validateCardNumber - harf içeren numarayı reddetmeli', () => {
    const result = validateCardNumber('4111-1111-1111-1111')
    
    expect(result).toBe(false)
  })

  /**
   * validateCardNumber: Çok kısa numarayı reddetmeli
   */
  it('validateCardNumber - 13 haneden kısa numarayı reddetmeli', () => {
    const result = validateCardNumber('411111111111')
    
    expect(result).toBe(false)
  })

  /**
   * validateCardNumber: Çok uzun numarayı reddetmeli
   */
  it('validateCardNumber - 19 haneden uzun numarayı reddetmeli', () => {
    const result = validateCardNumber('41111111111111111111')
    
    expect(result).toBe(false)
  })
})

// ============================================
// KART TOKENİZASYONU TESTLERİ
// ============================================
describe('Kart Tokenizasyonu', () => {
  /**
   * tokenizeCard: tok_ ile başlayan token döndürmeli
   */
  it('tokenizeCard - tok_ prefixi ile token döndürmeli', () => {
    const token = tokenizeCard('4111111111111111')
    
    expect(token.startsWith('tok_')).toBe(true)
  })

  /**
   * tokenizeCard: Son 4 haneyi içermeli
   */
  it('tokenizeCard - son 4 haneyi içermeli', () => {
    const token = tokenizeCard('4111111111111111')
    
    expect(token.endsWith('_1111')).toBe(true)
  })

  /**
   * tokenizeCard: Her seferinde farklı token üretmeli
   */
  it('tokenizeCard - her seferinde farklı token üretmeli', () => {
    const token1 = tokenizeCard('4111111111111111')
    const token2 = tokenizeCard('4111111111111111')
    
    // Token'ın ortası farklı olmalı (son 4 hane aynı)
    expect(token1).not.toBe(token2)
  })
})

// ============================================
// CVV DOĞRULAMA TESTLERİ
// ============================================
describe('CVV Doğrulama', () => {
  /**
   * validateCVV: 3 haneli CVV'yi kabul etmeli
   */
  it('validateCVV - 3 haneli CVV\'yi kabul etmeli', () => {
    expect(validateCVV('123')).toBe(true)
    expect(validateCVV('999')).toBe(true)
  })

  /**
   * validateCVV: 4 haneli CVV'yi kabul etmeli (Amex)
   */
  it('validateCVV - 4 haneli CVV\'yi kabul etmeli (Amex)', () => {
    expect(validateCVV('1234')).toBe(true)
  })

  /**
   * validateCVV: Geçersiz CVV'leri reddetmeli
   */
  it('validateCVV - geçersiz CVV\'leri reddetmeli', () => {
    expect(validateCVV('12')).toBe(false)    // Çok kısa
    expect(validateCVV('12345')).toBe(false) // Çok uzun
    expect(validateCVV('abc')).toBe(false)   // Harf içeriyor
    expect(validateCVV('')).toBe(false)      // Boş
  })
})

// ============================================
// HASSAS VERİ TEMİZLEME TESTLERİ
// ============================================
describe('Hassas Veri Temizleme (PCI DSS)', () => {
  /**
   * sanitizeForStorage: Kart numarasını kaldırmalı
   */
  it('sanitizeForStorage - cardNumber alanını kaldırmalı', () => {
    const data = {
      name: 'Test User',
      cardNumber: '4111111111111111',
      email: 'test@example.com'
    }
    
    const result = sanitizeForStorage(data)
    
    expect(result.cardNumber).toBeUndefined()
    expect(result.name).toBe('Test User')
    expect(result.email).toBe('test@example.com')
  })

  /**
   * sanitizeForStorage: CVV'yi kaldırmalı
   */
  it('sanitizeForStorage - cvv alanını kaldırmalı', () => {
    const data = {
      name: 'Test User',
      cvv: '123'
    }
    
    const result = sanitizeForStorage(data)
    
    expect(result.cvv).toBeUndefined()
  })

  /**
   * sanitizeForStorage: Şifre alanlarını kaldırmalı
   */
  it('sanitizeForStorage - password alanlarını kaldırmalı', () => {
    const data = {
      name: 'Test User',
      password: 'secret123',
      passwordHash: 'hashedvalue'
    }
    
    const result = sanitizeForStorage(data)
    
    expect(result.password).toBeUndefined()
    expect(result.passwordHash).toBeUndefined()
  })

  /**
   * sanitizeForStorage: Orijinal nesneyi değiştirmemeli
   */
  it('sanitizeForStorage - orijinal nesneyi değiştirmemeli', () => {
    const data = {
      name: 'Test User',
      cardNumber: '4111111111111111'
    }
    
    sanitizeForStorage(data)
    
    expect(data.cardNumber).toBe('4111111111111111')
  })
})

// ============================================
// ÖDEME NONCE ÜRETİMİ TESTLERİ
// ============================================
describe('Ödeme Nonce Üretimi', () => {
  /**
   * generatePaymentNonce: 64 karakterlik hash döndürmeli
   */
  it('generatePaymentNonce - 64 karakterlik hash döndürmeli', () => {
    const nonce = generatePaymentNonce()
    
    expect(nonce).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(nonce)).toBe(true)
  })

  /**
   * generatePaymentNonce: Her seferinde farklı nonce üretmeli
   */
  it('generatePaymentNonce - her seferinde farklı nonce üretmeli', () => {
    const nonce1 = generatePaymentNonce()
    const nonce2 = generatePaymentNonce()
    
    expect(nonce1).not.toBe(nonce2)
  })
})

// ============================================
// KREDENSİYAL MASKELEME TESTLERİ
// ============================================
describe('Kredensiyel Maskeleme', () => {
  /**
   * maskCredential: İlk ve son 4 karakteri göstermeli
   */
  it('maskCredential - ilk ve son 4 karakteri göstermeli', () => {
    const credential = 'sk_live_abcdefghijklmnop'
    
    const result = maskCredential(credential)
    
    expect(result.startsWith('sk_l')).toBe(true)
    expect(result.endsWith('mnop')).toBe(true)
    expect(result).toContain('*')
  })

  /**
   * maskCredential: Kısa değer için **** döndürmeli
   */
  it('maskCredential - 8 karakterden kısa değer için **** döndürmeli', () => {
    const result = maskCredential('short')
    
    expect(result).toBe('****')
  })

  /**
   * maskCredential: Boş değer için **** döndürmeli
   */
  it('maskCredential - boş değer için **** döndürmeli', () => {
    expect(maskCredential('')).toBe('****')
    expect(maskCredential(null as any)).toBe('****')
  })
})

// ============================================
// ÖDEME GATEWAY DOĞRULAMA TESTLERİ
// ============================================
describe('Ödeme Gateway Kredensiyel Doğrulama', () => {
  /**
   * validatePaymentCredentials: Geçerli PayTR kredensiyallerini kabul etmeli
   */
  it('validatePaymentCredentials - geçerli PayTR kredensiyallerini kabul etmeli', () => {
    const credentials = {
      merchantId: '12345678',
      merchantKey: 'abcdefghij1234567890',
      merchantSalt: 'saltsaltsalt1234'
    }
    
    const result = validatePaymentCredentials('paytr', credentials)
    
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  /**
   * validatePaymentCredentials: Eksik PayTR merchantId'yi reddetmeli
   */
  it('validatePaymentCredentials - eksik PayTR merchantId\'yi reddetmeli', () => {
    const credentials = {
      merchantId: '123', // Çok kısa
      merchantKey: 'abcdefghij1234567890',
      merchantSalt: 'saltsaltsalt1234'
    }
    
    const result = validatePaymentCredentials('paytr', credentials)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('PayTR Merchant ID geçersiz (minimum 5 karakter)')
  })

  /**
   * validatePaymentCredentials: Geçerli Paratika kredensiyallerini kabul etmeli
   */
  it('validatePaymentCredentials - geçerli Paratika kredensiyallerini kabul etmeli', () => {
    const credentials = {
      merchantId: '12345678',
      merchantKey: 'abcdefghij1234567890',
      apiKey: 'apikey1234567890'
    }
    
    const result = validatePaymentCredentials('paratika', credentials)
    
    expect(result.valid).toBe(true)
  })

  /**
   * validatePaymentCredentials: Eksik Paratika apiKey'i reddetmeli
   */
  it('validatePaymentCredentials - eksik Paratika apiKey\'i reddetmeli', () => {
    const credentials = {
      merchantId: '12345678',
      merchantKey: 'abcdefghij1234567890',
      apiKey: 'short' // Çok kısa
    }
    
    const result = validatePaymentCredentials('paratika', credentials)
    
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Paratika API Key geçersiz (minimum 10 karakter)')
  })
})

// ============================================
// URL SANİTİZASYON TESTLERİ
// ============================================
describe('Ödeme URL Sanitizasyonu', () => {
  /**
   * sanitizePaymentUrl: Geçerli HTTPS URL'yi kabul etmeli
   */
  it('sanitizePaymentUrl - geçerli HTTPS URL\'yi kabul etmeli', () => {
    const url = 'https://example.com/callback'
    
    const result = sanitizePaymentUrl(url)
    
    expect(result).toBe('https://example.com/callback')
  })

  /**
   * sanitizePaymentUrl: HTTP URL'yi kabul etmeli
   */
  it('sanitizePaymentUrl - HTTP URL\'yi kabul etmeli', () => {
    const url = 'http://localhost:3000/callback'
    
    const result = sanitizePaymentUrl(url)
    
    expect(result).toBe('http://localhost:3000/callback')
  })

  /**
   * sanitizePaymentUrl: javascript: protokolünü reddetmeli
   */
  it('sanitizePaymentUrl - javascript: protokolünü reddetmeli', () => {
    const url = 'javascript:alert(1)'
    
    const result = sanitizePaymentUrl(url)
    
    expect(result).toBe('')
  })

  /**
   * sanitizePaymentUrl: Geçersiz URL için boş string döndürmeli
   */
  it('sanitizePaymentUrl - geçersiz URL için boş string döndürmeli', () => {
    const result = sanitizePaymentUrl('not-a-valid-url')
    
    expect(result).toBe('')
  })
})
