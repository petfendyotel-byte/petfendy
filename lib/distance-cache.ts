/**
 * Distance Cache Service
 * 
 * Aynı rotalar için tutarlı mesafe sonuçları sağlar.
 * Google API sonuçlarını cache'leyerek her seferinde aynı mesafeyi döndürür.
 */

interface DistanceSegment {
  from: string
  to: string
  distance: number
}

interface DistanceCache {
  key: string
  distance: number
  method: 'google' | 'fallback'
  segments?: DistanceSegment[]
  calculatedAt: Date
  expiresAt: Date
  isVipTransfer: boolean
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
}

class DistanceCacheService {
  private memoryCache = new Map<string, DistanceCache>()
  private stats: CacheStats = { hits: 0, misses: 0, hitRate: 0 }
  private readonly MEMORY_CACHE_SIZE = 1000
  private readonly MEMORY_CACHE_TTL = 60 * 60 * 1000 // 1 saat

  /**
   * Cache key oluşturur - aynı rota için her zaman aynı key
   */
  generateKey(
    pickupProvince: string, 
    pickupDistrict: string, 
    dropoffProvince: string, 
    dropoffDistrict: string, 
    isVip: boolean
  ): string {
    // Normalize edilmiş key - büyük/küçük harf ve boşluk sorunlarını önler
    const normalizeLocation = (str: string) => str.trim().toLowerCase().replace(/\s+/g, '-')
    
    const pickup = `${normalizeLocation(pickupProvince)}-${normalizeLocation(pickupDistrict)}`
    const dropoff = `${normalizeLocation(dropoffProvince)}-${normalizeLocation(dropoffDistrict)}`
    const transferType = isVip ? 'vip' : 'regular'
    
    return `distance:${pickup}:${dropoff}:${transferType}`
  }

  /**
   * Cache'den mesafe bilgisini getirir
   */
  async get(key: string): Promise<DistanceCache | null> {
    // Memory cache'den kontrol et
    const cached = this.memoryCache.get(key)
    if (cached && cached.expiresAt > new Date()) {
      this.stats.hits++
      this.updateHitRate()
      console.log(`Distance cache HIT: ${key} -> ${cached.distance}km`)
      return cached
    }

    // Expired cache'i temizle
    if (cached) {
      this.memoryCache.delete(key)
    }

    this.stats.misses++
    this.updateHitRate()
    console.log(`Distance cache MISS: ${key}`)
    return null
  }

  /**
   * Mesafe bilgisini cache'e kaydeder
   */
  async set(
    key: string, 
    distance: number, 
    method: 'google' | 'fallback',
    segments: DistanceSegment[] = [],
    isVipTransfer: boolean = false
  ): Promise<void> {
    // TTL belirleme - Google API sonuçları daha uzun süre cache'lenir
    const ttl = method === 'google' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 24 saat vs 7 gün
    
    const cacheData: DistanceCache = {
      key,
      distance,
      method,
      segments,
      calculatedAt: new Date(),
      expiresAt: new Date(Date.now() + ttl),
      isVipTransfer
    }

    // Memory cache size kontrolü - LRU eviction
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    this.memoryCache.set(key, cacheData)
    console.log(`Distance cached: ${key} -> ${distance}km (${method}, expires: ${cacheData.expiresAt.toISOString()})`)
  }

  /**
   * Cache'i temizler (pattern ile)
   */
  async invalidate(pattern?: string): Promise<void> {
    if (!pattern) {
      this.memoryCache.clear()
      console.log('Distance cache cleared completely')
      return
    }

    const keysToDelete: string[] = []
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key))
    console.log(`Distance cache invalidated: ${keysToDelete.length} entries matching "${pattern}"`)
  }

  /**
   * Cache istatistiklerini döndürür
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Hit rate'i günceller
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Cache durumunu kontrol eder
   */
  getCacheInfo(): { size: number, maxSize: number, hitRate: number } {
    return {
      size: this.memoryCache.size,
      maxSize: this.MEMORY_CACHE_SIZE,
      hitRate: this.stats.hitRate
    }
  }

  /**
   * Expired cache entries'leri temizler
   */
  cleanup(): void {
    const now = new Date()
    const keysToDelete: string[] = []
    
    for (const [key, cache] of this.memoryCache.entries()) {
      if (cache.expiresAt <= now) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.memoryCache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`Distance cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }
}

// Singleton instance
export const distanceCacheService = new DistanceCacheService()

// Cleanup job - her 30 dakikada bir expired entries'leri temizle
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    distanceCacheService.cleanup()
  }, 30 * 60 * 1000) // 30 dakika
}

export type { DistanceCache, DistanceSegment, CacheStats }