import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import { SeoServiceLanding, LANDING_RELATED as R } from "@/components/seo-service-landing"

const PATH = "ankara-kopek-taksi"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(
    locale,
    PATH,
    "Ankara Köpek Taksi | Köpek Nakil Hizmeti - Petfendy",
    "Ankara köpek taksi: şehir içi ve 81 ilde şehirler arası köpek nakli. Mesafeye göre fiyatı hesaplayın, online rezervasyon yapın."
  )
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <SeoServiceLanding
      locale={locale}
      path={PATH}
      eyebrow="Ankara Köpek Taksi"
      h1="Ankara Köpek Taksi: Köpeğinize Özel Güvenli Nakil"
      intro="Petfendy köpek taksi hizmeti ile köpeğinizi veterinere, kuaföre, pet otele ya da başka bir şehre güvenle taşıyoruz. Şehir içi ve 81 ilde şehirler arası nakil yapılır."
      serviceName="Ankara Köpek Taksi"
      serviceType="Köpek nakil ve pet taksi hizmeti"
      ctaPath="booking/taxi"
      ctaLabel="Köpek Taksi Rezervasyonu"
      highlights={[
        "Şehir içi ve şehirler arası nakil",
        "81 ilde hizmet",
        "Deneyimli şoförler, temiz araçlar",
        "Mesafeye göre online fiyat hesaplama",
        "Online rezervasyon",
      ]}
      sections={[
        {
          heading: "Köpek taksi ne zaman kullanılır?",
          paragraphs: [
            "Her köpek toplu taşımaya ya da başkasının aracına uygun değildir. Köpeklere yönelik bir nakil hizmeti, yolculuğu hem köpek hem sahibi için daha güvenli ve rahat hâle getirir.",
          ],
          bullets: [
            "Veteriner ve aşı randevuları",
            "Kuaför veya eğitim",
            "Pet otele giriş ve çıkış",
            "Taşınma ve şehirler arası nakil",
          ],
        },
        {
          heading: "Köpek taksi ücreti nasıl hesaplanır?",
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
          heading: "Yolculuktan önce köpeğinizi hazırlayın",
          paragraphs: ["Yolculuğun köpek için daha rahat geçmesi adına şunlar önerilir:"],
          bullets: [
            "Yolculuktan önce kısa bir yürüyüşle ihtiyaçlarını gidermesini sağlayın",
            "Tasma veya koşum takımını takılı getirin",
            "Yolculuktan hemen önce ağır bir öğün vermeyin",
            "Köpeğinizin boyutunu ve varsa hassasiyetlerini rezervasyon sırasında bildirin",
          ],
        },
      ]}
      faqs={[
        {
          question: "Ankara'da köpek taksi ücreti ne kadar?",
          answer: "Ücret mesafeye göre hesaplanır. Rezervasyon sayfasında kalkış ve varış noktasını seçerek tahmini ücreti görebilirsiniz.",
        },
        { question: "Şehirler arası köpek nakli yapıyor musunuz?", answer: "Evet. Şehirler arası pet nakil için 81 ilde hizmet veriyoruz." },
        {
          question: "Köpek taksi için rezervasyon gerekli mi?",
          answer: "Rezervasyon sayfasından online rezervasyon yapabilir veya +90 532 307 32 64 numaralı telefondan bize ulaşabilirsiniz.",
        },
        {
          question: "Köpeği pet otele getirip götürüyor musunuz?",
          answer: "Pet taksi hizmetimizle köpeğinizi evinizden pet otele ya da başka bir adrese taşıyabiliriz.",
        },
      ]}
      related={[R.petTaksi, R.kediTaksi, R.kopekOtel, R.petOtel]}
    />
  )
}
