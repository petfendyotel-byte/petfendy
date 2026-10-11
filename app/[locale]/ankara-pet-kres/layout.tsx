import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'ankara-pet-kres', 'Ankara Pet Kreş | Köpek ve Kedi Gündüz Bakımı - Petfendy', "Ankara'da evcil hayvanlar için gündüz bakımı (pet kreş). Bilgi ve rezervasyon için Petfendy.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
