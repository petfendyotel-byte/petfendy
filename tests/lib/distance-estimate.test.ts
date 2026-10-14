import { describe, it, expect } from 'vitest'
import { estimateRoadKm, normalizeProvince, PROVINCE_COORDS } from '@/lib/tr-provinces'
import { mockTurkishCities } from '@/lib/mock-data'

describe('il adı normalleştirme', () => {
  it('Türkçe karakterleri ve takma adları çözer', () => {
    expect(normalizeProvince('İstanbul')).toBe('istanbul')
    expect(normalizeProvince('Şanlıurfa')).toBe('sanliurfa')
    expect(normalizeProvince('Iğdır')).toBe('igdir')
    expect(normalizeProvince('Afyon')).toBe('afyonkarahisar')
    expect(normalizeProvince('  Çanakkale ')).toBe('canakkale')
  })
})

describe('tahmini karayolu mesafesi', () => {
  it('uygulamadaki 81 ilin hepsinin koordinatı var', () => {
    const missing = mockTurkishCities.filter((city: string) => !PROVINCE_COORDS[normalizeProvince(city)])
    expect(missing).toEqual([])
    expect(Object.keys(PROVINCE_COORDS)).toHaveLength(81)
  })
  it('Ankara-Batman gerçekçi (eskiden 300 km sayılıyordu)', () => {
    const km = estimateRoadKm('Ankara', 'Batman')!
    expect(km).toBeGreaterThan(850)
    expect(km).toBeLessThan(1100)
  })
  it('Ankara-Diyarbakır ve Ankara-Batman birbirine yakın, Batman daha uzak', () => {
    const diyarbakir = estimateRoadKm('Ankara', 'Diyarbakır')!
    const batman = estimateRoadKm('Ankara', 'Batman')!
    expect(diyarbakir).toBeGreaterThan(800)
    expect(diyarbakir).toBeLessThan(1000)
    expect(batman).toBeGreaterThan(diyarbakir)
    expect(batman - diyarbakir).toBeLessThan(150)
  })
  it('bilinen kısa mesafeler makul', () => {
    expect(estimateRoadKm('Ankara', 'Eskişehir')!).toBeGreaterThan(200)
    expect(estimateRoadKm('Ankara', 'Eskişehir')!).toBeLessThan(300)
    expect(estimateRoadKm('İstanbul', 'Kocaeli')!).toBeLessThan(150)
  })
  it('bilinmeyen il null döner, iki yön simetrik', () => {
    expect(estimateRoadKm('Atlantis', 'Ankara')).toBeNull()
    expect(estimateRoadKm('Van', 'İzmir')).toBe(estimateRoadKm('İzmir', 'Van'))
  })
})
