"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Lock, 
  Users, 
  Clock,
  CheckCircle,
  Mail,
  Phone,
  FileText,
  Scale
} from "lucide-react"

// Content translations
const content = {
  tr: {
    badge: "Veri Güvenliği",
    title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
    subtitle: "Petfendy olarak kullanıcılarımızın kişisel verilerinin korunmasına büyük önem veriyoruz. Bu dokümanda verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında detaylı bilgi bulabilirsiniz.",
    stats: [
      { label: "KVKK Uyumlu", value: "100%" },
      { label: "Korunan Kullanıcı", value: "5K+" },
      { label: "Temel Hak", value: "9" },
      { label: "Veri Koruması", value: "24/7" },
    ],
    section1Title: "Veri Sorumlusunun Kimliği",
    section1Text: "Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, veri sorumlusu sıfatıyla Petfendy tarafından hazırlanmıştır. Petfendy, kullanıcılarının kişisel verilerinin korunmasına büyük önem vermektedir.",
    section2Title: "Kişisel Verilerin İşlenme Amacı",
    section2Text: "Petfendy platformu olarak, kullanıcılarımızın pet otel rezervasyon işlemlerini kolaylaştırmak, otel sahiplerinin ve pet sahiplerinin ihtiyaçlarına yönelik hizmetler sunmak amacıyla kişisel verilerinizi işlemekteyiz.",
    dataProcessingPurposes: [
      "Otel ve Taksi rezervasyonlarının gerçekleştirilmesi ve yönetilmesi",
      "Kullanıcı hesaplarının oluşturulması ve yönetilmesi",
      "İletişim ve bilgilendirme faaliyetlerinin yürütülmesi",
      "Kullanıcı memnuniyetinin sağlanması ve artırılması",
      "Hizmetlerimizin iyileştirilmesi ve geliştirilmesi",
      "Yasal yükümlülüklerin yerine getirilmesi",
    ],
    section3Title: "Kişisel Verilerin Aktarılması",
    section3Text: "Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda, yurt içindeki ve yurt dışındaki iş ortaklarımıza, hizmet sağlayıcılarımıza, kanunen yetkili kamu kurumlarına ve özel kişilere, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde aktarılabilecektir.",
    section4Title: "Veri Toplama Yöntemi ve Hukuki Sebep",
    section4Text: "Kişisel verileriniz, Petfendy platformu üzerinden elektronik ortamda toplanmaktadır. Kişisel verilerinizin işlenmesinin hukuki sebepleri şunlardır:",
    legalBases: [
      "6698 sayılı KVKK ve ilgili mevzuat hükümlerinin açıkça öngörülmesi",
      "Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması",
      "Hukuki yükümlülüğün yerine getirilmesi",
      "Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması",
      "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla, Petfendy'nin meşru menfaatleri için veri işlenmesinin zorunlu olması",
    ],
    section5Title: "İlgili Kişilerin Hakları",
    section5Text: "KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri olarak aşağıdaki haklara sahipsiniz:",
    userRights: [
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
      "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme",
      "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme",
      "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
      "Kişisel verilerinizin silinmesini veya yok edilmesini isteme",
      "Düzeltme, silme veya yok edilme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme",
      "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
      "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
    ],
    section6Title: "İletişim",
    section6Text: "Haklarınızı kullanmak veya kişisel verilerinizle ilgili herhangi bir soru veya talebiniz için bizimle aşağıdaki iletişim bilgileri aracılığıyla irtibata geçebilirsiniz:",
    emailLabel: "E-posta",
    phoneLabel: "Destek Hattı",
  },
  en: {
    badge: "Data Security",
    title: "Privacy Policy and Personal Data Protection",
    subtitle: "At Petfendy, we attach great importance to protecting the personal data of our users. In this document, you can find detailed information about how your data is collected, processed and protected.",
    stats: [
      { label: "GDPR Compliant", value: "100%" },
      { label: "Protected Users", value: "5K+" },
      { label: "Fundamental Rights", value: "9" },
      { label: "Data Protection", value: "24/7" },
    ],
    section1Title: "Identity of the Data Controller",
    section1Text: "This disclosure text has been prepared by Petfendy as the data controller in accordance with the Personal Data Protection Law No. 6698 (\"KVKK\"). Petfendy attaches great importance to protecting the personal data of its users.",
    section2Title: "Purpose of Processing Personal Data",
    section2Text: "As the Petfendy platform, we process your personal data in order to facilitate pet hotel reservation transactions for our users and to provide services for the needs of hotel owners and pet owners.",
    dataProcessingPurposes: [
      "Performing and managing hotel and taxi reservations",
      "Creating and managing user accounts",
      "Conducting communication and information activities",
      "Ensuring and increasing user satisfaction",
      "Improving and developing our services",
      "Fulfilling legal obligations",
    ],
    section3Title: "Transfer of Personal Data",
    section3Text: "Your personal data may be transferred to our business partners, service providers, legally authorized public institutions and private persons, both domestically and abroad, within the framework of the conditions specified in Articles 8 and 9 of KVKK, in line with the purposes stated above.",
    section4Title: "Data Collection Method and Legal Basis",
    section4Text: "Your personal data is collected electronically through the Petfendy platform. The legal reasons for processing your personal data are as follows:",
    legalBases: [
      "Explicit provision of Law No. 6698 on KVKK and related legislation",
      "Being directly related to the establishment or performance of the contract",
      "Fulfillment of legal obligation",
      "Data processing being mandatory for the establishment, exercise or protection of a right",
      "Data processing being mandatory for the legitimate interests of Petfendy, provided that it does not harm your fundamental rights and freedoms",
    ],
    section5Title: "Rights of Data Subjects",
    section5Text: "In accordance with Article 11 of KVKK, you have the following rights as personal data owners:",
    userRights: [
      "Learning whether your personal data is processed",
      "Requesting information about your personal data if it has been processed",
      "Learning the purpose of processing your personal data and whether they are used in accordance with their purpose",
      "Knowing the third parties to whom your personal data is transferred domestically or abroad",
      "Requesting correction of your personal data if it has been processed incompletely or incorrectly",
      "Requesting deletion or destruction of your personal data",
      "Requesting notification of correction, deletion or destruction operations to third parties to whom your personal data has been transferred",
      "Objecting to the emergence of a result against you by analyzing the processed data exclusively through automated systems",
      "Requesting compensation for damages if you suffer damage due to unlawful processing of your personal data",
    ],
    section6Title: "Contact",
    section6Text: "To exercise your rights or for any questions or requests regarding your personal data, you can contact us through the following contact information:",
    emailLabel: "Email",
    phoneLabel: "Support Line",
  }
}

