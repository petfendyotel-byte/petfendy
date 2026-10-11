import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'booking/daycare', 'Pet Kreş Rezervasyonu Ankara | Petfendy', 'Köpeğiniz veya kediniz için pet kreş (gündüz bakımı) rezervasyonu yapın.')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
