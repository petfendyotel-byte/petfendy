import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'hizmetler', 'Hizmetlerimiz | Pet Otel, Pet Taksi, Pet Kreş Ankara - Petfendy', 'Petfendy hizmetleri: kedi köpek oteli, pet taksi ve pet kreş. Etimesgut merkezli, Ankara geneli.')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
