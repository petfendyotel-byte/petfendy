"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, Shield, Settings, Eye, BarChart3, Target, CheckCircle, AlertCircle, Mail, Phone } from "lucide-react"

export default function CookiePolicyPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  const cookieTypes = [
    { title: "Zorunlu Çerezler", desc: "Web sitesinin temel işlevlerini yerine getirmesi için gerekli olan çerezlerdir." },
    { title: "Analitik Çerezler", desc: "Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur." },
    { title: "İşlevsel Çerezler", desc: "Dil tercihi, tema seçimi gibi kişiselleştirme ayarlarınızı hatırlamamızı sağlar." },
    { title: "Pazarlama Çerezleri", desc: "Size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır." },
  ]

  const cookieList = [
    { name: "session_id", purpose: "Oturum yönetimi", duration: "Oturum süresi", type: "Zorunlu" },
    { name: "locale", purpose: "Dil tercihi", duration: "1 yıl", type: "İşlevsel" },
    { name: "theme", purpose: "Tema tercihi", duration: "1 yıl", type: "İşlevsel" },
    { name: "_ga", purpose: "Google Analytics", duration: "2 yıl", type: "Analitik" },
    { name: "_gid", purpose: "Google Analytics - Oturum", duration: "24 saat", type: "Analitik" },
    { name: "cookie_consent", purpose: "Çerez onay durumu", duration: "1 yıl", type: "Zorunlu" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <Cookie className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Cookie className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">ÇEREZ POLİTİKASI</h1>
          <p className="text-amber-100 text-sm max-w-2xl mx-auto">
            Petfendy olarak, web sitemizde çerezler kullanmaktayız.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Çerez Nedir?</h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Çerezler, web sitelerinin cihazınıza yerleştirdiği küçük metin dosyalarıdır.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">2</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Kullandığımız Çerez Türleri</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cookieTypes.map((cookie, index) => (
                      <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3 text-gray-600">
                          <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{cookie.title}</h3>
                        <p className="text-gray-600 text-sm">{cookie.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">3</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Kullanılan Çerezler</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 rounded-tl-lg">Çerez Adı</th>
                          <th className="text-left p-3">Amacı</th>
                          <th className="text-left p-3">Süre</th>
                          <th className="text-left p-3 rounded-tr-lg">Tür</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookieList.map((cookie, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3 font-mono text-xs text-amber-700">{cookie.name}</td>
                            <td className="p-3 text-gray-600">{cookie.purpose}</td>
                            <td className="p-3 text-gray-500">{cookie.duration}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                cookie.type === 'Zorunlu' ? 'bg-blue-100 text-blue-700' :
                                cookie.type === 'İşlevsel' ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {cookie.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">4</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">Çerezleri Nasıl Yönetebilirsiniz?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Settings className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        <strong>Tarayıcı Ayarları:</strong> Çoğu web tarayıcısı, çerezleri kabul etme, reddetme veya silme seçenekleri sunar.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Eye className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-gray-600 text-sm">
                        <strong>Çerez Onay Aracı:</strong> Sitemizi ilk ziyaretinizde gösterilen çerez onay penceresinden tercihlerinizi belirleyebilirsiniz.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-amber-700 text-sm">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        <strong>Uyarı:</strong> Zorunlu çerezleri devre dışı bırakmanız durumunda, web sitesinin bazı özellikleri düzgün çalışmayabilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">5</div>
                <div>
                  <h2 className="text-xl font-bold mb-3">Üçüncü Taraf Çerezleri</h2>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span><strong>Google Analytics:</strong> Site trafiği ve kullanıcı davranışı analizi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span><strong>Google Ads:</strong> Reklam performansı ölçümü</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold shrink-0">6</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">İletişim</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Mail className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-amber-200">E-posta</p>
                        <p className="font-medium text-sm">petfendyotel@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <Phone className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-amber-200">Telefon</p>
                        <p className="font-medium text-sm">+90 532 307 32 64</p>
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
