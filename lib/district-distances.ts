// Tek seferlik hazırlanmış ilçe mesafe tablosu (lib/data/ilce-mesafe.json).
// Koordinatlar OpenStreetMap/Nominatim, Ankara merkezden karayolu km OSRM ile üretildi;
// çalışma anında hiçbir dış servis çağrılmaz. Yeniden üretmek için scripts/build-distance-table.mjs.

import table from './data/ilce-mesafe.json'

interface DistrictEntry {
  lat: number
  lon: number
  km: number | null
}

interface DistanceTable {
  districts: Record<string, DistrictEntry>
  ankaraPairs: Record<string, number>
}

const data = table as unknown as DistanceTable

// Aynı ilçe/il arasında alt sınır (tek ilçe içi transfer bile sıfır km olmasın)
const MIN_PAIR_KM = 5
// Ankara dışı çiftlerde kuş uçuşu mesafe x karayolu katsayısı
const ROAD_FACTOR = 1.3

const trLower = (s: string) => s.toLocaleLowerCase('tr-TR').trim()

const normalizedIndex = new Map<string, string>()
for (const key of Object.keys(data.districts)) {
  const [province, district] = key.split('|')
  normalizedIndex.set(`${trLower(province)}|${trLower(district)}`, key)
}

function entryFor(province: string, district: string): DistrictEntry | null {
  const exact = data.districts[`${province}|${district}`]
  if (exact) return exact
  const key = normalizedIndex.get(`${trLower(province)}|${trLower(district)}`)
  return key ? data.districts[key] : null
}

function haversineKm(a: DistrictEntry, b: DistrictEntry): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** Ankara merkezden ilçeye karayolu km. Bilinmiyorsa null. */
export function kmFromAnkara(province: string, district: string): number | null {
  const e = entryFor(province, district)
  return e && e.km != null ? e.km : null
}

/** İki ilçe arası km: Ankara ilçeleri arasında gerçek karayolu, diğerlerinde kuş uçuşu x 1,3. */
export function kmBetween(
  pickup: { province: string; district: string },
  dropoff: { province: string; district: string }
): number | null {
  const a = entryFor(pickup.province, pickup.district)
  const b = entryFor(dropoff.province, dropoff.district)
  if (!a || !b) return null

  if (trLower(pickup.province) === 'ankara' && trLower(dropoff.province) === 'ankara') {
    const pairKey = `${pickup.district}|${dropoff.district}`
    const exact = data.ankaraPairs[pairKey]
    if (exact != null) return Math.max(exact, MIN_PAIR_KM)
  }

  return Math.max(Math.round(haversineKm(a, b) * ROAD_FACTOR), MIN_PAIR_KM)
}
