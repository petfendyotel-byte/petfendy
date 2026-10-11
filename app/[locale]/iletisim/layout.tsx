import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'iletisim', 'İletişim | Petfendy Pet Otel Ankara', 'Petfendy iletişim: İstasyon Mah. Şehit Hikmet Özer Cd. No:101, Etimesgut/Ankara. Telefon: +90 532 307 32 64.')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
