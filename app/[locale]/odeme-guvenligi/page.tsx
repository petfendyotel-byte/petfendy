"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Lock, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Server,
  Smartphone,
  Globe,
  FileText,
  Phone,
  Mail
} from "lucide-react"

const content = {
  tr: {
    title: "ÖDEME GÜVENLİĞİ",
    subtitle: "Petfendy olarak ödeme güvenliğinizi en üst düzeyde tutmak için endüstri standardı güvenlik önlemleri alıyoruz.",
    
    paytrSection: {
      title: "PayTR Güvenli Ödeme Altyapısı",
      description: "Tüm ödemeleriniz PayTR'nin PCI-DSS sertifikalı güvenli altyapısı üzerinden işlenmektedir.",
      features: [
        "PCI-DSS Level 1 sertifikası",
        "256-bit SSL şifreleme",
        "3D Secure doğrulama",
        "Fraud detection sistemi",
        "24/7 güvenlik izleme"
      ]
    },

    sslSection: {
      title: "SSL Sertifikası ve HTTPS",
      description: "Web sitemiz 256-bit SSL sertifikası ile korunmaktadır. Tüm veri aktarımları şifrelenir.",
      features: [
        "Extended Validation (EV) SSL sertifikası",
        "Tüm sayfalar HTTPS ile korunuyor",
        "Otomatik HTTP'den HTTPS yönlendirme",
        "HSTS (HTTP Strict Transport Security) aktif",
        "Perfect Forward Secrecy desteği"
      ]
    },

    dataProtection: {
      title: "Veri Koruma Önlemleri",
      description: "Kişisel ve finansal verileriniz en yüksek güvenlik standartlarıyla korunmaktadır.",
      measures: [
        {
          icon: "lock",
          title: "Şifreleme",
          desc: "Tüm hassas veriler AES-256 ile şifrelenir"
        },
        {
          icon: "server",
          title: "Güvenli Sunucular",
          desc: "Verileriniz ISO 27001 sertifikalı veri merkezlerinde saklanır"
        },
        {
          icon: "eye",
          title: "Erişim Kontrolü",
          desc: "Çok faktörlü kimlik doğrulama ve rol tabanlı erişim"
        },
        {
          icon: "shield",
          title: "Firewall Koruması",
          desc: "Web Application Firewall (WAF) ile sürekli koruma"
        }
      ]
    },

    cardSecurity: {
      title: "Kredi Kartı Güvenliği",
      description: "Kredi kartı bilgileriniz hiçbir zaman sunucularımızda saklanmaz.",
      points: [
        "Kart bilgileri doğrudan PayTR'ye iletilir",
        "Petfendy sunucularında kart verisi saklanmaz",
        "PCI-DSS uyumlu ödeme işlemi",
        "Tokenization ile güvenli saklama",
        "CVV bilgisi hiçbir zaman kaydedilmez"
      ]
    },

    fraudPrevention: {
      title: "Dolandırıcılık Önleme",
      description: "Gelişmiş algoritmalara sahip fraud detection sistemi ile korunuyorsunuz.",
      features: [
        "Gerçek zamanlı risk analizi",
        "Şüpheli işlem tespiti",
        "IP ve cihaz bazlı kontroller",
        "Velocity checking (hız kontrolü)",
        "Machine learning tabanlı analiz"
      ]
    },

    userTips: {
      title: "Güvenli Ödeme İpuçları",
      description: "Ödeme güvenliğinizi artırmak için bu önerileri takip edin:",
      tips: [
        {
          icon: "smartphone",
          title: "Güvenli Cihaz Kullanın",
          desc: "Ödemeleri kendi cihazınızdan yapın, ortak bilgisayar kullanmayın"
        },
        {
          icon: "globe",
          title: "URL'yi Kontrol Edin",
          desc: "Adres çubuğunda 'https://petfendy.com' olduğundan emin olun"
        },
        {
          icon: "lock",
          title: "Güçlü Şifre",
          desc: "Hesabınız için güçlü ve benzersiz şifre kullanın"
        },
        {
          icon: "eye",
          title: "İşlemleri Takip Edin",
          desc: "Ödeme sonrası SMS ve e-posta bildirimlerini kontrol edin"
        }
      ]
    },

    certifications: {
      title: "Sertifikalar ve Uyumluluk",
      items: [
        "PCI-DSS Level 1 Compliance",
        "ISO 27001 Bilgi Güvenliği",
        "KVKK (6698 sayılı kanun) Uyumlu",
        "GDPR Compliance",
        "SSL/TLS 1.3 Desteği"
      ]
    },

    support: {
      title: "Güvenlik Desteği",
      description: "Ödeme güvenliği ile ilgili sorularınız için 7/24 destek ekibimizle iletişime geçebilirsiniz.",
      contact: {
        phone: "+90 532 307 32 64",
        email: "guvenlik@petfendy.com",
        hours: "7/24 Destek"
      }
    }
  },
  
  en: {
    title: "PAYMENT SECURITY",
    subtitle: "At Petfendy, we implement industry-standard security measures to keep your payment security at the highest level.",
    
    paytrSection: {
      title: "PayTR Secure Payment Infrastructure",
      description: "All your payments are processed through PayTR's PCI-DSS certified secure infrastructure.",
      features: [
        "PCI-DSS Level 1 certification",
        "256-bit SSL encryption",
        "3D Secure authentication",
        "Fraud detection system",
        "24/7 security monitoring"
      ]
    },

    sslSection: {
      title: "SSL Certificate and HTTPS",
      description: "Our website is protected with 256-bit SSL certificate. All data transfers are encrypted.",
      features: [
        "Extended Validation (EV) SSL certificate",
        "All pages protected with HTTPS",
        "Automatic HTTP to HTTPS redirect",
        "HSTS (HTTP Strict Transport Security) active",
        "Perfect Forward Secrecy support"
      ]
    },

    dataProtection: {
      title: "Data Protection Measures",
      description: "Your personal and financial data is protected with the highest security standards.",
      measures: [
        {
          icon: "lock",
          title: "Encryption",
          desc: "All sensitive data is encrypted with AES-256"
        },
        {
          icon: "server",
          title: "Secure Servers",
          desc: "Your data is stored in ISO 27001 certified data centers"
        },
        {
          icon: "eye",
          title: "Access Control",
          desc: "Multi-factor authentication and role-based access"
        },
        {
          icon: "shield",
          title: "Firewall Protection",
          desc: "Continuous protection with Web Application Firewall (WAF)"
        }
      ]
    },

    cardSecurity: {
      title: "Credit Card Security",
      description: "Your credit card information is never stored on our servers.",
      points: [
        "Card details are sent directly to PayTR",
        "No card data stored on Petfendy servers",
        "PCI-DSS compliant payment processing",
        "Secure storage with tokenization",
        "CVV information is never recorded"
      ]
    },

    fraudPrevention: {
      title: "Fraud Prevention",
      description: "You are protected by advanced fraud detection system with sophisticated algorithms.",
      features: [
        "Real-time risk analysis",
        "Suspicious transaction detection",
        "IP and device-based controls",
        "Velocity checking",
        "Machine learning based analysis"
      ]
    },

    userTips: {
      title: "Secure Payment Tips",
      description: "Follow these recommendations to enhance your payment security:",
      tips: [
        {
          icon: "smartphone",
          title: "Use Secure Device",
          desc: "Make payments from your own device, don't use shared computers"
        },
        {
          icon: "globe",
          title: "Check URL",
          desc: "Make sure the address bar shows 'https://petfendy.com'"
        },
        {
          icon: "lock",
          title: "Strong Password",
          desc: "Use a strong and unique password for your account"
        },
        {
          icon: "eye",
          title: "Monitor Transactions",
          desc: "Check SMS and email notifications after payment"
        }
      ]
    },

    certifications: {
      title: "Certifications and Compliance",
      items: [
        "PCI-DSS Level 1 Compliance",
        "ISO 27001 Information Security",
        "KVKK (Law No. 6698) Compliant",
        "GDPR Compliance",
        "SSL/TLS 1.3 Support"
      ]
    },

    support: {
      title: "Security Support",
      description: "Contact our 24/7 support team for questions about payment security.",
      contact: {
        phone: "+90 532 307 32 64",
        email: "security@petfendy.com",
        hours: "24/7 Support"
      }
    }
  }
}

