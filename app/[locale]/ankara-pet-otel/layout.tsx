import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'ankara-pet-otel', 'Ankara Pet Otel | Kedi Oteli ve Köpek Oteli - Petfendy', "Etimesgut'ta kedi ve köpek oteli. Konaklama seçenekleri, fiyat ve rezervasyon için Petfendy Pet Otel.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
