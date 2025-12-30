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

const content = {
  tr: {
    heroTitle: "Hakkımızda 🐾",
    heroText: "PetFendy olarak, evcil dostlarınıza en iyi hizmeti sunmak için 2020 yılından beri çalışıyoruz. Deneyimli ekibimiz ve modern tesislerimizle sevimli dostlarınızın güvenliği ve mutluluğu bizim önceliğimiz.",
    missionTitle: "Misyonumuz 🎯",
    missionText: "Evcil hayvanların ve sahiplerinin mutluluğunu en üst düzeye çıkarmak. Güvenli, hijyenik ve sevgi dolu bir ortamda profesyonel pet bakım hizmetleri sunarak, evcil dostlarınızın ikinci evi olmak.",
    visionTitle: "Vizyonumuz 🌟",
    visionText: "Türkiye'nin en güvenilir ve tercih edilen pet bakım ve ulaşım hizmetleri markası olmak. Yenilikçi çözümler ve kaliteli hizmet anlayışımızla sektörde öncü konumda yer almak.",
    teamTitle: "Uzman Ekibimiz 👥",
    teamSubtitle: "Veteriner hekimler, eğitmenler ve pet bakım uzmanlarından oluşan deneyimli ekibimiz",
    veterinarians: "Veteriner Hekimler",
    veterinariansDesc: "Uzman veteriner",
    trainers: "Eğitmenler",
    trainersDesc: "Profesyonel eğitmen",
    careSpecialists: "Bakım Uzmanları",
    careSpecialistsDesc: "Deneyimli bakıcı",
    drivers: "Şoförler",
    driversDesc: "Güvenli sürüş",
    valuesTitle: "Değerlerimiz 💎",
    valuesSubtitle: "Bizim için önemli olan şeyler",
    securityTitle: "Güvenlik 🛡️",
    securityText: "Evcil dostlarınızın güvenliği her şeyden önce gelir. 24/7 kamera sistemi ve güvenlik protokolleri.",
    loveTitle: "Sevgi ❤️",
    loveText: "Her bir evcil dostunuza kendi hayvanımız gibi sevgi ve özen gösteririz.",
    qualityTitle: "Kalite 🌟",
    qualityText: "En yüksek standartlarda hizmet sunarak müşteri memnuniyetini garanti ediyoruz.",
    happyCustomers: "Mutlu Müşteri",
    customerRating: "Müşteri Puanı",
    luxuryRooms: "Lüks Oda",
    vehicleFleet: "Araç Filomuz",
    ctaSubtitle: "Evcil Dostlarınız Bizimle Güvende!",
    ctaTitle: "Hemen rezervasyon yapın ve farkı yaşayın",
    hotelReservation: "Pet Otel Rezervasyonu",
    contactUs: "Bize Ulaşın"
  },
  en: {
    heroTitle: "About Us 🐾",
    heroText: "At PetFendy, we have been working to provide the best service to your pets since 2020. With our experienced team and modern facilities, the safety and happiness of your lovely friends is our priority.",
    missionTitle: "Our Mission 🎯",
    missionText: "To maximize the happiness of pets and their owners. To be the second home of your pets by providing professional pet care services in a safe, hygienic and loving environment.",
    visionTitle: "Our Vision 🌟",
    visionText: "To be Turkey's most trusted and preferred pet care and transportation services brand. To be a pioneer in the sector with our innovative solutions and quality service approach.",
    teamTitle: "Our Expert Team 👥",
    teamSubtitle: "Our experienced team consisting of veterinarians, trainers and pet care specialists",
    veterinarians: "Veterinarians",
    veterinariansDesc: "Expert veterinarian",
    trainers: "Trainers",
    trainersDesc: "Professional trainer",
    careSpecialists: "Care Specialists",
    careSpecialistsDesc: "Experienced caregiver",
    drivers: "Drivers",
    driversDesc: "Safe driving",
    valuesTitle: "Our Values 💎",
    valuesSubtitle: "Things that matter to us",
    securityTitle: "Security 🛡️",
    securityText: "The safety of your pets comes first. 24/7 camera system and security protocols.",
    loveTitle: "Love ❤️",
    loveText: "We show love and care to each of your pets as if they were our own.",
    qualityTitle: "Quality 🌟",
    qualityText: "We guarantee customer satisfaction by providing service at the highest standards.",
    happyCustomers: "Happy Customers",
    customerRating: "Customer Rating",
    luxuryRooms: "Luxury Rooms",
    vehicleFleet: "Vehicle Fleet",
    ctaSubtitle: "Your Pets Are Safe With Us!",
    ctaTitle: "Make a reservation now and experience the difference",
    hotelReservation: "Pet Hotel Reservation",
    contactUs: "Contact Us"
  }
}

export default function AboutPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section with Gradient */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600"></div>
        <div className="absolute top-10 left-10 opacity-20">
          <PawPrint className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <PawPrint className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.heroTitle}</h1>
          <p className="text-lg md:text-xl leading-relaxed opacity-95">{t.heroText}</p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 px-4 bg-orange-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">{t.missionTitle}</h3>
                <p className="text-gray-600 leading-relaxed">{t.missionText}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-4">{t.visionTitle}</h3>
                <p className="text-gray-600 leading-relaxed">{t.visionText}</p>
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
            <p className="text-orange-500 font-medium mb-2">{t.teamTitle}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.teamSubtitle}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">{t.veterinarians}</p>
              <p className="text-3xl font-bold text-orange-500 my-2">5+</p>
              <p className="text-sm text-gray-500">{t.veterinariansDesc}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">{t.trainers}</p>
              <p className="text-3xl font-bold text-orange-500 my-2">8+</p>
              <p className="text-sm text-gray-500">{t.trainersDesc}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                <PawPrint className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">{t.careSpecialists}</p>
              <p className="text-3xl font-bold text-orange-500 my-2">12+</p>
              <p className="text-sm text-gray-500">{t.careSpecialistsDesc}</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Car className="w-10 h-10 text-white" />
              </div>
              <p className="font-medium text-gray-700">{t.drivers}</p>
              <p className="text-3xl font-bold text-orange-500 my-2">6+</p>
              <p className="text-sm text-gray-500">{t.driversDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-500 font-medium mb-2">{t.valuesTitle}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.valuesSubtitle}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">{t.securityTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.securityText}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">{t.loveTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.loveText}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-3xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">{t.qualityTitle}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.qualityText}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl mb-2">🐾</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">5000+</p>
              <p className="text-white/80">{t.happyCustomers}</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">4.9/5</p>
              <p className="text-white/80">{t.customerRating}</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🏨</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">50+</p>
              <p className="text-white/80">{t.luxuryRooms}</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-4xl md:text-5xl font-bold mb-2">10+</p>
              <p className="text-white/80">{t.vehicleFleet}</p>
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
              <p className="text-lg font-medium mb-2">{t.ctaSubtitle}</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-8">{t.ctaTitle}</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-full px-8"
                  onClick={() => router.push(`/${locale}/booking/hotel`)}
                >
                  <Hotel className="w-5 h-5 mr-2" />
                  {t.hotelReservation}
                </Button>
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8"
                  onClick={() => window.open('https://wa.me/905323073264', '_blank')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t.contactUs}
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
