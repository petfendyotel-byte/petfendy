import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'booking/hotel', 'Pet Otel Rezervasyonu Ankara | Kedi ve Köpek Oteli - Petfendy', "Tarih ve oda seçerek Ankara'da kediniz veya köpeğiniz için pet otel rezervasyonu yapın.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
