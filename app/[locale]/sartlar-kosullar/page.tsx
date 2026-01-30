"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Scale, Users, Shield, AlertTriangle, CheckCircle, Phone, Mail } from "lucide-react"

const content = {
  tr: {
    title: "ŞARTLAR VE KOŞULLAR",
    subtitle: "Petfendy platformunu kullanarak aşağıdaki şartlar ve koşulları kabul etmiş olursunuz.",
    lastUpdate: "Son Güncelleme: 15 Aralık 2024",
    
    sections: [
      {
        id: 1,
        title: "Genel Hükümler",
        content: [
          "Bu şartlar ve koşullar, Petfendy platformunun kullanımını düzenler.",
          "Platform, BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ tarafından işletilmektedir.",
          "Platformu kullanarak bu şartları kabul etmiş sayılırsınız.",
          "Şartlar değiştirildiğinde, güncel versiyon web sitesinde yayınlanacaktır."
        ]
      },
      {
        id: 2,
        title: "Tanımlar",
        definitions: [
          { term: "Platform", desc: "Petfendy web sitesi ve mobil uygulaması" },
          { term: "Kullanıcı", desc: "Platformu kullanan pet sahipleri ve hizmet sağlayıcıları" },
          { term: "Hizmet Sağlayıcı", desc: "Pet otel, taksi ve diğer hizmetleri sunan işletmeler" },
          { term: "Pet Sahibi", desc: "Evcil hayvan sahibi olan ve hizmet talep eden kişiler" },
          { term: "Rezervasyon", desc: "Platform üzerinden yapılan hizmet talepleri" },
          { term: "İçerik", desc: "Platform üzerindeki tüm metin, görsel, video ve diğer materyaller" }
        ]
      },
      {
        id: 3,
        title: "Kullanıcı Yükümlülükleri",
        content: [
          "Doğru ve güncel bilgi verme yükümlülüğü",
          "Platform kurallarına uygun davranma",
          "Diğer kullanıcılara saygılı davranma",
          "Yasalara aykırı içerik paylaşmama",
          "Hesap güvenliğini sağlama sorumluluğu",
          "Ödeme yükümlülüklerini zamanında yerine getirme"
        ]
      },
      {
        id: 4,
        title: "Yasaklı Kullanımlar",
        content: [
          "Platformu yasadışı amaçlarla kullanmak",
          "Sahte bilgi ve belgeler paylaşmak",
          "Diğer kullanıcıları rahatsız edici davranışlarda bulunmak",
          "Spam, reklam veya istenmeyen içerik göndermek",
          "Platformun güvenliğini tehdit edici faaliyetler",
          "Telif hakkı ihlali yapan içerik paylaşmak",
          "Virüs, malware veya zararlı kod yayma",
          "Otomatik sistemler (bot) kullanarak platform erişimi"
        ]
      },
      {
        id: 5,
        title: "Hizmet Koşulları",
        subsections: [
          {
            title: "Pet Otel Hizmetleri",
            items: [
              "Rezervasyon onay süreci 24 saat içinde tamamlanır",
              "Pet sağlık durumu ön muayenede kontrol edilir",
              "Aşı kartı ve sağlık belgesi zorunludur",
              "Hizmet sağlayıcının kurallarına uyum gereklidir",
              "Zarar durumunda sorumluluk hizmet sağlayıcıya aittir"
            ]
          },
          {
            title: "Pet Taksi Hizmetleri",
            items: [
              "Rezervasyon en az 2 saat önceden yapılmalıdır",
              "Pet güvenliği için taşıma kafesi gerekebilir",
              "Mesafe hesaplaması Google Maps API ile yapılır",
              "Trafik durumuna göre süre değişebilir",
              "Acil durumlar için ek ücret uygulanabilir"
            ]
          }
        ]
      },
      {
        id: 6,
        title: "Ödeme ve Faturalama",
        content: [
          "Ödemeler İyzico güvenli ödeme sistemi ile alınır",
          "Kredi kartı, banka kartı ve havale seçenekleri mevcuttur",
          "Faturalar elektronik ortamda düzenlenir",
          "KDV dahil fiyatlar gösterilir",
          "Ödeme onayı sonrası rezervasyon kesinleşir",
          "İade koşulları ayrı politikada belirtilmiştir"
        ]
      },
      {
        id: 7,
        title: "Sorumluluk Sınırlaması",
        content: [
          "Petfendy aracılık hizmeti sunar, doğrudan hizmet sağlayıcısı değildir",
          "Hizmet kalitesinden hizmet sağlayıcı sorumludur",
          "Platform kesintilerinden dolayı sorumluluk sınırlıdır",
          "Kullanıcı verileri güvenliği için azami özen gösterilir",
          "Mücbir sebeplerden dolayı sorumluluk kabul edilmez",
          "Dolaylı zararlardan sorumluluk kabul edilmez"
        ]
      },
      {
        id: 8,
        title: "Fikri Mülkiyet Hakları",
        content: [
          "Platform içeriği telif hakkı ile korunmaktadır",
          "Petfendy markası ve logosu tescilli markadır",
          "Kullanıcı içerikleri için gerekli izinler alınmalıdır",
          "İzinsiz kopyalama ve dağıtım yasaktır",
          "Kullanıcılar paylaştıkları içerikten sorumludur",
          "DMCA bildirimleri kabul edilir ve işleme alınır"
        ]
      },
      {
        id: 9,
        title: "Gizlilik ve Veri Koruma",
        content: [
          "Kişisel veriler KVKK kapsamında korunur",
          "Veri işleme amaçları gizlilik politikasında belirtilir",
          "Kullanıcı hakları KVKK'ya uygun şekilde sağlanır",
          "Çerezler kullanıcı onayı ile kullanılır",
          "Veri güvenliği için endüstri standartları uygulanır",
          "Veri ihlali durumunda gerekli bildirimler yapılır"
        ]
      },
      {
        id: 10,
        title: "Hesap Askıya Alma ve Sonlandırma",
        content: [
          "Şartları ihlal eden hesaplar askıya alınabilir",
          "Tekrarlayan ihlallerde hesap kalıcı olarak kapatılabilir",
          "Kullanıcılar hesaplarını istediği zaman kapatabilir",
          "Hesap kapatma durumunda veriler silinir",
          "Ödenmemiş borçlar hesap kapatmayı engelleyebilir",
          "İtiraz süreci müşteri hizmetleri üzerinden yürütülür"
        ]
      },
      {
        id: 11,
        title: "Değişiklikler ve Güncellemeler",
        content: [
          "Şartlar önceden haber vermeksizin değiştirilebilir",
          "Önemli değişiklikler e-posta ile bildirilir",
          "Güncel şartlar web sitesinde yayınlanır",
          "Değişiklik sonrası platform kullanımı kabul anlamına gelir",
          "Kullanıcılar değişiklikleri düzenli olarak kontrol etmelidir"
        ]
      },
      {
        id: 12,
        title: "Uygulanacak Hukuk ve Yetki",
        content: [
          "Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir",
          "Uyuşmazlıklar Ankara mahkemelerinde çözülür",
          "Tüketici işlemleri için Tüketici Mahkemeleri yetkilidir",
          "Arabuluculuk ve tahkim yolları açıktır",
          "Uluslararası kullanıcılar için özel hükümler uygulanabilir"
        ]
      }
    ],

    acceptance: {
      title: "Kabul ve Onay",
      content: "Bu şartlar ve koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Platform kullanımınız bu kabulün devam ettiği anlamına gelir."
    },

    contact: {
      title: "İletişim",
      description: "Şartlar ve koşullar hakkında sorularınız için:",
      email: "hukuk@petfendy.com",
      phone: "+90 532 307 32 64",
      address: "Bağlıca, Şehit Hikmet Özer Cd. No:101 Etimesgut/Ankara"
    }
  },
  
  en: {
    title: "TERMS AND CONDITIONS",
    subtitle: "By using the Petfendy platform, you agree to the following terms and conditions.",
    lastUpdate: "Last Updated: December 15, 2024",
    
    sections: [
      {
        id: 1,
        title: "General Provisions",
        content: [
          "These terms and conditions govern the use of the Petfendy platform.",
          "The platform is operated by BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY.",
          "By using the platform, you are deemed to have accepted these terms.",
          "When terms are changed, the current version will be published on the website."
        ]
      },
      {
        id: 2,
        title: "Definitions",
        definitions: [
          { term: "Platform", desc: "Petfendy website and mobile application" },
          { term: "User", desc: "Pet owners and service providers using the platform" },
          { term: "Service Provider", desc: "Businesses offering pet hotel, taxi and other services" },
          { term: "Pet Owner", desc: "Persons who own pets and request services" },
          { term: "Reservation", desc: "Service requests made through the platform" },
          { term: "Content", desc: "All text, images, videos and other materials on the platform" }
        ]
      },
      {
        id: 3,
        title: "User Obligations",
        content: [
          "Obligation to provide accurate and up-to-date information",
          "Behaving in accordance with platform rules",
          "Treating other users with respect",
          "Not sharing illegal content",
          "Responsibility for account security",
          "Fulfilling payment obligations on time"
        ]
      },
      {
        id: 4,
        title: "Prohibited Uses",
        content: [
          "Using the platform for illegal purposes",
          "Sharing false information and documents",
          "Engaging in behavior that disturbs other users",
          "Sending spam, advertising or unwanted content",
          "Activities that threaten platform security",
          "Sharing content that violates copyright",
          "Spreading viruses, malware or malicious code",
          "Platform access using automated systems (bots)"
        ]
      },
      {
        id: 5,
        title: "Service Conditions",
        subsections: [
          {
            title: "Pet Hotel Services",
            items: [
              "Reservation approval process is completed within 24 hours",
              "Pet health status is checked in preliminary examination",
              "Vaccination card and health certificate are mandatory",
              "Compliance with service provider rules is required",
              "Service provider is responsible for damage"
            ]
          },
          {
            title: "Pet Taxi Services",
            items: [
              "Reservations must be made at least 2 hours in advance",
              "Transport cage may be required for pet safety",
              "Distance calculation is made with Google Maps API",
              "Duration may vary depending on traffic conditions",
              "Additional fees may apply for emergencies"
            ]
          }
        ]
      },
      {
        id: 6,
        title: "Payment and Billing",
        content: [
          "Payments are received through İyzico secure payment system",
          "Credit card, debit card and wire transfer options are available",
          "Invoices are issued electronically",
          "VAT inclusive prices are shown",
          "Reservation is confirmed after payment approval",
          "Refund conditions are specified in separate policy"
        ]
      },
      {
        id: 7,
        title: "Limitation of Liability",
        content: [
          "Petfendy provides intermediary services, not direct service provider",
          "Service provider is responsible for service quality",
          "Liability for platform interruptions is limited",
          "Maximum care is taken for user data security",
          "No liability is accepted for force majeure",
          "No liability is accepted for indirect damages"
        ]
      },
      {
        id: 8,
        title: "Intellectual Property Rights",
        content: [
          "Platform content is protected by copyright",
          "Petfendy brand and logo are registered trademarks",
          "Necessary permissions must be obtained for user content",
          "Unauthorized copying and distribution is prohibited",
          "Users are responsible for the content they share",
          "DMCA notifications are accepted and processed"
        ]
      },
      {
        id: 9,
        title: "Privacy and Data Protection",
        content: [
          "Personal data is protected under KVKK",
          "Data processing purposes are specified in privacy policy",
          "User rights are provided in accordance with KVKK",
          "Cookies are used with user consent",
          "Industry standards are applied for data security",
          "Necessary notifications are made in case of data breach"
        ]
      },
      {
        id: 10,
        title: "Account Suspension and Termination",
        content: [
          "Accounts violating terms may be suspended",
          "Account may be permanently closed for repeated violations",
          "Users can close their accounts at any time",
          "Data is deleted when account is closed",
          "Unpaid debts may prevent account closure",
          "Appeal process is conducted through customer service"
        ]
      },
      {
        id: 11,
        title: "Changes and Updates",
        content: [
          "Terms may be changed without prior notice",
          "Important changes are notified by email",
          "Current terms are published on the website",
          "Platform use after change means acceptance",
          "Users should regularly check for changes"
        ]
      },
      {
        id: 12,
        title: "Applicable Law and Jurisdiction",
        content: [
          "These terms are subject to the laws of the Republic of Turkey",
          "Disputes are resolved in Ankara courts",
          "Consumer Courts are competent for consumer transactions",
          "Mediation and arbitration ways are open",
          "Special provisions may apply for international users"
        ]
      }
    ],

    acceptance: {
      title: "Acceptance and Approval",
      content: "You declare that you have read, understood and accepted these terms and conditions. Your use of the platform means that this acceptance continues."
    },

    contact: {
      title: "Contact",
      description: "For questions about terms and conditions:",
      email: "legal@petfendy.com",
      phone: "+90 532 307 32 64",
      address: "Bağlıca, Şehit Hikmet Özer St. No:101 Etimesgut/Ankara, Turkey"
    }
  }
}

