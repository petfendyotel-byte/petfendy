import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import { SeoServiceLanding, LANDING_RELATED as R } from "@/components/seo-service-landing"

const PATH = "ankara-kedi-taksi"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(
    locale,
    PATH,
    "Ankara Kedi Taksi | Kedi Nakil Hizmeti - Petfendy",
    "Ankara kedi taksi: şehir içi ve 81 ilde şehirler arası kedi nakli. Mesafeye göre fiyatı hesaplayın, online rezervasyon yapın."
  )
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <SeoServiceLanding
      locale={locale}
      path={PATH}
      eyebrow="Ankara Kedi Taksi"
      h1="Ankara Kedi Taksi: Kedinize Özel Güvenli Nakil"
      intro="Petfendy kedi taksi hizmeti ile kedinizi veterinere, kuaföre, pet otele ya da başka bir şehre güvenle taşıyoruz. Şehir içi ve 81 ilde şehirler arası nakil yapılır."
      serviceName="Ankara Kedi Taksi"
      serviceType="Kedi nakil ve pet taksi hizmeti"
      ctaPath="booking/taxi"
      ctaLabel="Kedi Taksi Rezervasyonu"
      highlights={[
        "Şehir içi ve şehirler arası nakil",
        "81 ilde hizmet",
        "Deneyimli şoförler, temiz araçlar",
        "Mesafeye göre online fiyat hesaplama",
        "Online rezervasyon",
      ]}
      sections={[
        {
          heading: "Kedi taksi ne zaman kullanılır?",
          paragraphs: [
            "Kediler araç yolculuğunda kolayca strese girebilir. Toplu taşıma ya da kalabalık ortam yerine kediye özel bir nakil hizmeti, hem kedinin hem sahibinin yolculuğunu rahatlatır.",
          ],
          bullets: [
            "Veteriner ve aşı randevuları",
            "Kuaför veya bakım",
            "Pet otele giriş ve çıkış",
            "Taşınma ve şehirler arası nakil",
          ],
        },
        {
          heading: "Kedi taksi ücreti nasıl hesaplanır?",
          paragraphs: [
            "Pet taksi ücreti mesafeye göre hesaplanır. Rezervasyon sayfasında kalkış ve varış noktasını seçerek tahmini ücreti anında görebilirsiniz. Kesin bilgi için +90 532 307 32 64 numaralı telefondan bize ulaşabilirsiniz.",
          ],
        },
        {
          heading: "Hizmet verdiğimiz bölgeler",
          paragraphs: [
            "Ankara'da Etimesgut, Çankaya, Keçiören, Yenimahalle, Mamak, Sincan, Gölbaşı, Pursaklar, Altındağ, Polatlı, Beypazarı ve Ayaş başta olmak üzere ilçelerde hizmet veriyoruz. Şehirler arası nakil için 81 ilde hizmet sunuyoruz.",
          ],
        },
        {
          heading: "Yolculuktan önce kedinizi hazırlayın",
          paragraphs: ["Yolculuğun kedi için daha rahat geçmesi adına şunlar önerilir:"],
          bullets: [
            "Kapalı ve sağlam bir taşıma çantası kullanın",
            "Çantaya tanıdık kokusu olan bir battaniye koyun",
            "Yolculuktan hemen önce ağır bir öğün vermeyin",
            "Hassasiyetlerini ve varsa ilaç ihtiyacını rezervasyon sırasında bildirin",
          ],
        },
      ]}
      faqs={[
        {
          question: "Ankara'da kedi taksi ücreti ne kadar?",
          answer: "Ücret mesafeye göre hesaplanır. Rezervasyon sayfasında kalkış ve varış noktasını seçerek tahmini ücreti görebilirsiniz.",
        },
        { question: "Şehirler arası kedi nakli yapıyor musunuz?", answer: "Evet. Şehirler arası pet nakil için 81 ilde hizmet veriyoruz." },
        {
          question: "Kedi taksi için rezervasyon gerekli mi?",
          answer: "Rezervasyon sayfasından online rezervasyon yapabilir veya +90 532 307 32 64 numaralı telefondan bize ulaşabilirsiniz.",
        },
        {
          question: "Kediyi pet otele getirip götürüyor musunuz?",
          answer: "Pet taksi hizmetimizle kedinizi evinizden pet otele ya da başka bir adrese taşıyabiliriz.",
        },
      ]}
      related={[R.petTaksi, R.kopekTaksi, R.kediOtel, R.petOtel]}
    />
  )
}
