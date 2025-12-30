"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, Shield, Settings, BarChart3, Target, Mail, Phone } from "lucide-react"

const content = {
  tr: {
    title: "ÇEREZ POLİTİKASI",
    lastUpdate: "Son Güncelleme: 15 Aralık 2024",
    intro: "Petfendy olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek için çerezler kullanıyoruz. Bu politika, hangi çerezleri kullandığımızı ve bunları nasıl yönetebileceğinizi açıklamaktadır.",
    sections: [
      {
        icon: "cookie",
        title: "Çerez Nedir?",
        text: "Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar, tercihlerinizi hatırlamak, site performansını analiz etmek ve size kişiselleştirilmiş içerik sunmak için kullanılır."
      },
      {
        icon: "shield",
        title: "Zorunlu Çerezler",
        text: "Bu çerezler web sitesinin düzgün çalışması için gereklidir. Oturum yönetimi, güvenlik ve temel site işlevleri için kullanılır. Bu çerezler devre dışı bırakılamaz."
      },
      {
        icon: "chart",
        title: "Analitik Çerezler",
        text: "Ziyaretçilerin sitemizi nasıl kullandığını anlamamıza yardımcı olur. Sayfa görüntülemeleri, ziyaret süreleri ve hata raporları gibi anonim veriler toplar."
      },
      {
        icon: "target",
        title: "Pazarlama Çerezleri",
        text: "Size ilgi alanlarınıza göre reklamlar göstermek için kullanılır. Üçüncü taraf reklam ağları tarafından yerleştirilebilir."
      },
      {
        icon: "settings",
        title: "Çerez Tercihlerinizi Yönetme",
        text: "Tarayıcı ayarlarınızdan çerezleri kabul etmeyi veya reddetmeyi seçebilirsiniz. Ancak bazı çerezleri devre dışı bırakmak, web sitesinin bazı özelliklerinin düzgün çalışmamasına neden olabilir."
      }
    ],
    browserSettings: "Tarayıcı Ayarları",
    browserText: "Çerez tercihlerinizi tarayıcınızın ayarlar menüsünden değiştirebilirsiniz:",
    browsers: ["Chrome: Ayarlar > Gizlilik ve Güvenlik > Çerezler", "Firefox: Seçenekler > Gizlilik ve Güvenlik", "Safari: Tercihler > Gizlilik", "Edge: Ayarlar > Çerezler ve site izinleri"],
    contactTitle: "İletişim",
    contactText: "Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:",
    email: "E-posta",
    phone: "Telefon"
  },
  en: {
    title: "COOKIE POLICY",
    lastUpdate: "Last Update: December 15, 2024",
    intro: "At Petfendy, we use cookies to enhance your experience when you visit our website. This policy explains which cookies we use and how you can manage them.",
    sections: [
      {
        icon: "cookie",
        title: "What is a Cookie?",
        text: "Cookies are small text files that websites place on your browser. These files are used to remember your preferences, analyze site performance, and provide you with personalized content."
      },
      {
        icon: "shield",
        title: "Essential Cookies",
        text: "These cookies are necessary for the website to function properly. They are used for session management, security, and basic site functions. These cookies cannot be disabled."
      },
      {
        icon: "chart",
        title: "Analytics Cookies",
        text: "Help us understand how visitors use our site. They collect anonymous data such as page views, visit durations, and error reports."
      },
      {
        icon: "target",
        title: "Marketing Cookies",
        text: "Used to show you ads based on your interests. They may be placed by third-party advertising networks."
      },
      {
        icon: "settings",
        title: "Managing Your Cookie Preferences",
        text: "You can choose to accept or reject cookies from your browser settings. However, disabling some cookies may cause some features of the website to not function properly."
      }
    ],
    browserSettings: "Browser Settings",
    browserText: "You can change your cookie preferences from your browser's settings menu:",
    browsers: ["Chrome: Settings > Privacy and Security > Cookies", "Firefox: Options > Privacy & Security", "Safari: Preferences > Privacy", "Edge: Settings > Cookies and site permissions"],
    contactTitle: "Contact",
    contactText: "For questions about our cookie policy, you can contact us:",
    email: "Email",
    phone: "Phone"
  }
}

const iconMap = {
  cookie: Cookie,
  shield: Shield,
  chart: BarChart3,
  target: Target,
  settings: Settings
}

export default function CookiePolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
        <div className="absolute top-10 left-10 opacity-20"><Cookie className="w-24 h-24 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><Settings className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Cookie className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-amber-100 text-sm">{t.lastUpdate}</p>
        </div>
      </section>

      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed">{t.intro}</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {t.sections.map((section, index) => {
            const IconComponent = iconMap[section.icon as keyof typeof iconMap] || Cookie
            return (
              <Card key={index} className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                      <p className="text-gray-600 leading-relaxed text-sm">{section.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Browser Settings */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-4">{t.browserSettings}</h2>
              <p className="text-gray-600 text-sm mb-4">{t.browserText}</p>
              <ul className="space-y-2">
                {t.browsers.map((browser, i) => (
                  <li key={i} className="text-gray-600 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    {browser}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500">
            <CardContent className="p-6 sm:p-8 text-white">
              <h2 className="text-xl font-bold mb-4">{t.contactTitle}</h2>
              <p className="text-amber-100 text-sm mb-4">{t.contactText}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-amber-200">{t.email}</p>
                    <p className="font-medium">petfendyotel@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="text-xs text-amber-200">{t.phone}</p>
                    <p className="font-medium">+90 532 307 32 64</p>
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
