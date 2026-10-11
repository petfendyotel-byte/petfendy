import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, 'ankara-pet-taksi', 'Ankara Pet Taksi | Şehir İçi ve Şehirler Arası Pet Nakil - Petfendy', "Ankara'da kedi ve köpekler için pet taksi. Şehir içi ve şehirler arası pet nakil, mesafeye göre fiyat hesaplama ve online rezervasyon.")
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
