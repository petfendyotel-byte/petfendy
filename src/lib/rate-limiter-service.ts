// Gelişmiş Rate Limiter
// Kullanıcı + IP bazlı limit, bruteforce kilidi ve configurable pencere

type Bucket = {
  attempts: number
  resetTime: number
}

export interface RateLimitRule {
  maxAttempts: number
  windowMs: number
}

export interface RateLimitResult {
  limited: boolean
  remainingAttempts: number
  resetMs: number
}

export class RateLimiterService {
  private buckets: Map<string, Bucket> = new Map()

  constructor(private defaultRule: RateLimitRule = { maxAttempts: 5, windowMs: 60_000 }) {}

  /**
   * Anahtar bazlı (kullanıcı, IP veya kombinasyonu) limit kontrolü
   */
  check(key: string, rule: RateLimitRule = this.defaultRule): RateLimitResult {
    const now = Date.now()
    const bucket = this.buckets.get(key)

    if (!bucket || now > bucket.resetTime) {
      const resetTime = now + rule.windowMs
      this.buckets.set(key, { attempts: 1, resetTime })
      return {
        limited: false,
        remainingAttempts: rule.maxAttempts - 1,
        resetMs: resetTime - now,
      }
    }

    if (bucket.attempts >= rule.maxAttempts) {
      return {
        limited: true,
        remainingAttempts: 0,
        resetMs: bucket.resetTime - now,
      }
    }

    bucket.attempts += 1
    this.buckets.set(key, bucket)

    return {
      limited: false,
      remainingAttempts: rule.maxAttempts - bucket.attempts,
      resetMs: bucket.resetTime - now,
    }
  }

  /**
   * Başarılı işlem sonrası pencereyi sıfırlamak için
   */
  reset(key: string): void {
    this.buckets.delete(key)
  }
}

// Örnek hazır kurallar
export const RateLimitProfiles = {
  login: { maxAttempts: 5, windowMs: 60_000 }, // 1 dk
  mfa: { maxAttempts: 3, windowMs: 10 * 60_000 }, // 10 dk
  payment: { maxAttempts: 3, windowMs: 60_000 }, // 1 dk
  passwordReset: { maxAttempts: 3, windowMs: 10 * 60_000 }, // 10 dk
}

