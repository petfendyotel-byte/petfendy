/**
 * Input Sanitization Utilities
 * Edge case handling for strings, emojis, unicode, and malicious inputs
 */

// Zararlı karakterleri temizle
export function sanitizeString(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return ''
  
  // Handle null, undefined, empty string edge cases
  if (input === null || input === undefined || input === '') return ''
  
  // Handle non-string types that might be passed
  if (typeof input !== 'string') {
    try {
      input = String(input)
    } catch {
      return ''
    }
  }
  
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Invisible characters (zero-width spaces)
    .replace(/[\u2028\u2029]/g, '') // Line/paragraph separators
    .replace(/[\uFFF0-\uFFFF]/g, '') // Specials block
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script tags
    .replace(/javascript:/gi, '') // JavaScript URLs
    .replace(/data:text\/html/gi, '') // Data URLs
    .replace(/vbscript:/gi, '') // VBScript URLs
    .replace(/on\w+\s*=/gi, '') // Event handlers
    .replace(/expression\s*\(/gi, '') // CSS expressions
    .replace(/url\s*\(/gi, '') // CSS url() functions
    .replace(/import\s+/gi, '') // CSS @import
    .substring(0, 1000) // Max length limit
}

// Sayısal input sanitization
export function sanitizeNumber(input: string | number | null | undefined): number {
  // Handle null, undefined, empty string edge cases
  if (input === null || input === undefined || input === '') return 0
  
  // Handle array edge case
  if (Array.isArray(input)) return 0
  
  // Handle object edge case
  if (typeof input === 'object') return 0
  
  // Handle boolean edge case
  if (typeof input === 'boolean') return input ? 1 : 0
  
  let num: number
  
  if (typeof input === 'string') {
    // Remove any non-numeric characters except decimal point and minus
    const cleaned = input.replace(/[^\d.-]/g, '')
    num = parseFloat(cleaned)
  } else {
    num = Number(input)
  }
  
  // Handle NaN, Infinity, -Infinity edge cases
  if (isNaN(num) || !isFinite(num)) return 0
  
  // Handle negative numbers (business rule: no negative prices/quantities)
  if (num < 0) return 0
  
  // Handle integer overflow edge case
  if (num > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER
  if (num < Number.MIN_SAFE_INTEGER) return 0
  
  // Handle very small numbers that could cause precision issues
  if (num > 0 && num < 0.01) return 0.01
  
  // Round to 2 decimal places to prevent floating point precision issues
  return Math.round(num * 100) / 100
}

// Email sanitization
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return ''
  
  const sanitized = sanitizeString(email).toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

// Phone sanitization
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return ''
  
  return phone
    .replace(/[^\d+\-\s()]/g, '') // Sadece rakam ve telefon karakterleri
    .trim()
    .substring(0, 20) // Max phone length
}

// Array sanitization with comprehensive edge case handling
export function sanitizeArray<T>(arr: T[] | null | undefined, maxLength: number = 100): T[] {
  // Handle null/undefined edge cases
  if (!arr) return []
  
  // Handle non-array types
  if (!Array.isArray(arr)) {
    // Try to convert single values to array
    if (arr !== null && arr !== undefined) {
      return [arr as T].slice(0, maxLength)
    }
    return []
  }
  
  // Handle empty array
  if (arr.length === 0) return []
  
  // Handle circular references by limiting depth
  try {
    JSON.stringify(arr)
  } catch (error) {
    console.warn('Circular reference detected in array, returning empty array')
    return []
  }
  
  // Filter out null, undefined, and limit length
  const filtered = arr
    .filter(item => item !== null && item !== undefined)
    .slice(0, maxLength) // Prevent memory issues with huge arrays
  
  return filtered
}

// Object key sanitization with circular reference protection
export function sanitizeObjectKeys(obj: Record<string, any> | null | undefined, maxDepth: number = 5): Record<string, any> {
  if (!obj || typeof obj !== 'object') return {}
  
  // Handle array edge case
  if (Array.isArray(obj)) return {}
  
  // Handle circular references
  const seen = new WeakSet()
  
  function sanitizeRecursive(current: any, depth: number): any {
    // Prevent infinite recursion
    if (depth > maxDepth) return {}
    
    // Handle primitive types
    if (current === null || current === undefined) return null
    if (typeof current !== 'object') return current
    
    // Handle circular references
    if (seen.has(current)) return '[Circular Reference]'
    seen.add(current)
    
    // Handle arrays
    if (Array.isArray(current)) {
      return current.slice(0, 100).map(item => sanitizeRecursive(item, depth + 1))
    }
    
    // Handle objects
    const sanitized: Record<string, any> = {}
    let keyCount = 0
    
    for (const key in current) {
      // Limit number of keys to prevent memory issues
      if (keyCount >= 100) break
      
      if (current.hasOwnProperty(key)) {
        const sanitizedKey = sanitizeString(key)
        if (sanitizedKey && sanitizedKey.length > 0) {
          sanitized[sanitizedKey] = sanitizeRecursive(current[key], depth + 1)
          keyCount++
        }
      }
    }
    
    return sanitized
  }
  
  return sanitizeRecursive(obj, 0)
}

// Date sanitization with comprehensive validation
export function sanitizeDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  // Handle different input types
  let dateObj: Date
  
  try {
    if (typeof date === 'string') {
      // Handle empty string
      if (date.trim() === '') return ''
      
      // Handle malformed date strings
      if (date.length > 50) return '' // Prevent extremely long strings
      
      // Handle SQL injection attempts in date strings
      if (/[<>'"`;\\]/g.test(date)) return ''
      
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return ''
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return ''
    
    // Check for reasonable date range (not too far in past or future)
    const minDate = new Date('1900-01-01')
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10) // Max 10 years in future
    
    if (dateObj < minDate || dateObj > maxDate) return ''
    
    // Return ISO date string (YYYY-MM-DD format)
    return dateObj.toISOString().split('T')[0]
  } catch (error) {
    console.warn('Date sanitization error:', error)
    return ''
  }
}

// Price sanitization with currency limits
export function sanitizePrice(price: string | number | null | undefined): number {
  const num = sanitizeNumber(price)
  
  // Reasonable price limits for pet services
  if (num > 100000) return 100000 // Max 100k TL
  if (num < 0) return 0
  
  return num
}

// File name sanitization for uploads
export function sanitizeFileName(fileName: string | null | undefined): string {
  if (!fileName || typeof fileName !== 'string') return ''
  
  return fileName
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Windows forbidden characters
    .replace(/^\.+/, '') // Leading dots
    .replace(/\.+$/, '') // Trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255) // Max filename length
}

// URL sanitization
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return ''
  
  try {
    // Remove dangerous protocols
    if (url.match(/^(javascript|data|vbscript|file|ftp):/i)) return ''
    
    // Ensure it starts with http or https
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url
    }
    
    const urlObj = new URL(url)
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) return ''
    
    return urlObj.toString()
  } catch {
    return ''
  }
}

