"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Heart,
  MapPin,
  Clock,
  Shield,
  Users,
  Star,
  Phone,
  Mail,
  CheckCircle,
  PawPrint,
  Gamepad2,
} from "lucide-react"

export default function AnkaraPetKresPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                <MapPin className="w-5 h-5" />
                <span>Ankara Pet Kreş</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Ankara'nın #1 
                <span className="text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {" "}Pet Kreş{" "}
                </span>
                Hizmeti
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Ankara'da evcil hayvanlarınız için günlük pet kreş hizmeti. 
                Oyun, sosyalleşme ve profesyonel bakım ile evcil dostlarınız 
                gün boyu mutlu ve güvenli ortamda kalır.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Günlük Bakım</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Oyun ve Sosyalleşme</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Profesyonel Eğitmenler</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Güvenli Ortam</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/booking/daycare`)}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Pet Kreş Rezervasyonu
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-semibold rounded-2xl px-8 py-6 text-lg"
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
                  src="/images/slider-pets.jpg"
                  alt="Ankara Pet Kreş - Petfendy"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-200 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Kreş Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evcil dostlarınız için Ankara'nın en eğlenceli pet kreş hizmetleri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Günlük Bakım */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Günlük Pet Kreş</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Ankara'da evcil hayvanlarınız için günlük bakım hizmeti. 
                  Sabah bırakın, akşam mutlu dostunuzu alın.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Oyun ve Sosyalleşme */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Oyun ve Sosyalleşme</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Diğer dostlarla oyun oynama ve sosyalleşme imkanı. 
                  Ankara'da evcil hayvanlar için en eğlenceli ortam.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Profesyonel Eğitim */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Profesyonel Eğitmenler</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Uzman pet eğitmenlerimiz ile temel eğitim ve davranış 
                  geliştirme programları.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Daily Schedule */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Kreş Günlük Programı
            </h2>
            <p className="text-lg text-gray-600">
              Evcil dostlarınız için düzenli ve eğlenceli günlük program
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { time: '08:00-09:00', activity: 'Karşılama ve Kahvaltı', icon: '🌅' },
              { time: '09:00-11:00', activity: 'Oyun Zamanı', icon: '🎾' },
              { time: '11:00-12:00', activity: 'Dinlenme', icon: '😴' },
              { time: '12:00-13:00', activity: 'Öğle Yemeği', icon: '🍽️' },
              { time: '13:00-15:00', activity: 'Sosyalleşme', icon: '🐕' },
              { time: '15:00-16:00', activity: 'Eğitim Zamanı', icon: '🎓' },
              { time: '16:00-17:00', activity: 'Serbest Oyun', icon: '🎈' },
              { time: '17:00-18:00', activity: 'Veda Zamanı', icon: '👋' },
            ].map((schedule, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-3">{schedule.icon}</div>
                  <div className="font-bold text-purple-600 mb-2">{schedule.time}</div>
                  <div className="text-gray-700 text-sm">{schedule.activity}</div>
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
              Neden Ankara'da Petfendy Pet Kreş?
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın en güvenilir pet kreş hizmeti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Güvenlik */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Güvenli Pet Kreş</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 24/7 güvenlik kamerası ile korumalı pet kreş ortamı
              </p>
            </div>

            {/* Deneyim */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Uzman Ekip</h3>
              <p className="text-gray-600 text-sm">
                Pet bakımında uzman eğitmenler ve veteriner desteği
              </p>
            </div>

            {/* Eğlence */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Eğlenceli Aktiviteler</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da en eğlenceli pet kreş aktiviteleri ve oyunları
              </p>
            </div>

            {/* Sosyalleşme */}
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sosyalleşme</h3>
              <p className="text-gray-600 text-sm">
                Diğer dostlarla tanışma ve sosyalleşme imkanı
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white">
            <PawPrint className="w-16 h-16 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Kreş Rezervasyonu
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Evcil dostunuz için Ankara'nın en eğlenceli pet kreş rezervasyonu yapın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                onClick={() => router.push(`/${locale}/booking/daycare`)}
              >
                <Heart className="w-5 h-5 mr-2" />
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