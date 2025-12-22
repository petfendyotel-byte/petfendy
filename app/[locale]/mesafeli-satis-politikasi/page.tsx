"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  Users,
  BookOpen,
  Target,
  CreditCard,
  RotateCcw,
  Building2,
  UserCheck,
  Clock,
  Scale,
  CheckCircle,
  MapPin
} from "lucide-react"

export default function DistanceSalesPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  const definitions = [
    { term: "Bakanlık", desc: "Ticaret Bakanlığı" },
    { term: "Kanun", desc: "6502 sayılı Tüketicinin Korunması Hakkında Kanun" },
    { term: "Yönetmelik", desc: "Mesafeli Sözleşmeler Yönetmeliği" },
    { term: "Satıcı", desc: "Petfendy Limited Şirketi, platform aracılığıyla pet sahipleri ve hizmet sağlayıcıları (pet hoteli, pet taksi, veterinerler, eğitmenler) arasında aracılık hizmeti sunmaktadır." },
    { term: "Alıcı", desc: "Satıcı'nın platformu üzerinden hizmet talep eden ve bu hizmetlerin bedelini ödeyen tüketici." },
    { term: "Hizmet Sağlayıcılar", desc: "Platformda listelenen pet hotelleri, veterinerler, eğitmenler ve diğer hizmet sağlayıcılar." },
    { term: "Platform", desc: "Satıcı tarafından işletilen ve Alıcıların hizmet sağlayıcılarından hizmet satın almasını sağlayan dijital platform." },
    { term: "Hizmet ya da ürün", desc: "Platformda listelenen hizmet sağlayıcılarının, pet sahibine sağladığı; pet için barınma, bakım, beslenme, pet aksesuarları, pet teknolojileri, mama gibi olanaklar ve ürünler." },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
        
        <div className="absolute top-10 left-10 opacity-20">
          <FileText className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Scale className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            MESAFELİ SATIŞ SÖZLEŞMESİ
          </h1>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Madde 1 - Taraflar */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Madde 1 - Taraflar</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    İşbu sözleşme, bir tarafta merkezi Ankara adresinde bulunan <strong>Petfendy Limited Şirketi</strong> (bundan sonra "Satıcı" olarak anılacaktır) ile diğer tarafta, Satıcı'nın hizmetlerini platform üzerinden satın alan tüketici ("Alıcı") arasında, aşağıda belirtilen hüküm ve şartlar çerçevesinde akdedilmiştir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 2 - Tanımlar */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 2 - Tanımlar</h2>
                  <div className="space-y-3">
                    {definitions.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold text-purple-600 shrink-0">2.{index + 1}.</span>
                        <p className="text-gray-600 text-sm">
                          <strong>{item.term}:</strong> {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 3 - Konu */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Madde 3 - Konu</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    İşbu sözleşme, Alıcı'nın Satıcı'ya ait platform üzerinden hizmet sağlayıcılardan satın alabileceği hizmetlere ilişkin tarafların hak ve yükümlülüklerini düzenler. Satıcı, sadece aracılık hizmeti sunmakta olup, hizmet sağlayıcıların sunduğu hizmetlerden doğabilecek sorunlardan doğrudan sorumlu değildir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 4 - Hizmetin Özellikleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 4 - Sözleşme Konusu Hizmetin Özellikleri ve Bedeli</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-green-600 shrink-0">4.1.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, platform üzerinden seçmiş olduğu hizmetin detayları, fiyatı, koşulları ve hizmet sağlayıcısına ilişkin bilgileri satın alma işleminden önce incelemekle yükümlüdür.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-green-600 shrink-0">4.2.</span>
                      <p className="text-gray-600 text-sm">
                        Satıcı, Alıcı'nın seçtiği hizmete ilişkin detayları platformda açık bir şekilde sunacaktır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 5 - Ödeme ve İade */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 5 - Ödeme ve İade Koşulları</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-orange-600 shrink-0">5.1.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, platformda belirtilen hizmet bedelini online ödeme yöntemleriyle gerçekleştirecektir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-orange-600 shrink-0">5.2.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı'nın cayma hakkını kullanması durumunda, ödeme iade süreci 14 iş günü içinde tamamlanacaktır.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-orange-600 shrink-0">5.3.</span>
                      <p className="text-gray-600 text-sm">
                        Hizmetin sağlayıcı tarafından ifa edilmemesi durumunda, iade süreci Satıcı'nın değerlendirmesi sonrasında yürütülecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 6 - Cayma Hakkı */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 6 - Cayma Hakkı</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-cyan-600 shrink-0">6.1.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, hizmet alımını gerçekleştirdikten sonra 14 gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir. Ancak açılmakla bozulan ürünlerin geçerli bir nedeni olmaksızın iadesi mümkün değildir (mama vs.).
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-cyan-600 shrink-0">6.2.</span>
                      <p className="text-gray-600 text-sm">
                        Cayma hakkının kullanılması durumunda, cayma bildirimi Satıcı'ya yazılı olarak veya platformdaki ilgili bölümden yapılabilir.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-cyan-600 shrink-0">6.3.</span>
                      <p className="text-gray-600 text-sm">
                        Cayma hakkının kullanılması halinde, hizmet bedeli Alıcı'ya aynı ödeme yöntemi ile iade edilecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 7 - Satıcı'nın Yükümlülükleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  7
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 7 - Satıcı'nın Yükümlülükleri</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-pink-600 shrink-0">7.1.</span>
                      <p className="text-gray-600 text-sm">
                        Satıcı, platformda yer alan, hizmet sağlayıcılarından aldıkları bilgilerin; doğru, eksiksiz ve güncel olmasını sağlamakla yükümlüdür.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-pink-600 shrink-0">7.2.</span>
                      <p className="text-gray-600 text-sm">
                        Satıcı, hizmet sağlayıcılar ile Alıcılar arasında aracılık yapmaktadır. Ancak hizmet sağlayıcıların sunduğu hizmetlerden kaynaklanan sorunlardan sorumluluk kabul etmez.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 8 - Alıcı'nın Yükümlülükleri */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  8
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 8 - Alıcı'nın Yükümlülükleri</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-teal-600 shrink-0">8.1.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, platform üzerinden seçtiği hizmete ilişkin tüm bilgileri dikkatle incelemekle yükümlüdür.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-teal-600 shrink-0">8.2.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, hizmet sağlayıcıdan aldığı hizmet sırasında oluşabilecek sorunlarda, hizmet sağlayıcı ile iletişime geçebileceği gibi Satıcı ile de iletişime geçebilecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 9 - Sözleşmenin Süresi */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  9
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Madde 9 - Sözleşmenin Süresi ve Feshi</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    İşbu sözleşme, Alıcı'nın platform üzerinden hizmet satın alması ile yürürlüğe girer. Taraflar, karşılıklı mutabakat ile sözleşmeyi feshedebilir. İptal ve iade durumunda ise taraflar, Platformda yer alan İptal ve İade Koşullarına bağlıdır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 10 - Uyuşmazlıkların Çözümü */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  10
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Madde 10 - Uyuşmazlıkların Çözümü</h2>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-red-600 shrink-0">10.1.</span>
                    <p className="text-gray-600 text-sm">
                      İşbu sözleşmeden doğabilecek uyuşmazlıkların çözümünde, Ankara Tüketici Hakem Heyetleri ve Ankara Tüketici Mahkemeleri yetkilidir.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Madde 11 - Yürürlük */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                  11
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Madde 11 - Yürürlük</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-violet-600 shrink-0">11.1.</span>
                      <p className="text-gray-600 text-sm">
                        Alıcı, platform üzerinden hizmet satın alırken işbu sözleşmenin tüm koşullarını okuduğunu, anladığını ve kabul ettiğini beyan eder.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-violet-600 shrink-0">11.2.</span>
                      <p className="text-gray-600 text-sm">
                        Sözleşme, Alıcı tarafından elektronik ortamda onaylandığı ve hizmet bedeli ödendiği anda yürürlüğe girer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taraflar */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6 text-white">Taraflar</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-6 h-6" />
                    <p className="font-bold">Satıcı</p>
                  </div>
                  <p className="text-sm text-indigo-100 font-medium mb-2">Petfendy Limited Şirketi</p>
                  <div className="flex items-start gap-2 text-sm text-indigo-200">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Bağlıca, Şehit Hikmet Özer Cd. No:101 Etimesgut/Ankara</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-6 h-6" />
                    <p className="font-bold">Alıcı</p>
                  </div>
                  <p className="text-sm text-indigo-200">[Ad-Soyad / Ticari Unvan]</p>
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
