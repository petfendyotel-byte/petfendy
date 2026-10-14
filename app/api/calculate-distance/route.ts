import { NextRequest, NextResponse } from 'next/server'
import { distanceCalculator } from '../../../lib/distance-calculator'
import { distanceCacheService } from '../../../lib/distance-cache'
import { optionalAuth } from '@/lib/auth-middleware'

// Enhanced Distance Calculation API with Caching
// Aynı rotalar için her zaman aynı mesafeyi döndürür
// VIP Transfer: Ankara çıkışlı-varışlı transferler için mesafe x2 hesaplanır
// Normal Transfer: Ankara → Alış Noktası → Bırakış Noktası → Ankara

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      pickupProvince, 
      pickupDistrict, 
      dropoffProvince, 
      dropoffDistrict, 
      isVipTransfer = false,
      forceRefresh = false 
    } = body

    // Input validation
    if (!pickupProvince || !pickupDistrict || !dropoffProvince || !dropoffDistrict) {
      return NextResponse.json(
        { error: 'Tüm konum bilgileri gereklidir' },
        { status: 400 }
      )
    }

    // Normalize input
    const pickup = {
      province: pickupProvince.trim(),
      district: pickupDistrict.trim()
    }
    const dropoff = {
      province: dropoffProvince.trim(),
      district: dropoffDistrict.trim()
    }

    console.log(`Distance calculation request: ${pickup.province}, ${pickup.district} → ${dropoff.province}, ${dropoff.district} (VIP: ${isVipTransfer}, Force: ${forceRefresh})`)

    // Enhanced distance calculation with caching
    const result = await distanceCalculator.calculateDistance(
      pickup,
      dropoff,
      isVipTransfer,
      forceRefresh
    )

    // Cache statistics for monitoring
    const cacheStats = distanceCacheService.getStats()
    const cacheInfo = distanceCacheService.getCacheInfo()

    console.log(`Distance calculation result: ${result.totalDistance}km (${result.method}, cached: ${result.cached})`)
    console.log(`Cache stats: ${cacheStats.hitRate.toFixed(1)}% hit rate, ${cacheInfo.size}/${cacheInfo.maxSize} entries`)

    return NextResponse.json({
      success: true,
      totalDistance: result.totalDistance,
      method: result.method,
      // true: Google kullanılamadı, mesafe 81 il koordinatlarından tahmin edildi
      estimated: result.method === 'fallback',
      cached: result.cached,
      isVipTransfer: result.isVipTransfer,
      segments: result.segments,
      breakdown: result.breakdown,
      calculatedAt: result.calculatedAt,
      expiresAt: result.expiresAt,
      cacheKey: result.cacheKey,
      cacheStats: {
        hitRate: cacheStats.hitRate,
        cacheSize: cacheInfo.size,
        maxCacheSize: cacheInfo.maxSize
      }
    })

  } catch (error) {
    console.error('Distance calculation error:', error)
    return NextResponse.json(
      { 
        error: 'Mesafe hesaplanamadı',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

// Cache management endpoints
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Önbellek yönetimi yalnızca yönetici içindir (eskiden herkes önbelleği silebiliyordu)
  const user = await optionalAuth(request)
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: user ? 403 : 401 })
  }

  try {
    switch (action) {
      case 'stats':
        const stats = distanceCacheService.getStats()
        const info = distanceCacheService.getCacheInfo()
        return NextResponse.json({
          success: true,
          stats,
          info
        })

      case 'clear':
        const pattern = searchParams.get('pattern') || undefined
        await distanceCacheService.invalidate(pattern)
        return NextResponse.json({
          success: true,
          message: pattern ? `Cache cleared for pattern: ${pattern}` : 'Cache cleared completely'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=stats or ?action=clear' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cache management error:', error)
    return NextResponse.json(
      { error: 'Cache operation failed' },
      { status: 500 }
    )
  }
}

