import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'ankara-pet-otel', 'Ankara Pet Otel | Kedi ve Köpek Oteli, Pet Oteli - Petfendy', "Ankara pet oteli: Etimesgut'ta kedi oteli ve köpek oteli, kafessiz konaklama, 7/24 bakım ve veteriner desteği. Online rezervasyon yapın.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
