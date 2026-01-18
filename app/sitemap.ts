import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://petfendy.com'
  const locales = ['tr', 'en']
  const lastModified = new Date()

  // Ana sayfalar - SEO odaklı öncelik sırası
  const pages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const }, // Ana sayfa
    { path: 'home', priority: 0.9, changeFreq: 'daily' as const },
    { path: 'booking/hotel', priority: 0.95, changeFreq: 'daily' as const }, // Pet Otel - yüksek öncelik
    { path: 'booking/taxi', priority: 0.95, changeFreq: 'daily' as const }, // Pet Taksi - yüksek öncelik
    { path: 'booking/daycare', priority: 0.95, changeFreq: 'daily' as const }, // Pet Kreş - yüksek öncelik
    { path: 'hakkimda', priority: 0.8, changeFreq: 'weekly' as const },
    { path: 'hizmetler', priority: 0.85, changeFreq: 'weekly' as const },
    { path: 'iletisim', priority: 0.8, changeFreq: 'weekly' as const },
    { path: 'galeri', priority: 0.7, changeFreq: 'weekly' as const },
    { path: 'blog', priority: 0.7, changeFreq: 'weekly' as const },
    { path: 'sss', priority: 0.7, changeFreq: 'weekly' as const },
    { path: 'gizlilik-politikasi', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'mesafeli-satis-politikasi', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'iptal-iade-politikasi', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'cerez-politikasi', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'cerez', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'on-bilgilendirme-formu', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'teslimat-ve-iade', priority: 0.5, changeFreq: 'monthly' as const },
    { path: 'mesafeli-satis-sozlesmesi', priority: 0.5, changeFreq: 'monthly' as const },
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Root URL - en yüksek öncelik
  sitemapEntries.push({
    url: baseUrl,
    lastModified,
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // Her dil için sayfaları ekle
  locales.forEach((locale) => {
    pages.forEach((page) => {
      const url = page.path ? `${baseUrl}/${locale}/${page.path}` : `${baseUrl}/${locale}`
      
      sitemapEntries.push({
        url,
        lastModified,
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: {
            tr: page.path ? `${baseUrl}/tr/${page.path}` : `${baseUrl}/tr`,
            en: page.path ? `${baseUrl}/en/${page.path}` : `${baseUrl}/en`,
          },
        },
      })
    })
  })

  // SEO odaklı ek URL'ler - Ankara lokasyon sayfaları
  const locationPages = [
    'ankara-pet-otel',
    'ankara-pet-taksi', 
    'ankara-pet-kres',
    'etimesgut-pet-otel',
    'cankaya-pet-otel',
    'kecioren-pet-otel',
  ]

  locationPages.forEach((locationPage) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${locationPage}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr/${locationPage}`,
            en: `${baseUrl}/en/${locationPage}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}
