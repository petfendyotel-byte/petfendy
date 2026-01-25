"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Lock, 
  Server, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Database,
  Cloud,
  Fingerprint,
  Key,
  FileText,
  Phone,
  Mail,
  Clock
} from "lucide-react"

const content = {
  tr: {
    title: "VERİ GÜVENLİĞİ",
    subtitle: "Petfendy olarak verilerinizin güvenliği bizim en önemli önceliğimizdir. Endüstri standardı güvenlik önlemleri ile verilerinizi koruyoruz.",
    
    dataEncryption: {
      title: "Veri Şifreleme",
      description: "Tüm verileriniz en güçlü şifreleme teknolojileri ile korunmaktadır.",
      features: [
        "AES-256 bit şifreleme",
        "RSA 4096 bit anahtar değişimi",
        "SHA-256 hash algoritması",
        "Perfect Forward Secrecy",
        "End-to-end encryption"
      ]
    },

    dataStorage: {
      title: "Güvenli Veri Saklama",
      description: "Verileriniz ISO 27001 sertifikalı veri merkezlerinde güvenle saklanmaktadır.",
      features: [
        "ISO 27001 sertifikalı veri merkezi",
        "SOC 2 Type II uyumlu altyapı",
        "Coğrafi olarak dağıtılmış yedekleme",
        "7/24 fiziksel güvenlik",
        "Çevresel kontroller (yangın, sel, deprem)"
      ]
    },

    accessControl: {
      title: "Erişim Kontrolü",
      description: "Verilerinize erişim çok katmanlı güvenlik önlemleri ile kontrol edilmektedir.",
      measures: [
        {
          icon: "fingerprint",
          title: "Çok Faktörlü Kimlik Doğrulama",
          desc: "2FA/MFA ile güçlendirilmiş giriş sistemi"
        },
        {
          icon: "key",
          title: "Rol Tabanlı Erişim",
          desc: "Minimum yetki prensibi ile sınırlı erişim"
        },
        {
          icon: "eye",
          title: "Sürekli İzleme",
          desc: "Tüm erişimler gerçek zamanlı izlenir ve loglanır"
        },
        {
          icon: "shield",
          title: "Anomali Tespiti",
          desc: "AI destekli şüpheli aktivite tespiti"
        }
      ]
    },

    dataBackup: {
      title: "Veri Yedekleme ve Kurtarma",
      description: "Verileriniz düzenli olarak yedeklenir ve felaket durumlarına karşı korunur.",
      features: [
        "Günlük otomatik yedekleme",
        "Çoklu coğrafi lokasyon",
        "Point-in-time recovery",
        "RTO: 4 saat, RPO: 1 saat",
        "Düzenli kurtarma testleri"
      ]
    },

    compliance: {
      title: "Uyumluluk ve Sertifikalar",
      description: "Uluslararası veri koruma standartlarına tam uyumluluk sağlıyoruz.",
      standards: [
        {
          name: "KVKK (6698 sayılı kanun)",
          desc: "Türkiye Kişisel Verilerin Korunması Kanunu"
        },
        {
          name: "GDPR",
          desc: "Avrupa Birliği Genel Veri Koruma Yönetmeliği"
        },
        {
          name: "ISO 27001",
          desc: "Bilgi Güvenliği Yönetim Sistemi"
        },
        {
          name: "SOC 2 Type II",
          desc: "Güvenlik, Kullanılabilirlik ve Gizlilik"
        },
        {
          name: "PCI-DSS",
          desc: "Ödeme Kartı Endüstrisi Veri Güvenliği Standardı"
        }
      ]
    },

    incidentResponse: {
      title: "Olay Müdahale Süreci",
      description: "Güvenlik olaylarına hızlı ve etkili müdahale için 7/24 hazır ekibimiz bulunmaktadır.",
      steps: [
        {
          step: "1",
          title: "Tespit",
          desc: "Otomatik sistemler ve uzman ekip ile anında tespit"
        },
        {
          step: "2",
          title: "Analiz",
          desc: "Olay kapsamı ve etkisinin detaylı analizi"
        },
        {
          step: "3",
          title: "Müdahale",
          desc: "Hızlı müdahale ile zararın minimize edilmesi"
        },
        {
          step: "4",
          title: "Bildirim",
          desc: "Yasal sürelerde ilgili taraflara bildirim"
        },
        {
          step: "5",
          title: "İyileştirme",
          desc: "Süreçlerin gözden geçirilmesi ve iyileştirilmesi"
        }
      ]
    },

    userRights: {
      title: "Kullanıcı Hakları",
      description: "KVKK ve GDPR kapsamında sahip olduğunuz haklar:",
      rights: [
        "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
        "İşlenen kişisel verileriniz hakkında bilgi talep etme",
        "İşleme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
        "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
        "Eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme",
        "Kanunda öngörülen şartlar çerçevesinde silinmesini isteme",
        "Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme",
        "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme",
        "Kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması halinde zararın giderilmesini talep etme"
      ]
    },

    dataRetention: {
      title: "Veri Saklama Politikası",
      description: "Verilerinizi yalnızca gerekli süre boyunca saklarız.",
      periods: [
        { type: "Hesap Bilgileri", period: "Hesap aktif olduğu sürece" },
        { type: "Rezervasyon Kayıtları", period: "5 yıl (vergi mevzuatı)" },
        { type: "İletişim Logları", period: "2 yıl" },
        { type: "Güvenlik Logları", period: "1 yıl" },
        { type: "Pazarlama İzinleri", period: "İzin geri alınana kadar" },
        { type: "Çerez Verileri", period: "Çerez politikasına göre" }
      ]
    },

    securityTeam: {
      title: "Güvenlik Ekibi",
      description: "Deneyimli siber güvenlik uzmanlarımız 7/24 verilerinizi korumaktadır.",
      stats: [
        { label: "Güvenlik Uzmanı", value: "12+" },
        { label: "Yıllık Deneyim", value: "8+" },
        { label: "Sertifika", value: "25+" },
        { label: "Müdahale Süresi", value: "<15dk" }
      ]
    },

    contact: {
      title: "Veri Güvenliği İletişim",
      description: "Veri güvenliği ile ilgili sorularınız için bizimle iletişime geçin.",
      dpo: {
        title: "Veri Koruma Sorumlusu (DPO)",
        email: "dpo@petfendy.com",
        phone: "+90 532 307 32 64"
      },
      security: {
        title: "Güvenlik Ekibi",
        email: "security@petfendy.com",
        phone: "+90 532 307 32 64"
      }
    }
  },
  
  en: {
    title: "DATA SECURITY",
    subtitle: "At Petfendy, the security of your data is our top priority. We protect your data with industry-standard security measures.",
    
    dataEncryption: {
      title: "Data Encryption",
      description: "All your data is protected with the strongest encryption technologies.",
      features: [
        "AES-256 bit encryption",
        "RSA 4096 bit key exchange",
        "SHA-256 hash algorithm",
        "Perfect Forward Secrecy",
        "End-to-end encryption"
      ]
    },

    dataStorage: {
      title: "Secure Data Storage",
      description: "Your data is securely stored in ISO 27001 certified data centers.",
      features: [
        "ISO 27001 certified data center",
        "SOC 2 Type II compliant infrastructure",
        "Geographically distributed backup",
        "24/7 physical security",
        "Environmental controls (fire, flood, earthquake)"
      ]
    },

    accessControl: {
      title: "Access Control",
      description: "Access to your data is controlled with multi-layered security measures.",
      measures: [
        {
          icon: "fingerprint",
          title: "Multi-Factor Authentication",
          desc: "Enhanced login system with 2FA/MFA"
        },
        {
          icon: "key",
          title: "Role-Based Access",
          desc: "Limited access with principle of least privilege"
        },
        {
          icon: "eye",
          title: "Continuous Monitoring",
          desc: "All access is monitored and logged in real-time"
        },
        {
          icon: "shield",
          title: "Anomaly Detection",
          desc: "AI-powered suspicious activity detection"
        }
      ]
    },

    dataBackup: {
      title: "Data Backup and Recovery",
      description: "Your data is regularly backed up and protected against disasters.",
      features: [
        "Daily automatic backup",
        "Multiple geographic locations",
        "Point-in-time recovery",
        "RTO: 4 hours, RPO: 1 hour",
        "Regular recovery testing"
      ]
    },

    compliance: {
      title: "Compliance and Certifications",
      description: "We ensure full compliance with international data protection standards.",
      standards: [
        {
          name: "KVKK (Law No. 6698)",
          desc: "Turkey Personal Data Protection Law"
        },
        {
          name: "GDPR",
          desc: "European Union General Data Protection Regulation"
        },
        {
          name: "ISO 27001",
          desc: "Information Security Management System"
        },
        {
          name: "SOC 2 Type II",
          desc: "Security, Availability and Confidentiality"
        },
        {
          name: "PCI-DSS",
          desc: "Payment Card Industry Data Security Standard"
        }
      ]
    },

    incidentResponse: {
      title: "Incident Response Process",
      description: "We have a 24/7 ready team for quick and effective response to security incidents.",
      steps: [
        {
          step: "1",
          title: "Detection",
          desc: "Instant detection with automated systems and expert team"
        },
        {
          step: "2",
          title: "Analysis",
          desc: "Detailed analysis of incident scope and impact"
        },
        {
          step: "3",
          title: "Response",
          desc: "Quick response to minimize damage"
        },
        {
          step: "4",
          title: "Notification",
          desc: "Notification to relevant parties within legal timeframes"
        },
        {
          step: "5",
          title: "Improvement",
          desc: "Review and improvement of processes"
        }
      ]
    },

    userRights: {
      title: "User Rights",
      description: "Your rights under KVKK and GDPR:",
      rights: [
        "Learn whether your personal data is being processed",
        "Request information about your processed personal data",
        "Learn the purpose of processing and whether they are used appropriately",
        "Know third parties to whom data is transferred domestically or abroad",
        "Request correction if processed incompletely or incorrectly",
        "Request deletion under conditions provided by law",
        "Request notification of correction and deletion to third parties",
        "Object to adverse results from automated analysis of processed data",
        "Request compensation for damages caused by unlawful processing"
      ]
    },

    dataRetention: {
      title: "Data Retention Policy",
      description: "We keep your data only for the necessary period.",
      periods: [
        { type: "Account Information", period: "While account is active" },
        { type: "Reservation Records", period: "5 years (tax legislation)" },
        { type: "Communication Logs", period: "2 years" },
        { type: "Security Logs", period: "1 year" },
        { type: "Marketing Consents", period: "Until consent is withdrawn" },
        { type: "Cookie Data", period: "According to cookie policy" }
      ]
    },

    securityTeam: {
      title: "Security Team",
      description: "Our experienced cybersecurity experts protect your data 24/7.",
      stats: [
        { label: "Security Experts", value: "12+" },
        { label: "Years Experience", value: "8+" },
        { label: "Certifications", value: "25+" },
        { label: "Response Time", value: "<15min" }
      ]
    },

    contact: {
      title: "Data Security Contact",
      description: "Contact us for questions about data security.",
      dpo: {
        title: "Data Protection Officer (DPO)",
        email: "dpo@petfendy.com",
        phone: "+90 532 307 32 64"
      },
      security: {
        title: "Security Team",
        email: "security@petfendy.com",
        phone: "+90 532 307 32 64"
      }
    }
  }
}

