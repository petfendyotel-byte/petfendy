import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import { SeoServiceLanding, LANDING_RELATED as R } from "@/components/seo-service-landing"

const PATH = "ankara-kedi-oteli"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(
    locale,
    PATH,
    "Ankara Kedi Oteli | Kafessiz Kedi Konaklama - Petfendy",
    "Ankara kedi oteli: Etimesgut'ta 7/24 bakım, kafessiz konaklama ve acil veteriner desteği. Kediniz için online rezervasyon yapın."
  )
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <SeoServiceLanding
      locale={locale}
      path={PATH}
      eyebrow="Ankara Kedi Oteli"
      h1="Ankara Kedi Oteli: Güvenli ve Kafessiz Konaklama"
      intro="Ankara'da kedi oteli arıyorsanız Petfendy, Etimesgut'ta kedinizi 7/24 bakım, acil durumlarda veteriner desteği ve güvenlik kamerası ile korunan bir ortamda ağırlar."
      serviceName="Ankara Kedi Oteli"
      serviceType="Kedi oteli ve kedi konaklama hizmeti"
      ctaPath="booking/hotel"
      ctaLabel="Kedi Oteli Rezervasyonu"
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
          heading: "Ankara'da kedi oteli ne zaman gerekir?",
          paragraphs: [
            "Kediler çoğu zaman alıştıkları düzenin değişmesinden hoşlanmaz. Yine de tatil, iş seyahati, hastane süreci ya da taşınma gibi dönemlerde birkaç gün evde yalnız bırakmak hem kedi hem de sahibi için risk taşır; mama ve su bitebilir, sağlık sorunu fark edilmeyebilir.",
            "Kedi oteli, bu günlerde kedinizin düzenli beslenmesini, temizliğini ve gözetimini bir ekibe emanet etmenin güvenli yoludur.",
          ],
          bullets: [
            "Yurt içi ve yurt dışı tatiller",
            "İş seyahatleri ve hastane süreçleri",
            "Taşınma ve ev tadilatı dönemleri",
            "Evde bakım imkânının olmadığı kısa ya da uzun süreler",
          ],
        },
        {
          heading: "Petfendy kedi otelinde neler sunuyoruz?",
          paragraphs: [
            "Petfendy, kedi ve köpekler için Etimesgut'ta pet otel hizmeti verir. Kedinizin konaklaması boyunca ihtiyaç duyacağı temel hizmetler şunlardır:",
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
          heading: "Kedi oteli rezervasyonu nasıl yapılır?",
          paragraphs: [
            "Rezervasyon sayfasından konaklama tarihlerini ve oda seçeneğini belirleyip bilgilerinizi doldurmanız yeterlidir. Konaklama ücreti oda tipine ve gün sayısına göre belirlenir; güncel bilgiyi rezervasyon sayfasında görebilir veya +90 532 307 32 64 numaralı telefondan öğrenebilirsiniz.",
            "Kedinizi evden almamızı isterseniz Ankara pet taksi hizmetimiz de mevcuttur.",
          ],
        },
        {
          heading: "Kedinizi otele getirmeden önce",
          paragraphs: [
            "Bakım ekibinin kedinize en uygun şekilde ilgilenebilmesi için aşağıdaki bilgileri önceden paylaşmanız önerilir:",
          ],
          bullets: [
            "Aşı ve sağlık durumu, düzenli kullandığı ilaçlar",
            "Alıştığı mama türü ve öğün düzeni",
            "Alerji, kronik rahatsızlık ya da korkularına dair notlar",
            "Kokusunu taşıyan battaniye veya oyuncak gibi tanıdık eşyalar",
          ],
        },
      ]}
      faqs={[
        {
          question: "Ankara'da kedi oteli ücreti ne kadar?",
          answer: "Ücret oda tipine ve konaklama süresine göre değişir. Güncel ücretleri rezervasyon sayfasında görebilir veya +90 532 307 32 64 numaralı telefondan öğrenebilirsiniz.",
        },
        { question: "Kediler kafeste mi kalıyor?", answer: "Hayır. Petfendy'de kafessiz konaklama sunuyoruz." },
        { question: "Gece de bakım ekibi var mı?", answer: "Evet. Bakım hizmetimiz 7/24 devam eder." },
        { question: "Kedim konaklama sırasında hastalanırsa ne olur?", answer: "Acil durumlarda veteriner desteği sağlıyoruz." },
        { question: "Kedi oteli nerede?", answer: "Petfendy Etimesgut merkezlidir ve Ankara'nın tüm ilçelerinden ulaşılabilir." },
      ]}
      related={[R.petOtel, R.kopekOtel, R.kediTaksi, R.petTaksi, R.petKres]}
    />
  )
}