// Memory-safe string truncation
export function truncateString(str: string | null | undefined, maxLength: number = 1000): string {
  if (!str || typeof str !== 'string') return ''
  
  if (str.length <= maxLength) return str
  
  // Truncate at word boundary if possible
  const truncated = str.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

// Concurrent operation protection
export function createRateLimiter(maxCalls: number, windowMs: number) {
  const calls: number[] = []
  
  return function isAllowed(): boolean {
    const now = Date.now()
    
    // Remove old calls outside the window
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift()
    }
    
    // Check if we're under the limit
    if (calls.length < maxCalls) {
      calls.push(now)
      return true
    }
    
    return false
  }
}

// Navigation state protection
export function createNavigationGuard() {
  let isNavigating = false
  let pendingOperations = new Set<string>()
  
  return {
    startOperation(operationId: string): boolean {
      if (isNavigating) return false
      pendingOperations.add(operationId)
      return true
    },
    
    finishOperation(operationId: string): void {
      pendingOperations.delete(operationId)
    },
    
    canNavigate(): boolean {
      return pendingOperations.size === 0
    },
    
    setNavigating(navigating: boolean): void {
      isNavigating = navigating
    }
  }
}

// Form submission protection
export function createSubmissionGuard() {
  const submittedForms = new Set<string>()
  
  return {
    canSubmit(formId: string): boolean {
      if (submittedForms.has(formId)) return false
      submittedForms.add(formId)
      
      // Clear after 5 seconds to allow resubmission
      setTimeout(() => {
        submittedForms.delete(formId)
      }, 5000)
      
      return true
    },
    
    reset(formId: string): void {
      submittedForms.delete(formId)
    }
  }
}