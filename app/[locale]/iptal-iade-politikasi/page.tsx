"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  RefreshCw, 
  Clock, 
  CheckCircle,
  Mail,
  Phone,
  AlertTriangle,
  Users,
  Building2,
  FileText,
  Calendar,
  Shield,
  MessageCircle,
  Headphones
} from "lucide-react"

export default function RefundPolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
        
        <div className="absolute top-10 left-10 opacity-20">
          <RefreshCw className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Calendar className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <RefreshCw className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            İPTAL VE İADE POLİTİKASI
          </h1>
          <p className="text-orange-100 text-sm">
            Son Güncelleme: 15 Aralık 2024
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed">
            Petfendy, evcil hayvan sahipleri ve hizmet sağlayıcıları için adil ve şeffaf bir platform olarak 
            iptal ve iade süreçlerini aşağıdaki kriterlere göre yönetmektedir:
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Section 1 - Pet Sahipleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <span className="text-blue-200 text-sm font-medium">Bölüm 1</span>
                  <h2 className="text-xl font-bold">Pet Sahipleri için İptal ve İade Koşulları</h2>
                </div>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* 1.1 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1.1</span>
                  Rezervasyon Onayı ve Doğruluk Beyanı
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Pet sahibi, rezervasyonun ön onaylı olduğunu ve işletmenin 24 saat içinde onay/ret hakkı olduğunu kabul eder.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>24 saat içinde yanıtlanmayan rezervasyonlar otomatik olarak onaylanmış sayılır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Doğrudan onaylı rezervasyonlarda ödeme tamamlandığında rezervasyon kesinleşir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Verilen bilgilerin (hastalık, alerji, çip no vb.) doğru olmaması durumunda iade yapılmaz.</span>
                  </li>
                </ul>
              </div>

              {/* 1.2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1.2</span>
                  Ücretsiz İptal Hakkı
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Rezervasyon sonrası ilk 6 saat içinde ücretsiz iptal hakkı vardır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Rezervasyon tarihine 72 saatten az kaldıysa bu hak geçerli değildir.</span>
                  </li>
                </ul>
              </div>

              {/* 1.3 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1.3</span>
                  İptal Sonrası İade Süreci
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>İadeler politika kurallarına göre işlenir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Bankanıza bağlı olarak 7–14 iş günü içinde gerçekleşir.</span>
                  </li>
                </ul>
              </div>

              {/* 1.4 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1.4</span>
                  Hizmetin Kabul Edilememesi
                </h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Ön muayenede konaklamaya engel hastalık/politika ihlali tespitinde ilk gece ücreti tahsil edilir.</span>
                </p>
              </div>

              {/* 1.5 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">1.5</span>
                  Kısmi Hizmet Kullanımı
                </h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Hizmetten kısmi faydalanma durumunda iade yapılmaz.</span>
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Section 2 - Pet Otelleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <span className="text-purple-200 text-sm font-medium">Bölüm 2</span>
                  <h2 className="text-xl font-bold">Pet Otelleri için İptal ve İade Koşulları</h2>
                </div>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {/* 2.1 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">2.1</span>
                  Rezervasyon Türleri ve Onay Süreci
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>İşletme doğrudan onaylı veya ön onaylı rezervasyon modelini seçebilir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Ön onaylılarda 24 saat içinde yanıtlanmayan talepler otomatik onaylanır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Hizmet saatine 24 saatten az kala benzer şekilde otomatik onaylanır.</span>
                  </li>
                </ul>
              </div>

              {/* 2.2 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">2.2</span>
                  Hizmetin İptali
                </h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>Onaylı rezervasyonun iptali, yalnızca pet sahibinin yazılı onayı ile mümkündür.</span>
                </p>
              </div>

              {/* 2.3 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">2.3</span>
                  Mücbir Sebepler
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Pet sahibi iptal ederek iade isteyebilir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>Alternatif tarih için erteleme talep edebilir.</span>
                  </li>
                </ul>
              </div>

              {/* 2.4 */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">2.4</span>
                  Hizmette Sorun / Eksiklik
                </h3>
                <p className="text-gray-600 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Geçerli şikayetlerde kısmi/tam iade yükümlülüğü doğabilir. Tekrarında platformdan çıkarma hakkı saklıdır.</span>
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Section 3 - Genel Hükümler */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <span className="text-green-200 text-sm font-medium">Bölüm 3</span>
                  <h2 className="text-xl font-bold">Genel Hükümler</h2>
                </div>
              </div>
            </div>
            <CardContent className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Destek Hattı */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Destek Hattı</p>
                      <p className="text-xs text-gray-500">7/24 Müşteri Desteği</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Phone className="w-4 h-4" />
                    <span>+90 532 307 32 64</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Pazartesi - Pazar: 09:00 - 22:00</p>
                </div>

                {/* E-posta Desteği */}
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">E-posta Desteği</p>
                      <p className="text-xs text-gray-500">24 saat içinde yanıt</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Mail className="w-4 h-4" />
                    <span>petfendyotel@gmail.com</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Detaylı sorularınız için e-posta gönderin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Önemli Not */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Önemli Not</h3>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Herhangi bir sorunuz veya şikayetiniz olduğunda, lütfen önce platform üzerinden ilgili otel ile iletişime geçin. 
                    Sorun çözülmezse, Petfendy müşteri hizmetleri devreye girerek size yardımcı olacaktır.
                  </p>
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
