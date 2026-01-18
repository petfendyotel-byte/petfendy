"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Car,
  MapPin,
  Clock,
  Shield,
  Navigation,
  Star,
  Phone,
  Mail,
  CheckCircle,
  PawPrint,
} from "lucide-react"

export default function AnkaraPetTaksiPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <MapPin className="w-5 h-5" />
                <span>Ankara Pet Taksi</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Ankara'nın #1 
                <span className="text-gradient bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {" "}Pet Taksi{" "}
                </span>
                Hizmeti
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Ankara'da evcil hayvanlarınız için güvenli, konforlu pet taksi hizmeti. 
                Şehir içi ve şehirler arası pet taksi ile sevdiklerinizi güvenle taşıyoruz. 
                Mesafe bazlı şeffaf fiyatlandırma.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Güvenli Pet Taşıma</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Deneyimli Şoförler</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Temiz Araçlar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Şeffaf Fiyat</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/booking/taxi`)}
                >
                  <Car className="w-5 h-5 mr-2" />
                  Pet Taksi Rezervasyonu
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/iletisim`)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Bilgi Al
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/slider-taxi.jpg"
                  alt="Ankara Pet Taksi - Petfendy"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Taksi Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evcil dostlarınız için Ankara'nın en güvenli pet taksi hizmetleri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Şehir İçi Pet Taksi */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Şehir İçi Pet Taksi</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Ankara içinde evcil hayvanlarınız için güvenli, konforlu pet taksi hizmeti. 
                  Tüm ilçelere hızlı ulaşım.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Şehirler Arası Pet Taksi */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Şehirler Arası Pet Taksi</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Ankara'dan diğer şehirlere güvenli pet taksi hizmeti. 
                  Uzun mesafe pet taşımacılığında uzmanız.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Acil Pet Taksi */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Acil Pet Taksi</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Acil durumlarda 7/24 pet taksi hizmeti. Veteriner kliniklerine 
                  hızlı ve güvenli ulaşım.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Taksi Hizmet Alanlarımız
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın tüm ilçelerine pet taksi hizmeti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Etimesgut', 'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan',
              'Gölbaşı', 'Pursaklar', 'Altındağ', 'Polatlı', 'Beypazarı', 'Ayaş'
            ].map((district) => (
              <div key={district} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{district}</h3>
                    <p className="text-gray-600 text-sm">Pet Taksi Hizmeti</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden Ankara'da Petfendy Pet Taksi?
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın en güvenilir pet taksi hizmeti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Güvenlik */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Güvenli Pet Taksi</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da özel pet taksi araçları ile güvenli taşımacılık
              </p>
            </div>

            {/* Deneyim */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Deneyimli Ekip</h3>
              <p className="text-gray-600 text-sm">
                Pet taşımacılığında uzman şoförler ve bakım ekibi
              </p>
            </div>

            {/* Hız */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Hızlı Hizmet</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 30 dakika içinde pet taksi hizmeti
              </p>
            </div>

            {/* Fiyat */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Şeffaf Fiyat</h3>
              <p className="text-gray-600 text-sm">
                Mesafe bazlı şeffaf pet taksi fiyatlandırması
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white">
            <PawPrint className="w-16 h-16 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Taksi Rezervasyonu
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Evcil dostunuz için Ankara'nın en güvenli pet taksi rezervasyonu yapın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                onClick={() => router.push(`/${locale}/booking/taxi`)}
              >
                <Car className="w-5 h-5 mr-2" />
                Hemen Rezervasyon Yap
              </Button>
              
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>+90 532 307 32 64</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>petfendyotel@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}