// Güvenlik Yardımcı Fonksiyonlar
// PII Maskeleme, Log Redaksiyonu

// ==================== PII MASKELEME ====================

/**
 * Kart numarası maskeleme - Son 4 hane göster
 * PCI DSS uyumlu
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '****'
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length < 4) return '****'
  const last4 = cleaned.slice(-4)
  return `**** **** **** ${last4}`
}

/**
 * CVV maskeleme - Hiçbir zaman log'da görünmemeli
 */
export function maskCVV(cvv: string): string {
  return '***'
}

/**
 * TC Kimlik No maskeleme - Son 3 hane göster
 * Format: *** *** **123
 */
export function maskTCNumber(tc: string): string {
  if (!tc || tc.length !== 11) return '*** *** ** ***'
  const masked = `${'*'.repeat(3)} ${'*'.repeat(3)} ${'*'.repeat(2)}${tc.slice(-3)}`
  return masked
}

/**
 * Telefon numarası maskeleme - Son 2 hane göster
 * Format: *** *** **34
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '*** *** ** **'
  const cleaned = phone.replace(/\s/g, '').replace(/[^\d]/g, '')
  if (cleaned.length < 4) return '*** *** ** **'
  const last2 = cleaned.slice(-2)
  const masked = `${'*'.repeat(cleaned.length - 2)}${last2}`
  
  // Format: *** *** **34
  if (masked.length === 10) {
    return `${masked.slice(0, 3)} ${masked.slice(3, 6)} ${masked.slice(6, 8)}${masked.slice(8)}`
  }
  return masked
}

/**
 * E-posta maskeleme - İlk harf ve domain ilk harfi göster
 * Format: f****@d****.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '****@****.***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '****@****.***'
  
  const maskedLocal = localPart.length > 0 
    ? `${localPart[0]}${'*'.repeat(Math.max(0, localPart.length - 1))}`
    : '****'
  
  const domainParts = domain.split('.')
  if (domainParts.length < 2) return `${maskedLocal}@****.***`
  
  const domainName = domainParts[0]
  const domainExt = domainParts.slice(1).join('.')
  
  const maskedDomain = domainName.length > 0
    ? `${domainName[0]}${'*'.repeat(Math.max(0, domainName.length - 1))}`
    : '****'
  
  return `${maskedLocal}@${maskedDomain}.${domainExt}`
}

/**
 * İsim maskeleme - Sadece ilk harf göster
 */
export function maskName(name: string): string {
  if (!name) return '****'
  if (name.length <= 1) return name
  return `${name[0]}${'*'.repeat(name.length - 1)}`
}

/**
 * Adres maskeleme - Sadece ilk kısım göster
 */
export function maskAddress(address: string): string {
  if (!address) return '****'
  const parts = address.split(' ')
  if (parts.length === 0) return '****'
  return `${parts[0]} ${'*'.repeat(address.length - parts[0].length)}`
}

// ==================== LOG REDAKSİYONU ====================

/**
 * Obje içindeki hassas alanları maskele
 */
export function sanitizeLogData(data: any, sensitiveFields: string[] = []): any {
  if (!data || typeof data !== 'object') return data

  const defaultSensitiveFields = [
    'cardNumber',
    'cvv',
    'cvv2',
    'securityCode',
    'password',
    'passwordHash',
    'token',
    'apiKey',
    'apiSecret',
    'accessToken',
    'refreshToken',
    'verificationCode',
    'tcNumber',
    'tcKimlikNo',
    'phone',
    'telefon',
    'email',
    'eMail',
  ]

  const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields]
  const sanitized = Array.isArray(data) ? [...data] : { ...data }

  for (const key in sanitized) {
    if (allSensitiveFields.includes(key.toLowerCase())) {
      const value = sanitized[key]
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('card')) {
          sanitized[key] = maskCardNumber(value)
        } else if (key.toLowerCase().includes('cvv')) {
          sanitized[key] = maskCVV(value)
        } else if (key.toLowerCase().includes('tc') || key.toLowerCase().includes('kimlik')) {
          sanitized[key] = maskTCNumber(value)
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefon')) {
          sanitized[key] = maskPhoneNumber(value)
        } else if (key.toLowerCase().includes('email')) {
          sanitized[key] = maskEmail(value)
        } else {
          sanitized[key] = '***REDACTED***'
        }
      } else {
        sanitized[key] = '***REDACTED***'
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key], sensitiveFields)
    }
  }

  return sanitized
}

/**
 * Log mesajı oluştururken hassas verileri maskele
 */
export function createSafeLogMessage(message: string, data?: any): string {
  if (!data) return message
  
  const sanitizedData = sanitizeLogData(data)
  const dataString = JSON.stringify(sanitizedData)
  
  return `${message} | Data: ${dataString}`
}

// ==================== ŞİFRE GÜVENLİĞİ ====================

/**
 * Şifre güçlülük kontrolü
 * Minimum 12 karakter, büyük/küçük harf, rakam, özel karakter
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  score: number // 0-100
  errors: string[]
  suggestions: string[]
} {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // Uzunluk kontrolü
  if (password.length < 12) {
    errors.push('Şifre en az 12 karakter olmalıdır')
  } else if (password.length >= 16) {
    score += 20
  } else {
    score += 10
  }

  // Büyük harf kontrolü
  if (!/[A-ZÇĞİÖŞÜ]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir')
  } else {
    score += 15
  }

  // Küçük harf kontrolü
  if (!/[a-zçğıöşü]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir')
  } else {
    score += 15
  }

  // Rakam kontrolü
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir')
  } else {
    score += 15
  }

  // Özel karakter kontrolü
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir')
  } else {
    score += 15
  }

  // Tekrar eden karakter kontrolü
  const hasRepeatingChars = /(.)\1{2,}/.test(password)
  if (hasRepeatingChars) {
    errors.push('Şifre üç veya daha fazla tekrar eden karakter içermemelidir')
    suggestions.push('Tekrar eden karakterleri değiştirin')
  } else {
    score += 10
  }

  // Sözlük kelime kontrolü (basit)
  const commonWords = ['password', '123456', 'qwerty', 'admin', 'user', 'şifre']
  const hasCommonWord = commonWords.some(word => password.toLowerCase().includes(word))
  if (hasCommonWord) {
    errors.push('Şifre yaygın kelimeler içermemelidir')
    suggestions.push('Daha benzersiz bir şifre seçin')
  } else {
    score += 10
  }

  return {
    valid: errors.length === 0,
    score: Math.min(100, score),
    errors,
    suggestions,
  }
}

// ==================== TOKEN GÜVENLİĞİ ====================

/**
 * Güvenli token oluşturma
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Tek kullanımlık kod oluşturma (6 haneli)
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ==================== EXPORTS ====================

export const SecurityUtils = {
  maskCardNumber,
  maskCVV,
  maskTCNumber,
  maskPhoneNumber,
  maskEmail,
  maskName,
  maskAddress,
  sanitizeLogData,
  createSafeLogMessage,
  validatePasswordStrength,
  generateSecureToken,
  generateOTPCode,
}