export default function PaymentSecurityPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content]

  const iconMap = {
    lock: Lock,
    server: Server,
    eye: Eye,
    shield: Shield,
    smartphone: Smartphone,
    globe: Globe
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <Shield className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* PayTR Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.paytrSection.title}</h2>
                <p className="text-gray-600">{t.paytrSection.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.paytrSection.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SSL Section */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.sslSection.title}</h2>
                <p className="text-gray-600">{t.sslSection.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.sslSection.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.dataProtection.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.dataProtection.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.dataProtection.measures.map((measure, index) => {
                const IconComponent = iconMap[measure.icon as keyof typeof iconMap]
                return (
                  <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{measure.title}</h3>
                    <p className="text-sm text-gray-600">{measure.desc}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card Security */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.cardSecurity.title}</h2>
                <p className="text-gray-600">{t.cardSecurity.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.cardSecurity.points.map((point, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Tips */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.userTips.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.userTips.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.userTips.tips.map((tip, index) => {
                const IconComponent = iconMap[tip.icon as keyof typeof iconMap]
                return (
                  <div key={index} className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.desc}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.certifications.title}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.certifications.items.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t.support.title}</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">{t.support.description}</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>{t.support.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>{t.support.contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>{t.support.contact.hours}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Footer locale={locale} />
    </div>
  )
}