/**
 * Enhanced Distance Calculator Service
 * 
 * Tutarlı mesafe hesaplamaları için cache entegrasyonu ile geliştirilmiş hesaplama servisi.
 * Aynı rotalar için her zaman aynı mesafeyi döndürür.
 */

import { distanceCacheService, type DistanceSegment } from './distance-cache'

interface Location {
  province: string
  district: string
}

interface DistanceCalculationResult {
  totalDistance: number
  method: 'google' | 'fallback' | 'cached'
  cached: boolean
  segments: DistanceSegment[]
  calculatedAt: Date
  isVipTransfer: boolean
  breakdown?: {
    ankaraToPickup?: number
    pickupToDropoff?: number
    dropoffToAnkara?: number
  }
  cacheKey: string
  expiresAt?: Date
}

interface GoogleMapsResponse {
  status: string
  rows: Array<{
    elements: Array<{
      status: string
      distance: {
        value: number
        text: string
      }
      duration: {
        value: number
        text: string
      }
    }>
  }>
}

class DistanceCalculator {
  private readonly GOOGLE_API_TIMEOUT = 10000 // 10 saniye
  private readonly RETRY_ATTEMPTS = 3
  private readonly RETRY_DELAY = 1000 // 1 saniye

  /**
   * Ana mesafe hesaplama metodu - cache entegrasyonu ile
   */
  async calculateDistance(
    pickup: Location,
    dropoff: Location,
    isVip: boolean = false,
    forceRefresh: boolean = false
  ): Promise<DistanceCalculationResult> {
    const cacheKey = distanceCacheService.generateKey(
      pickup.province,
      pickup.district,
      dropoff.province,
      dropoff.district,
      isVip
    )

    // Cache kontrolü (force refresh değilse)
    if (!forceRefresh) {
      const cached = await distanceCacheService.get(cacheKey)
      if (cached) {
        return {
          totalDistance: cached.distance,
          method: 'cached',
          cached: true,
          segments: cached.segments || [],
          calculatedAt: cached.calculatedAt,
          isVipTransfer: cached.isVipTransfer,
          cacheKey,
          expiresAt: cached.expiresAt
        }
      }
    }

    // Yeni hesaplama yap
    let result: DistanceCalculationResult

    try {
      // Google API ile hesapla
      result = await this.calculateWithGoogle(pickup, dropoff, isVip, cacheKey)
    } catch (error) {
      console.warn('Google API failed, using fallback:', error)
      // Fallback hesaplama
      result = this.calculateFallback(pickup, dropoff, isVip, cacheKey)
    }

    // Sonucu cache'e kaydet
    await distanceCacheService.set(
      cacheKey,
      result.totalDistance,
      result.method as 'google' | 'fallback',
      result.segments,
      isVip
    )

    return result
  }

