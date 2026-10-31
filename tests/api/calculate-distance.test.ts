/**
 * Enhanced Calculate Distance API Tests
 * 
 * Bu dosya yeni cache sistemi ile geliştirilmiş /api/calculate-distance endpoint'ini test eder.
 * Aynı rotalar için tutarlı mesafe sonuçları sağlar.
 * 
 * Test Kategorileri:
 * 1. Distance Consistency - Aynı rotalar için tutarlı sonuçlar
 * 2. Cache Behavior - Cache hit/miss durumları
 * 3. VIP Transfer Calculations - VIP transfer hesaplama doğruluğu
 * 4. Google API Integration - API entegrasyonu
 * 5. Fallback Calculations - Fallback hesaplama doğruluğu
 * 6. Property-Based Tests - Tutarlılık özellikleri
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { distanceCalculator } from '@/lib/distance-calculator'
import { distanceCacheService } from '@/lib/distance-cache'
import { kmFromAnkara } from '@/lib/district-distances'

// Mock environment variables
vi.mock('process', () => ({
  env: {
    GOOGLE_MAPS_API_KEY: 'test-api-key'
  }
}))

// Mock fetch for Google API calls
global.fetch = vi.fn()

describe('Enhanced Distance Calculation API', () => {
  beforeEach(() => {
    // Clear cache before each test
    distanceCacheService.invalidate()
    vi.clearAllMocks()
  })

  // ============================================
  // DISTANCE CONSISTENCY TESTS
  // ============================================
  describe('Distance Consistency', () => {
    it('should return identical distances for identical routes', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'Edirne', district: 'Merkez' }

      // Mock Google API response
      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 577000 } // 577 km in meters
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // First calculation
      const result1 = await distanceCalculator.calculateDistance(pickup, dropoff, false)
      
      // Second calculation (should use cache)
      const result2 = await distanceCalculator.calculateDistance(pickup, dropoff, false)

      // Third calculation with force refresh
      const result3 = await distanceCalculator.calculateDistance(pickup, dropoff, false, true)

      // All results should have identical distances
      expect(result1.totalDistance).toBe(result2.totalDistance)
      expect(result2.totalDistance).toBe(result3.totalDistance)
      
      // Second result should be cached
      expect(result1.cached).toBe(false)
      expect(result2.cached).toBe(true)
      expect(result3.cached).toBe(false) // Force refresh
    })

    it('should maintain consistency across multiple identical requests', async () => {
      const pickup = { province: 'İstanbul', district: 'Beyoğlu' }
      const dropoff = { province: 'İzmir', district: 'Konak' }

      // Mock Google API responses
      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 480000 } // 480 km
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // Multiple parallel requests
      const promises = Array(10).fill(null).map(() => 
        distanceCalculator.calculateDistance(pickup, dropoff, false)
      )

      const results = await Promise.all(promises)

      // All results should be identical
      const distances = results.map(r => r.totalDistance)
      const uniqueDistances = [...new Set(distances)]
      
      expect(uniqueDistances).toHaveLength(1)
      expect(results[0].totalDistance).toBeGreaterThan(0)
    })
  })

  // ============================================
  // CACHE BEHAVIOR TESTS
  // ============================================
  describe('Cache Behavior', () => {
    it('should cache table results', async () => {
      const pickup = { province: 'Ankara', district: 'Keçiören' }
      const dropoff = { province: 'Konya', district: 'Selçuklu' }

      const result1 = await distanceCalculator.calculateDistance(pickup, dropoff, false)
      expect(result1.method).toBe('table')
      expect(result1.cached).toBe(false)

      const result2 = await distanceCalculator.calculateDistance(pickup, dropoff, false)
      expect(result2.method).toBe('cached')
      expect(result2.cached).toBe(true)
      expect(result2.totalDistance).toBe(result1.totalDistance)

      // Mesafe tablosu kullanıldığı için hiçbir dış servis çağrılmaz
      expect(global.fetch).toHaveBeenCalledTimes(0)
    })

    it('should generate consistent cache keys', () => {
      const key1 = distanceCacheService.generateKey('Ankara', 'Çankaya', 'İstanbul', 'Beyoğlu', false)
      const key2 = distanceCacheService.generateKey('ankara', 'çankaya', 'istanbul', 'beyoğlu', false)
      const key3 = distanceCacheService.generateKey('ANKARA', 'ÇANKAYA', 'İSTANBUL', 'BEYOĞLU', false)

      // Keys should be consistent and contain expected parts
      expect(key1).toContain('ankara-çankaya')
      expect(key1).toContain('regular')
      expect(key2).toContain('ankara-çankaya')
      expect(key2).toContain('regular')
      expect(key3).toContain('ankara-çankaya')
      expect(key3).toContain('regular')
      
      // All keys should have the same structure
      expect(key1.split(':').length).toBe(4)
      expect(key2.split(':').length).toBe(4)
      expect(key3.split(':').length).toBe(4)
    })

    it('should differentiate VIP and regular transfers in cache', () => {
      const regularKey = distanceCacheService.generateKey('Ankara', 'Çankaya', 'İstanbul', 'Beyoğlu', false)
      const vipKey = distanceCacheService.generateKey('Ankara', 'Çankaya', 'İstanbul', 'Beyoğlu', true)

      expect(regularKey).not.toBe(vipKey)
      expect(regularKey).toContain('regular')
      expect(vipKey).toContain('vip')
    })
  })

  // ============================================
  // VIP TRANSFER TESTS
  // ============================================
  describe('VIP Transfer Calculations', () => {
    it('should calculate Ankara departure VIP transfer correctly (distance x2)', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'İzmir', district: 'Konak' }
      const oneWay = kmFromAnkara('İzmir', 'Konak') as number

      const result = await distanceCalculator.calculateDistance(pickup, dropoff, true)

      expect(oneWay).toBeGreaterThan(400)
      expect(result.totalDistance).toBe(oneWay * 2)
      expect(result.isVipTransfer).toBe(true)
      expect(result.segments).toHaveLength(2) // Round trip
      expect(result.method).toBe('table')
    })

    it('should calculate Ankara arrival VIP transfer correctly (distance x2)', async () => {
      const pickup = { province: 'Samsun', district: 'İlkadım' }
      const dropoff = { province: 'Ankara', district: 'Çankaya' }
      const oneWay = kmFromAnkara('Samsun', 'İlkadım') as number

      const result = await distanceCalculator.calculateDistance(pickup, dropoff, true)

      expect(result.totalDistance).toBe(oneWay * 2)
      expect(result.isVipTransfer).toBe(true)
      expect(result.segments).toHaveLength(2) // Round trip
    })

    it('should price distant Ankara districts higher than central ones (regression: flat 30 km)', async () => {
      const far = await distanceCalculator.calculateDistance(
        { province: 'Ankara', district: 'Şereflikoçhisar' },
        { province: 'Ankara', district: 'Keçiören' },
        true
      )
      const near = await distanceCalculator.calculateDistance(
        { province: 'Ankara', district: 'Çankaya' },
        { province: 'Ankara', district: 'Keçiören' },
        true
      )

      expect(far.method).toBe('table')
      expect(far.totalDistance).toBeGreaterThan(100) // Şereflikoçhisar Ankara merkeze ~150 km
      expect(near.totalDistance).toBeLessThan(40)
      expect(far.totalDistance).toBeGreaterThan(near.totalDistance * 3)
    })

    it('should calculate non-Ankara VIP transfer correctly (3-segment)', async () => {
      const pickup = { province: 'İzmir', district: 'Konak' }
      const dropoff = { province: 'İstanbul', district: 'Beyoğlu' }

      const result = await distanceCalculator.calculateDistance(pickup, dropoff, true)

      expect(result.isVipTransfer).toBe(true)
      expect(result.method).toBe('table')
      expect(result.segments).toHaveLength(3)
      expect(result.breakdown?.ankaraToPickup).toBe(kmFromAnkara('İzmir', 'Konak'))
      expect(result.breakdown?.dropoffToAnkara).toBe(kmFromAnkara('İstanbul', 'Beyoğlu'))
      expect(result.breakdown?.pickupToDropoff).toBeGreaterThan(200)
      expect(result.totalDistance).toBe(
        (result.breakdown?.ankaraToPickup as number) +
          (result.breakdown?.pickupToDropoff as number) +
          (result.breakdown?.dropoffToAnkara as number)
      )
    })
  })

  // ============================================
  // FALLBACK CALCULATION TESTS
  // ============================================
  describe('Fallback Calculations', () => {
    it('should use province fallback when the district is not in the table', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'İzmir', district: 'Olmayan İlçe' }

      const result = await distanceCalculator.calculateDistance(pickup, dropoff, false)

      expect(result.method).toBe('fallback')
      expect(result.totalDistance).toBeGreaterThan(0)
      expect(result.segments).toHaveLength(3)
    })

    it('should provide consistent fallback results', async () => {
      const pickup = { province: 'İstanbul', district: 'Adalar' } // tabloda karayolu mesafesi yok (ada)
      const dropoff = { province: 'Antalya', district: 'Muratpaşa' }

      const result1 = await distanceCalculator.calculateDistance(pickup, dropoff, false)
      const result2 = await distanceCalculator.calculateDistance(pickup, dropoff, false)

      expect(result1.totalDistance).toBe(result2.totalDistance)
      expect(result1.method).toBe('fallback')
      expect(result2.method).toBe('cached') // Second call uses cache
    })

    it('should handle VIP fallback calculations correctly', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'İzmir', district: 'Olmayan İlçe' }

      const result = await distanceCalculator.calculateDistance(pickup, dropoff, true)

      expect(result.method).toBe('fallback')
      expect(result.isVipTransfer).toBe(true)
      expect(result.totalDistance).toBe(1154) // 577 * 2 from fallback data
    })
  })

  // ============================================
  // PROPERTY-BASED TESTS
  // ============================================
  describe('Property-Based Tests', () => {
    it('should satisfy distance consistency property', async () => {
      const testRoutes = [
        { pickup: { province: 'Ankara', district: 'Çankaya' }, dropoff: { province: 'İstanbul', district: 'Beyoğlu' } },
        { pickup: { province: 'İzmir', district: 'Konak' }, dropoff: { province: 'Antalya', district: 'Muratpaşa' } },
        { pickup: { province: 'Bursa', district: 'Osmangazi' }, dropoff: { province: 'Konya', district: 'Selçuklu' } }
      ]

      // Mock consistent API responses
      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 300000 } // 300 km
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      for (const route of testRoutes) {
        const results = await Promise.all([
          distanceCalculator.calculateDistance(route.pickup, route.dropoff, false),
          distanceCalculator.calculateDistance(route.pickup, route.dropoff, false),
          distanceCalculator.calculateDistance(route.pickup, route.dropoff, false)
        ])

        // All results for the same route should be identical
        const distances = results.map(r => r.totalDistance)
        const uniqueDistances = [...new Set(distances)]
        expect(uniqueDistances).toHaveLength(1)
      }
    })

    it('should satisfy VIP transfer calculation property', async () => {
      const ankaraRoutes = [
        { pickup: { province: 'Ankara', district: 'Çankaya' }, dropoff: { province: 'İstanbul', district: 'Beyoğlu' } },
        { pickup: { province: 'İzmir', district: 'Konak' }, dropoff: { province: 'Ankara', district: 'Keçiören' } }
      ]

      for (const route of ankaraRoutes) {
        const vipResult = await distanceCalculator.calculateDistance(route.pickup, route.dropoff, true)

        // VIP transfers involving Ankara should use x2 calculation
        const other = route.pickup.province === 'Ankara' ? route.dropoff : route.pickup
        expect(vipResult.totalDistance).toBe((kmFromAnkara(other.province, other.district) as number) * 2)
        expect(vipResult.segments).toHaveLength(2) // Round trip
      }
    })

    it('should satisfy cache behavior property', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'Konya', district: 'Selçuklu' }

      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 260000 } // 260 km
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // Fresh calculation
      const freshResult = await distanceCalculator.calculateDistance(pickup, dropoff, false, true)
      
      // Cached calculation
      const cachedResult = await distanceCalculator.calculateDistance(pickup, dropoff, false, false)

      // Results should be identical
      expect(freshResult.totalDistance).toBe(cachedResult.totalDistance)
      expect(freshResult.cached).toBe(false)
      expect(cachedResult.cached).toBe(true)
    })
  })

  // ============================================
  // PERFORMANCE TESTS
  // ============================================
  describe('Performance', () => {
    it('should complete cached calculations quickly', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'İstanbul', district: 'Beyoğlu' }

      // First calculation to populate cache
      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 450000 }
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await distanceCalculator.calculateDistance(pickup, dropoff, false)

      // Measure cached calculation time
      const start = Date.now()
      await distanceCalculator.calculateDistance(pickup, dropoff, false)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(10) // Should be very fast from cache
    })

    it('should handle multiple concurrent requests efficiently', async () => {
      const pickup = { province: 'Ankara', district: 'Çankaya' }
      const dropoff = { province: 'İzmir', district: 'Konak' }

      const mockResponse = {
        status: 'OK',
        rows: [{
          elements: [{
            status: 'OK',
            distance: { value: 577000 }
          }]
        }]
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const start = Date.now()
      
      // 50 concurrent requests
      const promises = Array(50).fill(null).map(() =>
        distanceCalculator.calculateDistance(pickup, dropoff, false)
      )

      const results = await Promise.all(promises)
      const duration = Date.now() - start

      // All results should be identical
      const distances = results.map(r => r.totalDistance)
      const uniqueDistances = [...new Set(distances)]
      expect(uniqueDistances).toHaveLength(1)

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(5000) // 5 seconds max
    })
  })
})