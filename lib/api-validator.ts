// API Input Validasyonu - Zod Şemaları
import { z } from 'zod'
import { ApiError } from './api-response'

/**
 * Ortak Validasyon Şemaları
 */
export const commonSchemas = {
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().regex(/^(\+90|0)?[1-9]\d{9}$/, 'Geçerli bir telefon numarası girin'),
  password: z
    .string()
    .min(12, 'Şifre en az 12 karakter olmalıdır')
    .regex(/[A-ZÇĞİÖŞÜ]/, 'Şifre büyük harf içermelidir')
    .regex(/[a-zçğıöşü]/, 'Şifre küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre rakam içermelidir')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Şifre özel karakter içermelidir'),
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100, 'Ad en fazla 100 karakter olabilir'),
  id: z.string().min(1, 'ID gerekli'),
  positiveNumber: z.number().positive('Pozitif bir sayı gerekli'),
  nonNegativeNumber: z.number().nonnegative('Negatif olmayan bir sayı gerekli'),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih formatı girin (YYYY-MM-DD)'),
}

/**
 * Upload API Validasyon Şeması
 */
export const uploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'En az bir dosya gerekli')
    .max(10, 'Maksimum 10 dosya yüklenebilir'),
})

/**
 * Register API Validasyon Şeması
 */
export const registerSchema = z
  .object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    name: commonSchemas.name,
    phone: commonSchemas.phone,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

/**
 * Login API Validasyon Şeması
 */
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Şifre gerekli'),
})

/**
 * Payment API Validasyon Şeması
 */
export const paymentSchema = z.object({
  amount: z.number().positive('Tutar pozitif olmalıdır').max(1000000, 'Tutar limiti aşıldı'),
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, 'Geçerli bir kart numarası girin')
    .refine((val) => {
      // Luhn algoritması kontrolü
      let sum = 0
      let isEven = false
      for (let i = val.length - 1; i >= 0; i--) {
        let digit = parseInt(val[i])
        if (isEven) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
        isEven = !isEven
      }
      return sum % 10 === 0
    }, 'Geçersiz kart numarası'),
  cardHolder: z.string().min(2, 'Kart sahibi adı gerekli').max(100),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, 'Geçerli bir son kullanma tarihi girin (MM/YY)')
    .refine((val) => {
      const [month, year] = val.split('/')
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
      return expiry > new Date()
    }, 'Kartın süresi dolmuş'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Geçerli bir CVV girin'),
  email: commonSchemas.email,
})

/**
 * Validasyon Helper Fonksiyonu
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ApiError } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!details[path]) {
          details[path] = []
        }
        details[path].push(err.message)
      })

      return {
        success: false,
        error: ApiError.validation('Validasyon hatası', details),
      }
    }

    return {
      success: false,
      error: ApiError.internal('Validasyon sırasında bir hata oluştu'),
    }
  }
}

/**
 * Async Validasyon Helper (FormData için)
 */
export async function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
  try {
    // FormData'yı object'e çevir
    const data: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Array ise
        if (Array.isArray(data[key])) {
          data[key].push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    }

    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!details[path]) {
          details[path] = []
        }
        details[path].push(err.message)
      })

      return {
        success: false,
        error: ApiError.validation('Validasyon hatası', details),
      }
    }

    return {
      success: false,
      error: ApiError.internal('Validasyon sırasında bir hata oluştu'),
    }
  }
}

