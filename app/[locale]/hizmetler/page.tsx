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
  Car,
  Heart,
  Scissors,
  GraduationCap,
  MapPin,
  Clock,
  Shield,
  Star,
  Phone,
  Mail,
  CheckCircle,
  PawPrint,
  ArrowRight,
} from "lucide-react"

export default function HizmetlerPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations()

  const services = [
    {
      id: 'pet-otel',
      title: 'Pet Otel Ankara',
      description: 'Ankara\'da kedi ve köpekler için güvenli, konforlu pet otel konaklama hizmeti. 7/24 profesyonel bakım, kafessiz konaklama ve uzman veteriner desteği.',
      icon: HomeIcon,
      color: 'from-orange-500 to-pink-500',
      features: ['Kafessiz Konaklama', '7/24 Profesyonel Bakım', 'Veteriner Desteği', 'Güvenli Ortam'],
      link: '/booking/hotel',
      image: '/images/slider-hotel.jpg'
    },
    {
      id: 'pet-taksi',
      title: 'Pet Taksi Ankara',
      description: 'Ankara\'da evcil hayvanlarınız için güvenli, konforlu pet taksi hizmeti. Şehir içi ve şehirler arası pet taksi ile sevdiklerinizi güvenle taşıyoruz.',
      icon: Car,
      color: 'from-blue-500 to-purple-500',
      features: ['Güvenli Pet Taşıma', 'Deneyimli Şoförler', 'Temiz Araçlar', 'Şeffaf Fiyat'],
      link: '/booking/taxi',
      image: '/images/slider-taxi.jpg'
    },
    {
      id: 'pet-kres',
      title: 'Pet Kreş Ankara',
      description: 'Ankara\'da evcil hayvanlarınız için günlük pet kreş hizmeti. Oyun, sosyalleşme ve profesyonel bakım ile evcil dostlarınız gün boyu mutlu.',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      features: ['Günlük Bakım', 'Oyun ve Sosyalleşme', 'Profesyonel Eğitmenler', 'Güvenli Ortam'],
      link: '/booking/daycare',
      image: '/images/slider-pets.jpg'
    },
    {
      id: 'pet-kuafor',
      title: 'Pet Kuaför Ankara',
      description: 'Ankara\'da evcil hayvanlarınızın güzelliği ve sağlığı için profesyonel pet kuaför hizmetleri. Tıraş, bakım ve güzellik hizmetleri.',
      icon: Scissors,
      color: 'from-green-500 to-teal-500',
      features: ['Profesyonel Tıraş', 'Bakım Hizmetleri', 'Güzellik Uygulamaları', 'Hijyen Kontrolü'],
      link: '/iletisim',
      image: '/images/petfendy-services.png'
    },
    {
      id: 'kopek-egitimi',
      title: 'Köpek Eğitimi Ankara',
      description: 'Ankara\'da köpekler için profesyonel eğitim hizmetleri. Temel itaat eğitimi, ileri eğitim ve sosyalleştirme programları.',
      icon: GraduationCap,
      color: 'from-indigo-500 to-blue-500',
      features: ['Temel İtaat Eğitimi', 'İleri Seviye Eğitim', 'Sosyalleştirme', 'Davranış Düzeltme'],
      link: '/iletisim',
      image: '/images/petfendy-services.png'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold mb-4">
            <MapPin className="w-5 h-5" />
            <span>Ankara Pet Hizmetleri</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Ankara'nın En Kapsamlı
            <span className="text-gradient bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {" "}Pet Hizmetleri
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Petfendy olarak Ankara'da evcil hayvanlarınız için pet otel, pet kreş, 
            pet kuaför ve köpek eğitimi hizmetleri, 81 ilde pet taksi hizmetleri sunuyoruz. Tek çatı altında tüm pet hizmetleri.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">5+</div>
              <div className="text-gray-600 text-sm">Pet Hizmeti</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">7/24</div>
              <div className="text-gray-600 text-sm">Hizmet</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600 text-sm">Mutlu Müşteri</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">⭐ 4.9</div>
              <div className="text-gray-600 text-sm">Müşteri Puanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Hizmetlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evcil dostlarınız için Ankara'nın en kapsamlı ve güvenilir pet hizmetleri
            </p>
          </div>

          <div className="space-y-12">
            {services.map((service, index) => (
              <Card key={service.id} className="border-0 shadow-xl rounded-3xl overflow-hidden">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={`p-8 md:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{service.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.description}</p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      size="lg"
                      className={`bg-gradient-to-r ${service.color} hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-4 w-fit`}
                      onClick={() => router.push(`/${locale}${service.link}`)}
                    >
                      Rezervasyon Yap
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Image */}
                  <div className={`relative h-64 md:h-auto ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Neden Ankara'da Petfendy'yi Seçmelisiniz?
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın en güvenilir ve kapsamlı pet hizmet sağlayıcısı
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Güvenlik */}
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Güvenli Pet Hizmetleri</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 24/7 güvenlik kamerası ile korumalı pet hizmet ortamları
              </p>
            </div>

            {/* Deneyim */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">5 Yıldızlı Hizmet</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da 5 yıldızlı pet hizmet standardında kalite
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

            {/* 7/24 Hizmet */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">7/24 Pet Hizmet</h3>
              <p className="text-gray-600 text-sm">
                Ankara'da kesintisiz pet hizmet desteği
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Hizmet Alanlarımız
            </h2>
            <p className="text-lg text-gray-600">
              Ankara'nın tüm ilçelerine pet hizmet veriyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Etimesgut Pet Hizmetleri', 'Çankaya Pet Hizmetleri', 'Keçiören Pet Hizmetleri', 
              'Yenimahalle Pet Hizmetleri', 'Mamak Pet Hizmetleri', 'Sincan Pet Hizmetleri',
              'Gölbaşı Pet Hizmetleri', 'Pursaklar Pet Hizmetleri', 'Altındağ Pet Hizmetleri', 
              'Polatlı Pet Hizmetleri', 'Beypazarı Pet Hizmetleri', 'Ayaş Pet Hizmetleri'
            ].map((area) => (
              <div key={area} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{area}</h3>
                    <p className="text-gray-600 text-sm">Tüm pet hizmetleri mevcut</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white">
            <PawPrint className="w-16 h-16 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ankara Pet Hizmetleri Rezervasyonu
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Evcil dostunuz için Ankara'nın en kapsamlı pet hizmetleri rezervasyonu yapın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                onClick={() => router.push(`/${locale}/booking/hotel`)}
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Pet Otel Rezervasyonu
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-semibold rounded-2xl px-8 py-6 text-lg"
                onClick={() => router.push(`/${locale}/iletisim`)}
              >
                <Phone className="w-5 h-5 mr-2" />
                Bilgi Al
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-white/90">
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
      </section>

      <Footer locale={locale} />
    </div>
  )
}