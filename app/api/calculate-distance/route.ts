import { NextRequest, NextResponse } from 'next/server'

// Google Distance Matrix API ile mesafe hesaplama
// Rota: Ankara → Alış Noktası → Bırakış Noktası → Ankara

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickupProvince, pickupDistrict, dropoffProvince, dropoffDistrict } = body

    if (!pickupProvince || !pickupDistrict || !dropoffProvince || !dropoffDistrict) {
      return NextResponse.json(
        { error: 'Tüm konum bilgileri gereklidir' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      // API key yoksa fallback mesafe hesaplama
      console.warn('Google Maps API key bulunamadı, fallback hesaplama kullanılıyor')
      const fallbackDistance = calculateFallbackDistance(pickupProvince, dropoffProvince)
      return NextResponse.json({ 
        totalDistance: fallbackDistance,
        success: true,
        method: 'fallback'
      })
    }

    // Konum stringleri oluştur
    const ankaraLocation = 'Ankara, Turkey'
    const pickupLocation = `${pickupDistrict}, ${pickupProvince}, Turkey`
    const dropoffLocation = `${dropoffDistrict}, ${dropoffProvince}, Turkey`

    // 1. Ankara → Alış Noktası mesafesi
    const ankaraToPickup = await getDistanceFromGoogle(ankaraLocation, pickupLocation, apiKey)
    
    // 2. Alış Noktası → Bırakış Noktası mesafesi
    const pickupToDropoff = await getDistanceFromGoogle(pickupLocation, dropoffLocation, apiKey)
    
    // 3. Bırakış Noktası → Ankara mesafesi
    const dropoffToAnkara = await getDistanceFromGoogle(dropoffLocation, ankaraLocation, apiKey)

    if (ankaraToPickup === null || pickupToDropoff === null || dropoffToAnkara === null) {
      // Google API başarısız olursa fallback kullan
      const fallbackDistance = calculateFallbackDistance(pickupProvince, dropoffProvince)
      return NextResponse.json({ 
        totalDistance: fallbackDistance,
        success: true,
        method: 'fallback'
      })
    }

    // Toplam mesafe (km cinsinden)
    const totalDistance = Math.round(ankaraToPickup + pickupToDropoff + dropoffToAnkara)

    return NextResponse.json({ 
      totalDistance,
      success: true,
      method: 'google',
      breakdown: {
        ankaraToPickup,
        pickupToDropoff,
        dropoffToAnkara
      }
    })

  } catch (error) {
    console.error('Mesafe hesaplama hatası:', error)
    return NextResponse.json(
      { error: 'Mesafe hesaplanamadı' },
      { status: 500 }
    )
  }
}

async function getDistanceFromGoogle(origin: string, destination: string, apiKey: string): Promise<number | null> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.append('origins', origin)
    url.searchParams.append('destinations', destination)
    url.searchParams.append('key', apiKey)
    url.searchParams.append('units', 'metric')

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      // Mesafe metre cinsinden geliyor, km'ye çevir
      const distanceInMeters = data.rows[0].elements[0].distance.value
      return Math.round(distanceInMeters / 1000)
    }

    return null
  } catch (error) {
    console.error('Google API hatası:', error)
    return null
  }
}

// Fallback mesafe hesaplama (Google API yoksa)
function calculateFallbackDistance(pickupProvince: string, dropoffProvince: string): number {
  // Ankara'dan diğer illere yaklaşık mesafeler (km)
  const distancesFromAnkara: Record<string, number> = {
    "Ankara": 30,
    "İstanbul": 450,
    "İzmir": 580,
    "Antalya": 480,
    "Bursa": 380,
    "Adana": 490,
    "Konya": 260,
    "Gaziantep": 670,
    "Mersin": 480,
    "Kayseri": 320,
    "Eskişehir": 230,
    "Samsun": 420,
    "Denizli": 480,
    "Muğla": 600,
    "Aydın": 550,
    "Trabzon": 760,
    "Diyarbakır": 920,
    "Erzurum": 880,
    "Malatya": 680,
    "Van": 1200,
  }

  // İller arası direkt mesafeler
  const interCityDistances: Record<string, number> = {
    "Konya-İstanbul": 660,
    "İstanbul-Konya": 660,
    "Konya-İzmir": 570,
    "İzmir-Konya": 570,
    "Konya-Antalya": 300,
    "Antalya-Konya": 300,
    "İstanbul-İzmir": 480,
    "İzmir-İstanbul": 480,
    "İstanbul-Antalya": 700,
    "Antalya-İstanbul": 700,
    "İstanbul-Bursa": 150,
    "Bursa-İstanbul": 150,
    "Adana-Mersin": 70,
    "Mersin-Adana": 70,
    "Adana-Gaziantep": 220,
    "Gaziantep-Adana": 220,
  }

  const ankaraToPickup = distancesFromAnkara[pickupProvince] || 300
  
  let pickupToDropoff: number
  if (pickupProvince === dropoffProvince) {
    pickupToDropoff = 30 // Aynı il içi
  } else {
    const directKey = `${pickupProvince}-${dropoffProvince}`
    pickupToDropoff = interCityDistances[directKey] || 
      Math.round(Math.sqrt(
        Math.pow(distancesFromAnkara[pickupProvince] || 300, 2) + 
        Math.pow(distancesFromAnkara[dropoffProvince] || 300, 2) - 
        (distancesFromAnkara[pickupProvince] || 300) * (distancesFromAnkara[dropoffProvince] || 300)
      ))
  }

  const dropoffToAnkara = distancesFromAnkara[dropoffProvince] || 300

  // Toplam: Ankara → Alış → Bırakış → Ankara
  return ankaraToPickup + pickupToDropoff + dropoffToAnkara
}
