import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'ankara-pet-taksi', 'Ankara Pet Taksi | Kedi ve Köpek Taksi, Şehirler Arası Nakil - Petfendy', "Ankara pet taksi: kedi taksi ve köpek taksi, şehir içi ve 81 ilde şehirler arası nakil. Mesafeye göre fiyat hesaplayın, online rezervasyon yapın.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
