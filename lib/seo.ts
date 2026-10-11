import type { Metadata } from 'next'

const SITE_URL = 'https://petfendy.com'

// Sayfa bazlı metadata: kendi canonical adresi, başlık ve açıklama.
// (Kök layout'taki canonical tüm sayfaları ana sayfanın kopyası gösteriyordu.)
export function pageMetadata(locale: string, path: string, title: string, description: string): Metadata {
  const url = `/${locale}/${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Petfendy - Ankara Pet Otel',
      url: `${SITE_URL}${url}`,
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Petfendy - Ankara Pet Otel, Pet Taksi ve Pet Kreş' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