export default function DataSecurityPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content]

  const iconMap = {
    fingerprint: Fingerprint,
    key: Key,
    eye: Eye,
    shield: Shield
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <Database className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Database className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* Data Encryption */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.dataEncryption.title}</h2>
                <p className="text-gray-600">{t.dataEncryption.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.dataEncryption.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.dataStorage.title}</h2>
                <p className="text-gray-600">{t.dataStorage.description}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.dataStorage.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.accessControl.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.accessControl.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.accessControl.measures.map((measure, index) => {
                const IconComponent = iconMap[measure.icon as keyof typeof iconMap]
                return (
                  <div key={index} className="text-center p-6 bg-purple-50 rounded-lg">
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

        {/* Compliance */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.compliance.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.compliance.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.compliance.standards.map((standard, index) => (
                <div key={index} className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900">{standard.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{standard.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident Response */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.incidentResponse.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.incidentResponse.description}</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {t.incidentResponse.steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.userRights.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.userRights.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {t.userRights.rights.map((right, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{right}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.dataRetention.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.dataRetention.description}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Veri Türü</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Saklama Süresi</th>
                  </tr>
                </thead>
                <tbody>
                  {t.dataRetention.periods.map((period, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">{period.type}</td>
                      <td className="py-3 px-4 text-gray-600">{period.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Security Team Stats */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.securityTeam.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.securityTeam.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.securityTeam.stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">{t.contact.title}</h2>
              <p className="text-indigo-100 max-w-2xl mx-auto">{t.contact.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">{t.contact.dpo.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>{t.contact.dpo.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span>{t.contact.dpo.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">{t.contact.security.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>{t.contact.security.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span>{t.contact.security.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Footer locale={locale} />
    </div>
  )
}