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
    intro: "Petfendy, evcil hayvan sahipleri ve hizmet sağlayıcıları için adil ve şeffaf bir platform olarak iptal ve iade süreçlerini aşağıdaki kriterlere göre yönetmektedir:",
    section1Title: "Pet Sahipleri için İptal ve İade Koşulları",
    section1_1Title: "Rezervasyon Onayı ve Doğruluk Beyanı",
    section1_1Items: [
      "Pet sahibi, rezervasyonun ön onaylı olduğunu ve işletmenin 24 saat içinde onay/ret hakkı olduğunu kabul eder.",
      "24 saat içinde yanıtlanmayan rezervasyonlar otomatik olarak onaylanmış sayılır.",
      "Doğrudan onaylı rezervasyonlarda ödeme tamamlandığında rezervasyon kesinleşir.",
    ],
    section1_1Warning: "Verilen bilgilerin (hastalık, alerji, çip no vb.) doğru olmaması durumunda iade yapılmaz.",
    section1_2Title: "Ücretsiz İptal Hakkı",
    section1_2Items: [
      "Rezervasyon sonrası ilk 6 saat içinde ücretsiz iptal hakkı vardır.",
    ],
    section1_2Warning: "Rezervasyon tarihine 72 saatten az kaldıysa bu hak geçerli değildir.",
    section1_3Title: "İptal Sonrası İade Süreci",
    section1_3Items: [
      "İadeler politika kurallarına göre işlenir.",
      "Bankanıza bağlı olarak 7–14 iş günü içinde gerçekleşir.",
    ],
    section1_4Title: "Hizmetin Kabul Edilememesi",
    section1_4Text: "Ön muayenede konaklamaya engel hastalık/politika ihlali tespitinde ilk gece ücreti tahsil edilir.",
    section1_5Title: "Kısmi Hizmet Kullanımı",
    section1_5Text: "Hizmetten kısmi faydalanma durumunda iade yapılmaz.",
    section2Title: "Pet Otelleri için İptal ve İade Koşulları",
    section2_1Title: "Rezervasyon Türleri ve Onay Süreci",
    section2_1Items: [
      "İşletme doğrudan onaylı veya ön onaylı rezervasyon modelini seçebilir.",
      "Ön onaylılarda 24 saat içinde yanıtlanmayan talepler otomatik onaylanır.",
      "Hizmet saatine 24 saatten az kala benzer şekilde otomatik onaylanır.",
    ],
    section2_2Title: "Hizmetin İptali",
    section2_2Text: "Onaylı rezervasyonun iptali, yalnızca pet sahibinin yazılı onayı ile mümkündür.",
    section2_3Title: "Mücbir Sebepler",
    section2_3Items: [
      "Pet sahibi iptal ederek iade isteyebilir.",
      "Alternatif tarih için erteleme talep edebilir.",
    ],
    section2_4Title: "Hizmette Sorun / Eksiklik",
    section2_4Text: "Geçerli şikayetlerde kısmi/tam iade yükümlülüğü doğabilir. Tekrarında platformdan çıkarma hakkı saklıdır.",
    section3Title: "Genel Hükümler",
    supportLine: "Destek Hattı",
    support247: "7/24 Müşteri Desteği",
    workingHours: "Pazartesi - Pazar: 09:00 - 22:00",
    emailSupport: "E-posta Desteği",
    emailResponse: "24 saat içinde yanıt",
    emailDesc: "Detaylı sorularınız için e-posta gönderin",
    importantNote: "Önemli Not",
    importantNoteText: "Herhangi bir sorunuz veya şikayetiniz olduğunda, lütfen önce platform üzerinden ilgili otel ile iletişime geçin. Sorun çözülmezse, Petfendy müşteri hizmetleri devreye girerek size yardımcı olacaktır.",
  },
  en: {
    title: "CANCELLATION AND REFUND POLICY",
    lastUpdate: "Last Update: December 15, 2024",
    intro: "Petfendy manages cancellation and refund processes according to the following criteria as a fair and transparent platform for pet owners and service providers:",
    section1Title: "Cancellation and Refund Terms for Pet Owners",
    section1_1Title: "Reservation Confirmation and Accuracy Statement",
    section1_1Items: [
      "The pet owner accepts that the reservation is pre-approved and the business has the right to approve/reject within 24 hours.",
      "Reservations not responded to within 24 hours are automatically considered approved.",
      "In directly approved reservations, the reservation is finalized when payment is completed.",
    ],
    section1_1Warning: "No refund will be made if the information provided (illness, allergy, chip number, etc.) is incorrect.",
    section1_2Title: "Free Cancellation Right",
    section1_2Items: [
      "There is a free cancellation right within the first 6 hours after reservation.",
    ],
    section1_2Warning: "This right is not valid if less than 72 hours remain until the reservation date.",
    section1_3Title: "Refund Process After Cancellation",
    section1_3Items: [
      "Refunds are processed according to policy rules.",
      "It takes place within 7-14 business days depending on your bank.",
    ],
    section1_4Title: "Service Not Accepted",
    section1_4Text: "If a disease/policy violation that prevents accommodation is detected during the preliminary examination, the first night fee is charged.",
    section1_5Title: "Partial Service Usage",
    section1_5Text: "No refund is made in case of partial use of the service.",
    section2Title: "Cancellation and Refund Terms for Pet Hotels",
    section2_1Title: "Reservation Types and Approval Process",
    section2_1Items: [
      "The business can choose direct approval or pre-approval reservation model.",
      "In pre-approved reservations, requests not responded to within 24 hours are automatically approved.",
      "Similarly, automatic approval occurs when less than 24 hours remain until service time.",
    ],
    section2_2Title: "Service Cancellation",
    section2_2Text: "Cancellation of an approved reservation is only possible with the written consent of the pet owner.",
    section2_3Title: "Force Majeure",
    section2_3Items: [
      "The pet owner can cancel and request a refund.",
      "Can request postponement for an alternative date.",
    ],
    section2_4Title: "Service Problem / Deficiency",
    section2_4Text: "Partial/full refund obligation may arise in valid complaints. The right to remove from the platform in case of repetition is reserved.",
    section3Title: "General Provisions",
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
