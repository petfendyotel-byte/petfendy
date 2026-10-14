// 81 ilin merkez koordinatları. Google Distance Matrix kullanılamadığında (anahtar reddedildi, kota, ağ hatası)
// karayolu mesafesini kabaca tahmin etmek için kullanılır: kuş uçuşu mesafe x yol katsayısı.
// Bu bir TAHMİNdir; Google sonucu kadar doğru değildir.

export const PROVINCE_COORDS: Record<string, [number, number]> = {
  adana: [37.0, 35.32], adiyaman: [37.76, 38.28], afyonkarahisar: [38.76, 30.54], agri: [39.72, 43.05],
  aksaray: [38.37, 34.03], amasya: [40.65, 35.83], ankara: [39.93, 32.86], antalya: [36.89, 30.71],
  ardahan: [41.11, 42.7], artvin: [41.18, 41.82], aydin: [37.85, 27.84], balikesir: [39.65, 27.89],
  bartin: [41.64, 32.34], batman: [37.89, 41.13], bayburt: [40.26, 40.23], bilecik: [40.14, 29.98],
  bingol: [38.88, 40.5], bitlis: [38.4, 42.11], bolu: [40.73, 31.61], burdur: [37.72, 30.29],
  bursa: [40.19, 29.06], canakkale: [40.15, 26.41], cankiri: [40.6, 33.62], corum: [40.55, 34.95],
  denizli: [37.78, 29.09], diyarbakir: [37.91, 40.24], duzce: [40.84, 31.16], edirne: [41.68, 26.56],
  elazig: [38.67, 39.22], erzincan: [39.75, 39.49], erzurum: [39.9, 41.27], eskisehir: [39.78, 30.52],
  gaziantep: [37.07, 37.38], giresun: [40.91, 38.39], gumushane: [40.46, 39.48], hakkari: [37.58, 43.74],
  hatay: [36.2, 36.16], igdir: [39.92, 44.04], isparta: [37.76, 30.55], istanbul: [41.01, 28.98],
  izmir: [38.42, 27.14], kahramanmaras: [37.58, 36.94], karabuk: [41.2, 32.63], karaman: [37.18, 33.23],
  kars: [40.6, 43.1], kastamonu: [41.38, 33.78], kayseri: [38.73, 35.49], kilis: [36.72, 37.12],
  kirikkale: [39.85, 33.52], kirklareli: [41.74, 27.23], kirsehir: [39.15, 34.17], kocaeli: [40.77, 29.94],
  konya: [37.87, 32.48], kutahya: [39.42, 29.98], malatya: [38.35, 38.31], manisa: [38.61, 27.43],
  mardin: [37.31, 40.74], mersin: [36.8, 34.64], mugla: [37.22, 28.36], mus: [38.74, 41.5],
  nevsehir: [38.62, 34.71], nigde: [37.97, 34.68], ordu: [40.98, 37.88], osmaniye: [37.07, 36.25],
  rize: [41.02, 40.52], sakarya: [40.76, 30.4], samsun: [41.29, 36.33], siirt: [37.93, 41.94],
  sinop: [42.03, 35.15], sivas: [39.75, 37.02], sanliurfa: [37.16, 38.8], sirnak: [37.52, 42.46],
  tekirdag: [40.98, 27.51], tokat: [40.31, 36.55], trabzon: [41.0, 39.72], tunceli: [39.11, 39.55],
  usak: [38.68, 29.41], van: [38.49, 43.38], yalova: [40.65, 29.27], yozgat: [39.82, 34.81],
  zonguldak: [41.45, 31.8],
}

const ALIASES: Record<string, string> = {
  afyon: 'afyonkarahisar', icel: 'mersin', antakya: 'hatay', izmit: 'kocaeli', adapazari: 'sakarya',
  maras: 'kahramanmaras', urfa: 'sanliurfa', antep: 'gaziantep',
}

const TR_ASCII: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }

// "Şanlıurfa" -> "sanliurfa", "İstanbul" -> "istanbul"
export function normalizeProvince(name: string): string {
  const lower = name.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
  const ascii = lower.replace(/[çğıöşüâîû]/g, (ch) => TR_ASCII[ch] ?? ch).replace(/[^a-z]/g, '')
  return ALIASES[ascii] ?? ascii
}

const EARTH_RADIUS_KM = 6371
// Türkiye karayolu mesafesi kuş uçuşunun yaklaşık 1,25-1,35 katıdır (dağlık güzergâhlarda daha fazla).
const ROAD_FACTOR = 1.3

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// İki il merkezi arası tahmini karayolu mesafesi (km). İl bilinmiyorsa null.
export function estimateRoadKm(provinceA: string, provinceB: string): number | null {
  const a = PROVINCE_COORDS[normalizeProvince(provinceA)]
  const b = PROVINCE_COORDS[normalizeProvince(provinceB)]
  if (!a || !b) return null
  return Math.round(haversineKm(a, b) * ROAD_FACTOR)
}