export default function PrivacyPolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  const statIcons = [
    <Shield key="shield" className="w-6 h-6" />,
    <Users key="users" className="w-6 h-6" />,
    <Scale key="scale" className="w-6 h-6" />,
    <Clock key="clock" className="w-6 h-6" />,
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <Shield className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Lock className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10" />
            </div>
          </div>
          <p className="text-blue-200 font-medium mb-2">{t.badge}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{t.title}</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {t.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                  {statIcons[index]}
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h2 className="text-xl font-bold mb-4">{t.section1Title}</h2>
                  <p className="text-gray-600 leading-relaxed">{t.section1Text}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">2</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">{t.section2Title}</h2>
                  <p className="text-gray-600 mb-4">{t.section2Text}</p>
                  <ul className="space-y-2">
                    {t.dataProcessingPurposes.map((purpose, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{purpose}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h2 className="text-xl font-bold mb-4">{t.section3Title}</h2>
                  <p className="text-gray-600 leading-relaxed">{t.section3Text}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">4</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">{t.section4Title}</h2>
                  <p className="text-gray-600 mb-4">{t.section4Text}</p>
                  <ul className="space-y-2">
                    {t.legalBases.map((basis, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <FileText className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <span>{basis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">5</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">{t.section5Title}</h2>
                  <p className="text-gray-600 mb-4">{t.section5Text}</p>
                  <div className="grid gap-3">
                    {t.userRights.map((right, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-7 h-7 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-600 text-sm">{right}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6 - Contact */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-bold shrink-0">6</div>
                <div className="flex-1 text-white">
                  <h2 className="text-xl font-bold mb-4">{t.section6Title}</h2>
                  <p className="text-blue-100 mb-6">{t.section6Text}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Mail className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-200">{t.emailLabel}</p>
                        <p className="font-medium">petfendyotel@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Phone className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-200">{t.phoneLabel}</p>
                        <p className="font-medium">+90 532 307 32 64</p>
                      </div>
                    </div>
                  </div>
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
