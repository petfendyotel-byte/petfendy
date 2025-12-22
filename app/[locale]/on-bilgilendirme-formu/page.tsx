"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  Building2,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

export default function PreliminaryInfoPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  const definitions = [
    { term: "Aracı Hizmet Sağlayıcı", desc: "Petfendy Ltd. Şti., tüketici ile hizmet sağlayıcı arasında dijital aracılık platformu sunan şirkettir." },
    { term: "Hizmet Sağlayıcı (Satıcı)", desc: "Petfendy platformu üzerinden pet otel, pet taksi, veteriner, eğitmen vb. hizmetleri doğrudan sunan gerçek veya tüzel kişilerdir." },
    { term: "Tüketici (Alıcı)", desc: "Petfendy platformu üzerinden hizmet satın alan gerçek kişidir." },
    { term: "Hizmet", desc: "Petfendy aracılığıyla rezervasyonu yapılan konaklama, taşıma, bakım, eğitim, veterinerlik vb. hizmetlerdir." },
    { term: "Sözleşme", desc: "Tüketici ile hizmet sağlayıcı arasında kurulan mesafeli hizmet sözleşmesidir." },
    { term: "Rezervasyon Tarihi", desc: "Hizmetin ifa edileceği tarih." },
  ]

  const serviceFeatures = [
    "Alıcı, Petfendy platformu üzerinden pet otelleri, pet taksileri, veterinerler, eğitmenler ve benzeri hizmet sağlayıcılardan çeşitli hizmetleri seçerek satın alabilir.",
    "Petfendy yalnızca dijital aracılık platformudur. Satıcı sıfatı taşımaz ve hizmetin doğrudan ifasından sorumlu değildir.",
    "Hizmetin türü, kapsamı, fiyatı ve sağlayıcısına ilişkin detaylar, hizmet satın alma öncesinde platformda açıkça belirtilmektedir.",
    "Alıcı, satın aldığı hizmetin doğrudan ilgili hizmet sağlayıcı tarafından sunulacağını ve bu sağlayıcının kendi adına ifa ettiğini kabul eder. Petfendy yalnızca aracılık hizmeti sunar. Alıcı, bu hususu kabul, beyan ve taahhüt eder.",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
        
        <div className="absolute top-10 left-10 opacity-20">
          <FileText className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <CheckCircle className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            ÖN BİLGİLENDİRME FORMU
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl mx-auto">
            İşbu Ön Bilgilendirme Formu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, Petfendy platformu üzerinden sunulan hizmetler hakkında tüketicilerin bilgilendirilmesi amacıyla hazırlanmıştır.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 1. Tanımlar */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Tanımlar</h2>
                  <div className="space-y-3">
                    {definitions.map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-gray-600 text-sm">
                          <strong className="text-emerald-700">{item.term}:</strong> {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Hizmet Sağlayıcı Bilgileri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Hizmet Sağlayıcı ve Aracı Hizmet Sağlayıcı Bilgileri</h2>
                  <div className="bg-blue-50 rounded-xl p-5 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Unvan:</span>
                      <span className="col-span-2 font-medium text-gray-900">Petfendy Limited Şirketi</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">V.K.N:</span>
                      <span className="col-span-2 font-medium text-gray-900">-</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Adresi:</span>
                      <span className="col-span-2 font-medium text-gray-900">Bağlıca, Şehit Hikmet Özer Cd. No:101 Etimesgut/Ankara</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Telefon:</span>
                      <span className="col-span-2 font-medium text-gray-900">+90 532 307 32 64</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">E-mail:</span>
                      <span className="col-span-2 font-medium text-gray-900">petfendyotel@gmail.com</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm border-t pt-3">
                      <span className="text-gray-500">Hizmet Sağlayıcı:</span>
                      <span className="col-span-2 text-gray-600 italic">Hizmet sağlayıcı bilgileri tüketiciye rezervasyon ekranında ayrıca sunulur.</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Hizmetin Özellikleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Hizmetin Özellikleri</h2>
                  <div className="space-y-3">
                    {serviceFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                        <p className="text-gray-600 text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Toplam Bedel ve Ödeme */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Toplam Bedel ve Ödeme</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <CreditCard className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Hizmet bedelleri, ilgili hizmet sağlayıcısı tarafından belirlenmekte olup, Petfendy platformu üzerinde her bir hizmetin yanında açıkça gösterilmektedir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <CreditCard className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Toplam bedel, vergiler dâhil olarak belirtilir ve Alıcı tarafından online ödeme yöntemleri ile tahsil edilir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Alıcı, siparişi onayladığında ödeme yükümlülüğü altına girecektir. Alıcı, bu hususu kabul, beyan ve taahhüt eder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. İfa ve Teslimat */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">İfa ve Teslimat</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Truck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Hizmetin ifası, ilgili hizmet sağlayıcısı tarafından, Alıcı ile mutabık kalınan tarih ve yerde gerçekleştirilecektir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Truck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Petfendy, hizmetin zamanında ve uygun şekilde ifasını kolaylaştırmakla birlikte, doğrudan ifadan sorumlu değildir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Olağanüstü haller (hava muhalefeti, trafik, doğal afet vb.) nedeniyle gecikme olursa hizmet sağlayıcı tüketiciyi bilgilendirmekle yükümlüdür.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Cayma Hakkı */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Cayma Hakkı</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <RotateCcw className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Tüketici, hizmet alımını gerçekleştirdikten sonra, hizmetin ifasına henüz başlanmamışsa 14 gün içinde hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir.
                      </p>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
                      <p className="text-pink-700 text-sm font-medium">
                        ⚠️ Cayma hakkı hizmetin ifasına başlanmadan kullanılmalıdır. Aksi takdirde cayma hakkı kullanılamaz.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Cayma bildirimi yazılı olarak, e-posta (petfendyotel@gmail.com), çağrı merkezi (+90 532 307 32 64) veya posta yoluyla aracı hizmet sağlayıcıya iletilebilir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Ancak, Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca, hizmetin ifasına başlanmış veya hizmet tamamlanmışsa cayma hakkı kullanılamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Cayma Halinde İade */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  7
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Cayma Halinde İade</h2>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <RefreshCw className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm">
                      Cayma hakkının usulüne uygun olarak kullanılması halinde, tahsil edilen bedel, cayma bildiriminin alıcı tarafından iletilmesinden itibaren 14 gün içinde aynı ödeme yöntemi ile iade edilir.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Kişisel Verilerin Korunması */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  8
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Kişisel Verilerin Korunması</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Alıcı tarafından sağlanan kişisel veriler, yalnızca hizmetin ifası, destek süreçleri ve ilgili mevzuat uyarınca işlenmekte; gerekli olduğu takdirde üçüncü kişi hizmet sağlayıcılara aktarılmaktadır.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Detaylı bilgiye platformda yer alan KVKK Aydınlatma Metni'nden ulaşılabilir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Petfendy, aracı hizmet sağlayıcı sıfatıyla, mevzuatta düzenlenen ön bilgilendirme, cayma bildirim sistemi/teyidi, iade süreçleri ve işlemlere ilişkin kayıtların en az 3 yıl saklanması konularında kanundan doğan yükümlülükleri yerine getirir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Kişisel verilerinizin ne sebeple işleneceği, ne kadar süre ile saklanacağı vb. tüm sorularınızın cevaplarını Petfendy Müşteri Aydınlatma metninde bulabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Şikayet ve Uyuşmazlıklar */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  9
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Şikayet ve Uyuşmazlıklar</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Şikâyetler, Petfendy platformu üzerinden veya yukarıda belirtilen iletişim adreslerine yazılı olarak yapılabilir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        Uyuşmazlıkların çözümünde, Tüketici'nin yerleşim yerindeki veya hizmetin ifa edildiği yerdeki Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Onay */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold shrink-0">
                  10
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Onay</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-emerald-100 text-sm">
                        Alıcı, işbu Ön Bilgilendirme Formu'nu okuyup anladığını ve mesafeli satış sözleşmesinden önce bilgilendirildiğini kabul, beyan ve taahhüt eder.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-emerald-100 text-sm">
                        İşbu formun elektronik ortamda onaylandığına dair işlem kaydı Aracı hizmet sağlayıcı tarafından tutulur. Alıcı, onay vermeden siparişin tamamlanamayacağını kabul eder.
                      </p>
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
