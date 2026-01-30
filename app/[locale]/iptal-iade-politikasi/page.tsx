"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  RefreshCw, Clock, CheckCircle, Mail, Phone, AlertTriangle,
  Users, Building2, FileText, Calendar, Shield, MessageCircle, Headphones
} from "lucide-react"

const content = {
  tr: {
    title: "İPTAL VE İADE POLİTİKASI",
    lastUpdate: "Son Güncelleme: 15 Aralık 2024",
    intro: "Petfendy, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca iptal ve iade süreçlerini aşağıdaki kriterlere göre yönetmektedir:",
    legalNotice: "YASAL CAYMA HAKKI VE İADE POLİTİKASI",
    legalNoticeDesc: "Bu politika 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 47. ve devamı maddelerine uygun olarak hazırlanmıştır.",
    section1Title: "YASAL CAYMA HAKKI (14 GÜN)",
    section1_1Title: "Tüketici Cayma Hakkı",
    section1_1Items: [
      "Tüketici, 6502 sayılı Kanun uyarınca hizmet bedelini sözleşme kurulumundan itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.",
      "Cayma hakkı, hizmetin ifasına başlanmadan önce kullanılabilir.",
      "Cayma bildiriminin yazılı olarak veya kalıcı veri saklayıcısı ile Petfendy'ye iletilmesi gerekmektedir.",
      "Cayma hakkının kullanılması durumunda, ödenen bedel 14 iş günü içinde aynı ödeme yöntemiyle iade edilir."
    ],
    section1_2Title: "Cayma Hakkının Kullanılamayacağı Durumlar",
    section1_2Items: [
      "Hizmetin ifasına başlanması durumunda (rezervasyon tarihinin gelmesi)",
      "Tüketicinin açık onayı ile hizmetin ifasına başlanması halinde",
      "Acil durum rezervasyonları (24 saat içinde başlayacak hizmetler)"
    ],
    section1_3Title: "İade Süreci ve Zamanlaması",
    section1_3Items: [
      "İade talepleri platform üzerinden veya petfendyotel@gmail.com adresine yazılı olarak yapılabilir",
      "İade işlemleri İyzico ödeme sistemi üzerinden gerçekleştirilir",
      "Ödeme, aynı ödeme yöntemiyle (kredi kartı/banka kartı) 10-14 iş günü içinde iade edilir",
      "İade süreci banka işlem günlerine bağlı olarak değişiklik gösterebilir"
    ],
    section1_4Title: "Hizmet Özel Durumları",
    section1_4Text: "Evcil hayvanın sağlık durumu nedeniyle hizmet alınamayacağının veteriner raporu ile belgelenmesi halinde, tam iade yapılır.",
    section1_5Title: "Mücbir Sebepler",
    section1_5Text: "Doğal afet, salgın hastalık gibi mücbir sebeplerle hizmet verilemediği durumlarda tam iade veya erteleme hakkı tanınır.",
    section2Title: "HİZMET SAĞLAYICI KOŞULLARI",
    section2_1Title: "Rezervasyon Yönetimi",
    section2_1Items: [
      "Hizmet sağlayıcılar rezervasyonları 24 saat içinde onaylamak zorundadır.",
      "Onaylanmayan rezervasyonlar otomatik olarak iptal edilir ve tam iade yapılır.",
      "Hizmet sağlayıcı tarafından iptal edilen rezervasyonlarda tam iade yapılır."
    ],
    section2_2Title: "Hizmet Kalitesi",
    section2_2Text: "Hizmet kalitesi ile ilgili geçerli şikayetlerde kısmi veya tam iade yapılabilir. Tekrarlanan şikayetlerde hizmet sağlayıcı platformdan çıkarılabilir.",
    section2_3Title: "Ödeme ve Kesinti",
    section2_3Items: [
      "Ödemeler İyzico güvenli ödeme sistemi ile alınır",
      "İadeler aynı ödeme yöntemiyle gerçekleştirilir",
      "Platform komisyonu sadece tamamlanan hizmetlerden alınır"
    ],
    section3Title: "İLETİŞİM VE DESTEK",
    supportLine: "Destek Hattı",
    support247: "7/24 Müşteri Desteği",
    workingHours: "Pazartesi - Pazar: 08:00 - 20:00",
    emailSupport: "E-posta Desteği",
    emailResponse: "24 saat içinde yanıt",
    emailDesc: "Detaylı sorularınız için e-posta gönderin",
    importantNote: "Önemli Not",
    importantNoteText: "Herhangi bir sorunuz veya şikayetiniz olduğunda, lütfen önce platform üzerinden ilgili otel ile iletişime geçin. Sorun çözülmezse, Petfendy müşteri hizmetleri devreye girerek size yardımcı olacaktır.",
  },
  en: {
    title: "CANCELLATION AND REFUND POLICY",
    lastUpdate: "Last Update: December 15, 2024",
    intro: "Petfendy manages cancellation and refund processes in accordance with Law No. 6502 on Consumer Protection and Law No. 6563 on Regulation of Electronic Commerce according to the following criteria:",
    legalNotice: "LEGAL RIGHT OF WITHDRAWAL AND REFUND POLICY",
    legalNoticeDesc: "This policy has been prepared in accordance with Article 47 and subsequent articles of Law No. 6502 on Consumer Protection.",
    section1Title: "LEGAL RIGHT OF WITHDRAWAL (14 DAYS)",
    section1_1Title: "Consumer Right of Withdrawal",
    section1_1Items: [
      "The consumer may exercise the right of withdrawal within 14 days from the establishment of the contract without showing any reason, in accordance with Law No. 6502.",
      "The right of withdrawal can be used before the performance of the service begins.",
      "The withdrawal notification must be communicated to Petfendy in writing or via a durable data storage device.",
      "In case of exercising the right of withdrawal, the paid amount will be refunded within 14 business days using the same payment method."
    ],
    section1_2Title: "Cases Where the Right of Withdrawal Cannot Be Used",
    section1_2Items: [
      "When the performance of the service has begun (arrival of the reservation date)",
      "When the service performance has begun with the express consent of the consumer",
      "Emergency reservations (services starting within 24 hours)"
    ],
    section1_3Title: "Refund Process and Timing",
    section1_3Items: [
      "Refund requests can be made through the platform or in writing to petfendyotel@gmail.com",
      "Refund transactions are carried out through the İyzico payment system",
      "Payment is refunded using the same payment method (credit card/debit card) within 10-14 business days",
      "The refund process may vary depending on bank business days"
    ],
    section1_4Title: "Service Special Situations",
    section1_4Text: "If it is documented with a veterinary report that the service cannot be received due to the health condition of the pet, a full refund is made.",
    section1_5Title: "Force Majeure",
    section1_5Text: "In cases where service cannot be provided due to force majeure such as natural disasters, epidemics, full refund or postponement right is granted.",
    section2Title: "SERVICE PROVIDER CONDITIONS",
    section2_1Title: "Reservation Management",
    section2_1Items: [
      "Service providers must confirm reservations within 24 hours.",
      "Unconfirmed reservations are automatically cancelled and full refund is made.",
      "Full refund is made for reservations cancelled by the service provider."
    ],
    section2_2Title: "Service Quality",
    section2_2Text: "Partial or full refund may be made for valid complaints about service quality. Service providers may be removed from the platform in case of repeated complaints.",
    section2_3Title: "Payment and Deduction",
    section2_3Items: [
      "Payments are received through İyzico secure payment system",
      "Refunds are made using the same payment method",
      "Platform commission is only taken from completed services"
    ],
    section3Title: "CONTACT AND SUPPORT",
    supportLine: "Support Line",
    support247: "24/7 Customer Support",
    workingHours: "Monday - Sunday: 09:00 - 22:00",
    emailSupport: "Email Support",
    emailResponse: "Response within 24 hours",
    emailDesc: "Send an email for detailed questions",
    importantNote: "Important Note",
    importantNoteText: "If you have any questions or complaints, please first contact the relevant hotel through the platform. If the problem is not resolved, Petfendy customer service will step in to help you.",
  }
}

