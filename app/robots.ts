import { MetadataRoute } from 'next'

// Tek User-Agent grubu: Googlebot ile * kuralları ayrışmasın.
// Crawl-delay ve Host Google tarafından desteklenmez (Search Console uyarısı).
// /_next/ engellenmez; Google sayfayı render etmek için JS/CSS ister.
// /checkout/ öneksiz kalır, asıl yollar /tr/checkout ve /en/checkout altındadır.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://petfendy.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/checkout/',
        '/tr/checkout/',
        '/en/checkout/',
        '/private/',
        '/temp/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
