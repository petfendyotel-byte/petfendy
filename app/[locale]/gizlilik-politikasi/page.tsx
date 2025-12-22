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

export default function PrivacyPolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  const stats = [
    { label: "KVKK Uyumlu", value: "100%", icon: <Shield className="w-6 h-6" /> },
    { label: "Korunan Kullanıcı", value: "5K+", icon: <Users className="w-6 h-6" /> },
    { label: "Temel Hak", value: "9", icon: <Scale className="w-6 h-6" /> },
    { label: "Veri Koruması", value: "24/7", icon: <Clock className="w-6 h-6" /> },
  ]

  const dataProcessingPurposes = [
    "Otel ve Taksi rezervasyonlarının gerçekleştirilmesi ve yönetilmesi",
    "Kullanıcı hesaplarının oluşturulması ve yönetilmesi",
    "İletişim ve bilgilendirme faaliyetlerinin yürütülmesi",
    "Kullanıcı memnuniyetinin sağlanması ve artırılması",
    "Hizmetlerimizin iyileştirilmesi ve geliştirilmesi",
    "Yasal yükümlülüklerin yerine getirilmesi",
  ]

  const legalBases = [
    "6698 sayılı KVKK ve ilgili mevzuat hükümlerinin açıkça öngörülmesi",
    "Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması",
    "Hukuki yükümlülüğün yerine getirilmesi",
    "Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması",
    "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla, Petfendy'nin meşru menfaatleri için veri işlenmesinin zorunlu olması",
  ]

  const userRights = [
    { num: 1, text: "Kişisel verilerinizin işlenip işlenmediğini öğrenme" },
    { num: 2, text: "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme" },
    { num: 3, text: "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme" },
    { num: 4, text: "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme" },
    { num: 5, text: "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme" },
    { num: 6, text: "Kişisel verilerinizin silinmesini veya yok edilmesini isteme" },
    { num: 7, text: "Düzeltme, silme veya yok edilme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme" },
    { num: 8, text: "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme" },
    { num: 9, text: "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme" },
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
          <p className="text-blue-200 font-medium mb-2">Veri Güvenliği</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Petfendy olarak kullanıcılarımızın kişisel verilerinin korunmasına büyük önem veriyoruz. 
            Bu dokümanda verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında detaylı bilgi bulabilirsiniz.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                  {stat.icon}
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
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">Veri Sorumlusunun Kimliği</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                    veri sorumlusu sıfatıyla <strong>Petfendy</strong> tarafından hazırlanmıştır. 
                    Petfendy, kullanıcılarının kişisel verilerinin korunmasına büyük önem vermektedir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Kişisel Verilerin İşlenme Amacı</h2>
                  <p className="text-gray-600 mb-4">
                    Petfendy platformu olarak, kullanıcılarımızın pet otel rezervasyon işlemlerini kolaylaştırmak, 
                    otel sahiplerinin ve pet sahiplerinin ihtiyaçlarına yönelik hizmetler sunmak amacıyla kişisel verilerinizi işlemekteyiz.
                  </p>
                  <ul className="space-y-2">
                    {dataProcessingPurposes.map((purpose, index) => (
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
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4">Kişisel Verilerin Aktarılması</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda, yurt içindeki ve yurt dışındaki 
                    iş ortaklarımıza, hizmet sağlayıcılarımıza, kanunen yetkili kamu kurumlarına ve özel kişilere, 
                    KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde aktarılabilecektir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Veri Toplama Yöntemi ve Hukuki Sebep</h2>
                  <p className="text-gray-600 mb-4">
                    Kişisel verileriniz, Petfendy platformu üzerinden elektronik ortamda toplanmaktadır. 
                    Kişisel verilerinizin işlenmesinin hukuki sebepleri şunlardır:
                  </p>
                  <ul className="space-y-2">
                    {legalBases.map((basis, index) => (
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

          {/* Section 5 - User Rights */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">İlgili Kişilerin Hakları</h2>
                  <p className="text-gray-600 mb-4">
                    KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri olarak aşağıdaki haklara sahipsiniz:
                  </p>
                  <div className="grid gap-3">
                    {userRights.map((right) => (
                      <div key={right.num} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-7 h-7 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {right.num}
                        </div>
                        <p className="text-gray-600 text-sm">{right.text}</p>
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
                <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  6
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-xl font-bold mb-4">İletişim</h2>
                  <p className="text-blue-100 mb-6">
                    Haklarınızı kullanmak veya kişisel verilerinizle ilgili herhangi bir soru veya talebiniz için 
                    bizimle aşağıdaki iletişim bilgileri aracılığıyla irtibata geçebilirsiniz:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Mail className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-200">E-posta</p>
                        <p className="font-medium">petfendyotel@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Phone className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-200">Destek Hattı</p>
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
