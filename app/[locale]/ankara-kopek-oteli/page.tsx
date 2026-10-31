import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import { SeoServiceLanding, LANDING_RELATED as R } from "@/components/seo-service-landing"

const PATH = "ankara-kopek-oteli"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(
    locale,
    PATH,
    "Ankara Köpek Oteli | Kafessiz Köpek Konaklama - Petfendy",
    "Ankara köpek oteli: Etimesgut'ta 7/24 bakım, kafessiz konaklama ve acil veteriner desteği. Köpeğiniz için online rezervasyon yapın."
  )
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <SeoServiceLanding
      locale={locale}
      path={PATH}
      eyebrow="Ankara Köpek Oteli"
      h1="Ankara Köpek Oteli: Güvenli ve Kafessiz Konaklama"
      intro="Ankara'da köpek oteli arıyorsanız Petfendy, Etimesgut'ta köpeğinizi 7/24 bakım, acil durumlarda veteriner desteği ve güvenlik kamerası ile korunan bir ortamda ağırlar."
      serviceName="Ankara Köpek Oteli"
      serviceType="Köpek oteli ve köpek konaklama hizmeti"
      ctaPath="booking/hotel"
      ctaLabel="Köpek Oteli Rezervasyonu"
      highlights={[
        "7/24 profesyonel bakım",
        "Kafessiz konaklama",
        "Acil durumlarda veteriner desteği",
        "Güvenlik kamerası ile korumalı ortam",
        "Online rezervasyon",
        "Etimesgut merkezli, Ankara'nın her ilçesinden ulaşım",
      ]}
      sections={[
        {
          heading: "Ankara'da köpek oteli ne zaman gerekir?",
          paragraphs: [
            "Köpeklerin düzenli beslenme, hareket ve ilgi ihtiyacı vardır; uzun süre yalnız kalmak çoğu köpek için zordur. Tatil, iş seyahati, hastane süreci ya da ev değişikliği gibi dönemlerde köpeğinizi güvenilir bir ekibe emanet etmek en sağlıklı çözümdür.",
          ],
          bullets: [
            "Yurt içi ve yurt dışı tatiller",
            "İş seyahatleri ve hastane süreçleri",
            "Taşınma ve ev tadilatı dönemleri",
            "Evde köpeğe bakılamayan kısa ya da uzun süreler",
          ],
        },
        {
          heading: "Petfendy köpek otelinde neler sunuyoruz?",
          paragraphs: [
            "Köpeklerin hareket ve sosyalleşme ihtiyacı yüksek olduğu için kafessiz konaklama önemlidir. Petfendy, kedi ve köpekler için Etimesgut'ta pet otel hizmeti verir:",
          ],
          bullets: [
            "7/24 profesyonel bakım ekibi",
            "Kafessiz konaklama",
            "Acil durumlarda veteriner desteği",
            "Güvenlik kamerası ile korumalı ortam",
            "Ankara'nın her ilçesinden kolay ulaşım",
          ],
        },
        {
          heading: "Köpek oteli rezervasyonu nasıl yapılır?",
          paragraphs: [
            "Rezervasyon sayfasından konaklama tarihlerini ve oda seçeneğini belirleyip bilgilerinizi doldurmanız yeterlidir. Konaklama ücreti oda tipine ve gün sayısına göre belirlenir; güncel bilgiyi rezervasyon sayfasında görebilir veya +90 532 307 32 64 numaralı telefondan öğrenebilirsiniz.",
            "Köpeğinizi evden almamızı isterseniz Ankara pet taksi hizmetimiz de mevcuttur.",
          ],
        },
        {
          heading: "Köpeğinizi otele getirmeden önce",
          paragraphs: [
            "Bakım ekibinin köpeğinize en uygun şekilde ilgilenebilmesi için aşağıdaki bilgileri önceden paylaşmanız önerilir:",
          ],
          bullets: [
            "Aşı ve sağlık durumu, düzenli kullandığı ilaçlar",
            "Alıştığı mama türü ve öğün düzeni",
            "Diğer köpeklerle ve yabancılarla davranışı, korkuları",
            "Tasma, tanıdık oyuncak veya kokusunu taşıyan battaniye gibi eşyalar",
          ],
        },
      ]}
      faqs={[
        {
          question: "Ankara'da köpek oteli ücreti ne kadar?",
          answer: "Ücret oda tipine ve konaklama süresine göre değişir. Güncel ücretleri rezervasyon sayfasında görebilir veya +90 532 307 32 64 numaralı telefondan öğrenebilirsiniz.",
        },
        { question: "Köpekler kafeste mi kalıyor?", answer: "Hayır. Petfendy'de kafessiz konaklama sunuyoruz." },
        { question: "Gece de bakım ekibi var mı?", answer: "Evet. Bakım hizmetimiz 7/24 devam eder." },
        { question: "Köpeğim konaklama sırasında hastalanırsa ne olur?", answer: "Acil durumlarda veteriner desteği sağlıyoruz." },
        { question: "Köpek oteli nerede?", answer: "Petfendy Etimesgut merkezlidir ve Ankara'nın tüm ilçelerinden ulaşılabilir." },
      ]}
      related={[R.petOtel, R.kediOtel, R.kopekTaksi, R.petTaksi, R.petKres]}
    />
  )
}
