"use client"

import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Star, 
  Shield, 
  Phone,
  Hotel,
  Car,
  Users,
  PawPrint,
  Stethoscope,
  GraduationCap
} from "lucide-react"

export default function AboutPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section with Gradient */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600"></div>
        
        {/* Decorative Paw Prints */}
        <div className="absolute top-10 left-10 opacity-20">
          <PawPrint className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <PawPrint className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hakkımızda 🐾
          </h1>
          <p className="text-lg md:text-xl leading-relaxed opacity-95">
            PetFendy olarak, evcil dostlarınıza en iyi hizmeti sunmak için 2020 
            yılından beri çalışıyoruz. Deneyimli ekibimiz ve modern tesislerimizle 
            sevimli dostlarınızın güvenliği ve mutluluğu bizim önceliğimiz.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 px-4 bg-orange-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">Misyonumuz 🎯</h3>
                <p className="text-gray-600 leading-relaxed">
                  Evcil hayvanların ve sahiplerinin mutluluğunu en üst düzeye çıkarmak. 
                  Güvenli, hijyenik ve sevgi dolu bir ortamda profesyonel pet bakım 
                  hizmetleri sunarak, evcil dostlarınızın ikinci evi olmak.
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">Vizyonumuz 🌟</h3>
                <p className="text-gray-600 leading-relaxed">
                  Türkiye'nin en güvenilir ve tercih edilen pet bakım ve ulaşım hizmetleri 
                  markası olmak. Yenilikçi çözümler ve kaliteli hizmet anlayışımızla sektörde 
                  öncü konumda yer almak.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expert Team Section */}
      <section className="py-16 px-4 bg-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-orange-500 font-medium mb-2">Uzman Ekibimiz 👥</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Veteriner hekimler, eğitmenler ve pet bakım uzmanlarından<br />
              oluşan deneyimli ekibimiz
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Veteriner */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">Veteriner Hekimler</p>
              <p className="text-3xl font-bold text-orange-500 my-2">5+</p>
              <p className="text-sm text-gray-500">Uzman veteriner</p>
            </div>

            {/* Eğitmenler */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">Eğitmenler</p>
              <p className="text-3xl font-bold text-orange-500 my-2">8+</p>
              <p className="text-sm text-gray-500">Profesyonel eğitmen</p>
            </div>

            {/* Bakım Uzmanları */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                <PawPrint className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">Bakım Uzmanları</p>
              <p className="text-3xl font-bold text-orange-500 my-2">12+</p>
              <p className="text-sm text-gray-500">Deneyimli bakıcı</p>
            </div>

            {/* Şoförler */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Car className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">Şoförler</p>
              <p className="text-3xl font-bold text-orange-500 my-2">6+</p>
              <p className="text-sm text-gray-500">Güvenli sürüş</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-500 font-medium mb-2">Değerlerimiz 💎</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Bizim için önemli olan şeyler
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Güvenlik */}
            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">Güvenlik 🛡️</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Evcil dostlarınızın güvenliği her şeyden önce gelir. 
                  24/7 kamera sistemi ve güvenlik protokolleri.
                </p>
              </CardContent>
            </Card>

            {/* Sevgi */}
            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">Sevgi ❤️</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Her bir evcil dostunuza kendi hayvanımız gibi 
                  sevgi ve özen gösteririz.
                </p>
              </CardContent>
            </Card>

            {/* Kalite */}
            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">Kalite 🌟</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  En yüksek standartlarda hizmet sunarak 
                  müşteri memnuniyetini garanti ediyoruz.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {/* Mutlu Müşteri */}
            <div>
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">5000+</p>
              <p className="text-white/80">Mutlu Müşteri</p>
            </div>

            {/* Müşteri Puanı */}
            <div>
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">4.9/5</p>
              <p className="text-white/80">Müşteri Puanı</p>
            </div>

            {/* Lüks Oda */}
            <div>
              <div className="text-4xl mb-2">🏨</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">50+</p>
              <p className="text-white/80">Lüks Oda</p>
            </div>

            {/* Araç Filomuz */}
            <div>
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">10+</p>
              <p className="text-white/80">Araç Filomuz</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500">
            <CardContent className="p-10 text-center text-white">
              <div className="flex justify-center gap-2 mb-4">
                <span className="text-4xl">🐕</span>
                <span className="text-4xl">🐈</span>
              </div>
              <p className="text-lg font-medium mb-2">Evcil Dostlarınız Bizimle Güvende!</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-8">
                Hemen rezervasyon yapın ve farkı yaşayın
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-full px-8"
                  onClick={() => router.push(`/${locale}/booking/hotel`)}
                >
                  <Hotel className="w-5 h-5 mr-2" />
                  Pet Otel Rezervasyonu
                </Button>
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8"
                  onClick={() => window.open('https://wa.me/905551234567', '_blank')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Bize Ulaşın
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