  /**
   * Google Distance Matrix API ile hesaplama
   */
  private async calculateWithGoogle(
    pickup: Location,
    dropoff: Location,
    isVip: boolean,
    cacheKey: string
  ): Promise<DistanceCalculationResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new Error('Google Maps API key not found')
    }

    if (isVip) {
      return this.calculateVipWithGoogle(pickup, dropoff, apiKey, cacheKey)
    }

    // Normal transfer hesaplama
    const ankaraLocation = 'Ankara, Turkey'
    const pickupLocation = `${pickup.district}, ${pickup.province}, Turkey`
    const dropoffLocation = `${dropoff.district}, ${dropoff.province}, Turkey`

    // Paralel API çağrıları
    const [ankaraToPickup, pickupToDropoff, dropoffToAnkara] = await Promise.all([
      this.getDistanceFromGoogle(ankaraLocation, pickupLocation, apiKey),
      this.getDistanceFromGoogle(pickupLocation, dropoffLocation, apiKey),
      this.getDistanceFromGoogle(dropoffLocation, ankaraLocation, apiKey)
    ])

    if (ankaraToPickup === null || pickupToDropoff === null || dropoffToAnkara === null) {
      throw new Error('Google API returned null distances')
    }

    const totalDistance = Math.round(ankaraToPickup + pickupToDropoff + dropoffToAnkara)
    const segments: DistanceSegment[] = [
      { from: ankaraLocation, to: pickupLocation, distance: ankaraToPickup },
      { from: pickupLocation, to: dropoffLocation, distance: pickupToDropoff },
      { from: dropoffLocation, to: ankaraLocation, distance: dropoffToAnkara }
    ]

    return {
      totalDistance,
      method: 'google',
      cached: false,
      segments,
      calculatedAt: new Date(),
      isVipTransfer: false,
      breakdown: {
        ankaraToPickup,
        pickupToDropoff,
        dropoffToAnkara
      },
      cacheKey
    }
  }

  /**
   * VIP Transfer için Google API hesaplama
   */
  private async calculateVipWithGoogle(
    pickup: Location,
    dropoff: Location,
    apiKey: string,
    cacheKey: string
  ): Promise<DistanceCalculationResult> {
    const ankaraLocation = 'Ankara, Turkey'

    // Ankara çıkışlı transfer: Ankara → Hedef x2
    if (pickup.province === 'Ankara') {
      const dropoffLocation = `${dropoff.district}, ${dropoff.province}, Turkey`
      const distance = await this.getDistanceFromGoogle(ankaraLocation, dropoffLocation, apiKey)
      
      if (distance === null) {
        throw new Error('Google API failed for Ankara departure VIP transfer')
      }

      const totalDistance = Math.round(distance * 2)
      const segments: DistanceSegment[] = [
        { from: ankaraLocation, to: dropoffLocation, distance },
        { from: dropoffLocation, to: ankaraLocation, distance }
      ]

      return {
        totalDistance,
        method: 'google',
        cached: false,
        segments,
        calculatedAt: new Date(),
        isVipTransfer: true,
        cacheKey
      }
    }

    // Ankara varışlı transfer: Başlangıç → Ankara x2
    if (dropoff.province === 'Ankara') {
      const pickupLocation = `${pickup.district}, ${pickup.province}, Turkey`
      const distance = await this.getDistanceFromGoogle(pickupLocation, ankaraLocation, apiKey)
      
      if (distance === null) {
        throw new Error('Google API failed for Ankara arrival VIP transfer')
      }

      const totalDistance = Math.round(distance * 2)
      const segments: DistanceSegment[] = [
        { from: pickupLocation, to: ankaraLocation, distance },
        { from: ankaraLocation, to: pickupLocation, distance }
      ]

      return {
        totalDistance,
        method: 'google',
        cached: false,
        segments,
        calculatedAt: new Date(),
        isVipTransfer: true,
        cacheKey
      }
    }

    // Ankara dışı çıkışlı transferler: 3 segment
    const pickupLocation = `${pickup.district}, ${pickup.province}, Turkey`
    const dropoffLocation = `${dropoff.district}, ${dropoff.province}, Turkey`

    const [ankaraToPickup, pickupToDropoff, dropoffToAnkara] = await Promise.all([
      this.getDistanceFromGoogle(ankaraLocation, pickupLocation, apiKey),
      this.getDistanceFromGoogle(pickupLocation, dropoffLocation, apiKey),
      this.getDistanceFromGoogle(dropoffLocation, ankaraLocation, apiKey)
    ])

    if (ankaraToPickup === null || pickupToDropoff === null || dropoffToAnkara === null) {
      throw new Error('Google API failed for non-Ankara VIP transfer')
    }

    const totalDistance = Math.round(ankaraToPickup + pickupToDropoff + dropoffToAnkara)
    const segments: DistanceSegment[] = [
      { from: ankaraLocation, to: pickupLocation, distance: ankaraToPickup },
      { from: pickupLocation, to: dropoffLocation, distance: pickupToDropoff },
      { from: dropoffLocation, to: ankaraLocation, distance: dropoffToAnkara }
    ]

    return {
      totalDistance,
      method: 'google',
      cached: false,
      segments,
      calculatedAt: new Date(),
      isVipTransfer: true,
      breakdown: {
        ankaraToPickup,
        pickupToDropoff,
        dropoffToAnkara
      },
      cacheKey
    }
  }

  /**
   * Google Distance Matrix API çağrısı - tutarlı parametrelerle
   */
  private async getDistanceFromGoogle(
    origin: string,
    destination: string,
    apiKey: string
  ): Promise<number | null> {
    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
        
        // Tutarlı parametreler - trafik bağımlı parametreleri kaldır
        url.searchParams.append('origins', origin)
        url.searchParams.append('destinations', destination)
        url.searchParams.append('key', apiKey)
        url.searchParams.append('units', 'metric')
        url.searchParams.append('mode', 'driving')
        url.searchParams.append('avoid', 'tolls') // Tutarlı rota seçimi için
        // departure_time ve traffic_model parametrelerini kaldırdık

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.GOOGLE_API_TIMEOUT)

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Petfendy-Distance-Calculator/1.0'
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: GoogleMapsResponse = await response.json()

        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
          const distanceInMeters = data.rows[0].elements[0].distance.value
          const distanceInKm = Math.round(distanceInMeters / 1000)
          
          console.log(`Google API: ${origin} → ${destination} = ${distanceInKm}km`)
          return distanceInKm
        }

        console.warn(`Google API error: ${data.status}, element status: ${data.rows[0]?.elements[0]?.status}`)
        return null

      } catch (error) {
        console.warn(`Google API attempt ${attempt}/${this.RETRY_ATTEMPTS} failed:`, error)
        
        if (attempt < this.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt))
        }
      }
    }

    return null
  }

  /**
   * Fallback hesaplama - Google API başarısız olduğunda
   */
  private calculateFallback(
    pickup: Location,
    dropoff: Location,
    isVip: boolean,
    cacheKey: string
  ): DistanceCalculationResult {
    if (isVip) {
      return this.calculateVipFallback(pickup, dropoff, cacheKey)
    }

    // Normal transfer fallback
    const { ankaraToPickup, pickupToDropoff, dropoffToAnkara } = this.getFallbackDistances(
      pickup.province,
      dropoff.province
    )

    const totalDistance = ankaraToPickup + pickupToDropoff + dropoffToAnkara
    const segments: DistanceSegment[] = [
      { from: 'Ankara, Turkey', to: `${pickup.district}, ${pickup.province}, Turkey`, distance: ankaraToPickup },
      { from: `${pickup.district}, ${pickup.province}, Turkey`, to: `${dropoff.district}, ${dropoff.province}, Turkey`, distance: pickupToDropoff },
      { from: `${dropoff.district}, ${dropoff.province}, Turkey`, to: 'Ankara, Turkey', distance: dropoffToAnkara }
    ]

    return {
      totalDistance,
      method: 'fallback',
      cached: false,
      segments,
      calculatedAt: new Date(),
      isVipTransfer: false,
      breakdown: {
        ankaraToPickup,
        pickupToDropoff,
        dropoffToAnkara
      },
      cacheKey
    }
  }

  /**
   * VIP Transfer fallback hesaplama
   */
  private calculateVipFallback(
    pickup: Location,
    dropoff: Location,
    cacheKey: string
  ): DistanceCalculationResult {
    const distancesFromAnkara = this.getDistancesFromAnkara()

    // Ankara çıkışlı transfer
    if (pickup.province === 'Ankara') {
      const oneWayDistance = distancesFromAnkara[dropoff.province] || 300
      const totalDistance = oneWayDistance * 2
      const segments: DistanceSegment[] = [
        { from: 'Ankara, Turkey', to: `${dropoff.district}, ${dropoff.province}, Turkey`, distance: oneWayDistance },
        { from: `${dropoff.district}, ${dropoff.province}, Turkey`, to: 'Ankara, Turkey', distance: oneWayDistance }
      ]

      return {
        totalDistance,
        method: 'fallback',
        cached: false,
        segments,
        calculatedAt: new Date(),
        isVipTransfer: true,
        cacheKey
      }
    }

    // Ankara varışlı transfer
    if (dropoff.province === 'Ankara') {
      const oneWayDistance = distancesFromAnkara[pickup.province] || 300
      const totalDistance = oneWayDistance * 2
      const segments: DistanceSegment[] = [
        { from: `${pickup.district}, ${pickup.province}, Turkey`, to: 'Ankara, Turkey', distance: oneWayDistance },
        { from: 'Ankara, Turkey', to: `${pickup.district}, ${pickup.province}, Turkey`, distance: oneWayDistance }
      ]

      return {
        totalDistance,
        method: 'fallback',
        cached: false,
        segments,
        calculatedAt: new Date(),
        isVipTransfer: true,
        cacheKey
      }
    }

    // Ankara dışı çıkışlı transferler
    const { ankaraToPickup, pickupToDropoff, dropoffToAnkara } = this.getFallbackDistances(
      pickup.province,
      dropoff.province
    )

    const totalDistance = ankaraToPickup + pickupToDropoff + dropoffToAnkara
    const segments: DistanceSegment[] = [
      { from: 'Ankara, Turkey', to: `${pickup.district}, ${pickup.province}, Turkey`, distance: ankaraToPickup },
      { from: `${pickup.district}, ${pickup.province}, Turkey`, to: `${dropoff.district}, ${dropoff.province}, Turkey`, distance: pickupToDropoff },
      { from: `${dropoff.district}, ${dropoff.province}, Turkey`, to: 'Ankara, Turkey', distance: dropoffToAnkara }
    ]

    return {
      totalDistance,
      method: 'fallback',
      cached: false,
      segments,
      calculatedAt: new Date(),
      isVipTransfer: true,
      breakdown: {
        ankaraToPickup,
        pickupToDropoff,
        dropoffToAnkara
      },
      cacheKey
    }
  }

  /**
   * Fallback mesafe verilerini getirir
   */
  private getFallbackDistances(pickupProvince: string, dropoffProvince: string) {
    const distancesFromAnkara = this.getDistancesFromAnkara()
    const interCityDistances = this.getInterCityDistances()

    const ankaraToPickup = distancesFromAnkara[pickupProvince] || 300
    const dropoffToAnkara = distancesFromAnkara[dropoffProvince] || 300

    let pickupToDropoff: number
    if (pickupProvince === dropoffProvince) {
      pickupToDropoff = 30 // Aynı il içi
    } else {
      const directKey = `${pickupProvince}-${dropoffProvince}`
      pickupToDropoff = interCityDistances[directKey] || 
        Math.round(Math.sqrt(
          Math.pow(ankaraToPickup, 2) + 
          Math.pow(dropoffToAnkara, 2) - 
          ankaraToPickup * dropoffToAnkara
        ))
    }

    return { ankaraToPickup, pickupToDropoff, dropoffToAnkara }
  }

  /**
   * Ankara'dan diğer illere mesafeler
   */
  private getDistancesFromAnkara(): Record<string, number> {
    return {
      "Ankara": 30,
      "İstanbul": 450,
      "İzmir": 577,
      "Antalya": 480,
      "Bursa": 380,
      "Adana": 490,
      "Konya": 260,
      "Gaziantep": 670,
      "Mersin": 480,
      "Kayseri": 320,
      "Eskişehir": 230,
      "Samsun": 440,
      "Denizli": 480,
      "Muğla": 600,
      "Aydın": 550,
      "Trabzon": 760,
      "Diyarbakır": 920,
      "Erzurum": 880,
      "Malatya": 680,
      "Van": 1200,
    }
  }

  /**
   * İller arası direkt mesafeler
   */
  private getInterCityDistances(): Record<string, number> {
    return {
      "İzmir-İstanbul": 480,
      "İstanbul-İzmir": 480,
      "Konya-İstanbul": 660,
      "İstanbul-Konya": 660,
      "Konya-İzmir": 570,
      "İzmir-Konya": 570,
      "Konya-Antalya": 300,
      "Antalya-Konya": 300,
      "İstanbul-Antalya": 700,
      "Antalya-İstanbul": 700,
      "İstanbul-Bursa": 150,
      "Bursa-İstanbul": 150,
      "Adana-Mersin": 70,
      "Mersin-Adana": 70,
      "Adana-Gaziantep": 220,
      "Gaziantep-Adana": 220,
    }
  }
}

// Singleton instance
export const distanceCalculator = new DistanceCalculator()

export type { DistanceCalculationResult, Location }