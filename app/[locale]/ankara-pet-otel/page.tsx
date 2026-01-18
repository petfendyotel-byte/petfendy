"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Home as HomeIcon,
  MapPin,
  Clock,
  Shield,
  Heart,
  Star,
  Phone,
  Mail,
  CheckCircle,
  PawPrint,
} from "lucide-react"

export default function AnkaraPetOtelPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-orange-600 font-semibold">
                <MapPin className="w-5 h-5" />
                <span>Ankara Pet Otel</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Ankara'nın #1 
                <span className="text-gradient bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  {" "}Pet Otel{" "}
                </span>
                Hizmeti
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Ankara'da kedi ve köpekler için güvenli, konforlu pet otel konaklama hizmeti. 
                7/24 profesyonel bakım, kafessiz konaklama ve uzman veteriner desteği ile 
                evcil dostlarınız güvende.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">7/24 Profesyonel Bakım</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Kafessiz Konaklama</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Veteriner Desteği</span>
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
                  className="gradient-orange-pink hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/booking/hotel`)}
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Pet Otel Rezervasyonu
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-semibold rounded-2xl px-8 py-6 text-lg"
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
                  src="/images/slider-hotel.jpg"
                  alt="Ankara Pet Otel - Petfendy"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-200 rounded-full opacity-50 blur-xl"></div>
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
              Ankara Pet Otel Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evcil dostlarınız için Ankara'nın en kapsamlı pet otel hizmetleri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pet Otel Konaklama */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <HomeIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Pet Otel Konaklama</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Ankara'da kedi ve köpekler için konforlu, güvenli pet otel odaları. 
                  Kafessiz konaklama ile evcil dostlarınız rahat eder.
                </CardDescription>
              </CardContent>
            </Card>

            {/* 7/24 Bakım */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">7/24 Profesyonel Bakım</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Uzman pet bakım ekibimiz 24 saat evcil dostlarınızla ilgilenir. 
                  Ankara'da güvenilir pet otel bakım hizmeti.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Veteriner Desteği */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-8">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Veteriner Desteği</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Acil durumlarda veteriner desteği ile evcil dostlarınızın sağlığı 
                  Ankara pet otelimizde güvence altında.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden Ankara'da Petfendy Pet Otel?
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın en güvenilir pet otel hizmeti
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Güvenlik */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Güvenli Pet Otel</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 24/7 güvenlik kamerası ile korumalı pet otel ortamı
              </p>
            </div>

            {/* Deneyim */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">5 Yıldızlı Hizmet</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 5 yıldızlı pet otel standardında hizmet kalitesi
              </p>
            </div>

            {/* Lokasyon */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Merkezi Konum</h3>
              <p className="text-gray-600 text-sm">
                Etimesgut merkezli, Ankara'nın tüm ilçelerine kolay ulaşım
              </p>
            </div>

            {/* Sevgi */}
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sevgi Dolu Bakım</h3>
              <p className="text-gray-600 text-sm">
                Ankara pet otelinde evcil dostlarınıza sevgi dolu yaklaşım
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white">
            <PawPrint className="w-16 h-16 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Otel Rezervasyonu
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Evcil dostunuz için Ankara'nın en güvenli pet otel rezervasyonu yapın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                onClick={() => router.push(`/${locale}/booking/hotel`)}
              >
                <HomeIcon className="w-5 h-5 mr-2" />
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