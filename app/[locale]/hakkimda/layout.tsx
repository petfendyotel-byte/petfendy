import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'hakkimda', 'Hakkımızda | Petfendy Pet Otel, Pet Taksi ve Pet Kreş', "Petfendy'yi tanıyın: Ankara'da pet otel, pet taksi ve pet kreş hizmetleri.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
