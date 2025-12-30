import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://petfendy.com'
  const locales = ['tr', 'en']
  const lastModified = new Date()

  // Ana sayfalar
  const pages = [
    'home',
    'hakkimda',
    'iletisim',
    'sss',
    'gizlilik-politikasi',
    'mesafeli-satis-politikasi',
    'iptal-iade-politikasi',
    'cerez',
    'on-bilgilendirme-formu',
    'booking/hotel',
    'booking/taxi',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Root URL
  sitemapEntries.push({
    url: baseUrl,
    lastModified,
    changeFrequency: 'daily',
    priority: 1,
  })

  // Her dil için sayfaları ekle
  locales.forEach((locale) => {
    pages.forEach((page) => {
      const priority = page === 'home' ? 1 : 
                       page.includes('booking') ? 0.9 :
                       page === 'hakkimda' || page === 'iletisim' ? 0.8 :
                       page === 'sss' ? 0.7 : 0.5

      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified,
        changeFrequency: page === 'home' ? 'daily' : 'weekly',
        priority,
        alternates: {
          languages: {
            tr: `${baseUrl}/tr/${page}`,
            en: `${baseUrl}/en/${page}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}
