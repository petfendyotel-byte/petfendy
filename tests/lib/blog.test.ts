import { describe, it, expect, vi } from 'vitest'

// Veritabanına bağlanmadan yalnızca saf fonksiyonları sınar.
vi.mock('@/lib/prisma', () => ({ default: {} }))

import { slugify, isValidSlug, stripHtml } from '@/lib/blog-shared'
import { sanitizeBlogHtml, parseBlogInput } from '@/lib/blog-db'

describe('slugify', () => {
  it('Türkçe karakterleri dönüştürür', () => {
    expect(slugify('Pet Taksi ile Güvenli Seyahat İpuçları!')).toBe('pet-taksi-ile-guvenli-seyahat-ipuclari')
    expect(slugify('  Çocuk & Köpek: Şöyle Ağır  ')).toBe('cocuk-kopek-soyle-agir')
  })
  it('geçerli slug kabul edilir, geçersiz reddedilir', () => {
    expect(isValidSlug('pet-otel-ankara')).toBe(true)
    expect(isValidSlug('Pet Otel')).toBe(false)
    expect(isValidSlug('a')).toBe(false)
    expect(isValidSlug('../etc')).toBe(false)
  })
})

describe('sanitizeBlogHtml', () => {
  it('script, olay işleyicileri ve tehlikeli adresleri kaldırır', () => {
    const dirty = '<p onclick="x()">Merhaba <script>alert(1)</script><a href="javascript:alert(1)">tıkla</a><img src="x" onerror="alert(1)"></p>'
    const clean = sanitizeBlogHtml(dirty)
    expect(clean).not.toMatch(/<script/i)
    expect(clean).not.toMatch(/onclick|onerror/i)
    expect(clean).not.toMatch(/javascript:/i)
    expect(clean).toContain('Merhaba')
  })
  it('izin verilen biçimlendirmeyi korur', () => {
    const html = '<h2>Başlık</h2><p style="text-align: center">Metin <strong>kalın</strong></p><ul><li>Bir</li></ul><img src="https://petfendy.com/a.jpg" alt="Köpek">'
    const clean = sanitizeBlogHtml(html)
    expect(clean).toContain('<h2>Başlık</h2>')
    expect(clean).toContain('text-align:center')
    expect(clean).toContain('<strong>kalın</strong>')
    expect(clean).toContain('alt="Köpek"')
  })
  it('bağlantılara rel=noopener ekler, http dışı resim adreslerini reddeder', () => {
    expect(sanitizeBlogHtml('<a href="https://example.com" target="_blank">x</a>')).toContain('rel="noopener noreferrer"')
    expect(sanitizeBlogHtml('<img src="data:image/png;base64,AAAA">')).not.toContain('data:')
  })
  it("Türkçe kesme işaretini bozmaz (Ankara'da)", () => {
    expect(stripHtml(sanitizeBlogHtml("<p>Ankara'da pet taksi</p>"))).toContain("Ankara")
  })
})

describe('parseBlogInput', () => {
  const base = { title: 'Pet taksi nedir?', content: '<p>İçerik</p>' }
  it('başlıktan slug üretir, yayınlanınca tarih atar', () => {
    const r = parseBlogInput({ ...base, published: true })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.slug).toBe('pet-taksi-nedir')
      expect(r.data.published).toBe(true)
      expect(r.data.publishedAt).toBeInstanceOf(Date)
      expect(r.data.category).toBe('Genel')
    }
  })
  it('taslakta yayın tarihi atanmaz', () => {
    const r = parseBlogInput({ ...base })
    expect(r.ok && r.data.publishedAt).toBeFalsy()
  })
  it('kısa başlığı, boş içeriği ve geçersiz görseli reddeder', () => {
    expect(parseBlogInput({ title: 'ab', content: '<p>x</p>' }).ok).toBe(false)
    expect(parseBlogInput({ title: 'Geçerli başlık', content: '<p></p>' }).ok).toBe(false)
    expect(parseBlogInput({ ...base, coverImage: 'javascript:alert(1)' }).ok).toBe(false)
    expect(parseBlogInput({ ...base, slug: 'Geçersiz Slug' }).ok).toBe(false)
  })
  it('etiketleri tekilleştirir ve sınırlar', () => {
    const r = parseBlogInput({ ...base, tags: ['a', 'a', ' b ', '', ...Array.from({ length: 40 }, (_, i) => `t${i}`)] })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.tags.length).toBeLessThanOrEqual(20)
      expect(new Set(r.data.tags).size).toBe(r.data.tags.length)
    }
  })
})
