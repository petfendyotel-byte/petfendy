import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'booking/taxi', 'Pet Taksi Rezervasyonu ve Fiyat Hesaplama | Petfendy Ankara', 'Kalkış ve varış noktasını seçin, pet taksi mesafe ve fiyatını hesaplayın, rezervasyon yapın.')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