export default function TermsConditionsPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <Scale className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Scale className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-slate-100 text-lg max-w-2xl mx-auto mb-4">
            {t.subtitle}
          </p>
          <p className="text-slate-200 text-sm">
            {t.lastUpdate}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Table of Contents */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              İçindekiler / Table of Contents
            </h2>
            <div className="grid md:grid-cols-2 gap-2">
              {t.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#section-${section.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                    {section.id}
                  </span>
                  <span className="text-gray-700 hover:text-blue-600">{section.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {t.sections.map((section) => (
            <Card key={section.id} id={`section-${section.id}`} className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{section.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>

                {/* Definitions */}
                {section.definitions && (
                  <div className="space-y-4">
                    {section.definitions.map((def, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-900 mb-2">{def.term}:</div>
                        <div className="text-gray-700">{def.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular content */}
                {section.content && (
                  <div className="space-y-3">
                    {section.content.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subsections */}
                {section.subsections && (
                  <div className="space-y-6">
                    {section.subsections.map((subsection, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{subsection.title}</h3>
                        <div className="space-y-3">
                          {subsection.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Acceptance */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t.acceptance.title}</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              {t.acceptance.content}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-0 shadow-lg mt-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Phone className="w-6 h-6 text-green-600" />
              {t.contact.title}
            </h2>
            <p className="text-gray-600 mb-6">{t.contact.description}</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{t.contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">{t.contact.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{t.contact.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Footer locale={locale} />
    </div>
  )
}