export default function RefundPolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
        <div className="absolute top-10 left-10 opacity-20"><RefreshCw className="w-24 h-24 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><Calendar className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <RefreshCw className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-orange-100 text-sm">{t.lastUpdate}</p>
        </div>
      </section>

      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed">{t.intro}</p>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-8 px-4 bg-blue-50 border-b">
        <div className="max-w-4xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">{t.legalNotice}</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">{t.legalNoticeDesc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Section 1 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.section1Title}</h2>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section1_1Title}</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {t.section1_1Items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>{t.section1_1Warning}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section1_2Title}</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {t.section1_2Items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>{t.section1_2Warning}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section1_3Title}</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {t.section1_3Items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section1_4Title}</h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{t.section1_4Text}</span>
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section1_5Title}</h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{t.section1_5Text}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.section2Title}</h2>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section2_1Title}</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {t.section2_1Items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section2_2Title}</h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{t.section2_2Text}</span>
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section2_3Title}</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {t.section2_3Items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-3">{t.section2_4Title}</h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{t.section2_4Text}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.section3Title}</h2>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.supportLine}</p>
                      <p className="text-xs text-gray-500">{t.support247}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Phone className="w-4 h-4" />
                    <span>+90 532 307 32 64</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t.workingHours}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{t.emailSupport}</p>
                      <p className="text-xs text-gray-500">{t.emailResponse}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Mail className="w-4 h-4" />
                    <span>petfendyotel@gmail.com</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t.emailDesc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t.importantNote}</h3>
                  <p className="text-amber-100 text-sm leading-relaxed">{t.importantNoteText}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer locale={locale} />
    </div>
  )
}
