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
    
    businessModelTitle: "İş Modelimiz 🏢",
    businessModelSubtitle: "Doğrudan Hizmet Sağlayıcı - Aracısız Profesyonel Pet Bakım",
    businessModelIntro: "Petfendy, kendi bünyesinde pet otel, pet kreş ve pet taksi hizmetleri sunan doğrudan hizmet sağlayıcı bir işletmedir. Bir marketplace veya aracı platform değiliz.",
    
    businessModelPoints: [
      {
        title: "Kendi Tesislerimiz",
        desc: "Ankara'da bulunan kendi tesisimizde, modern ve hijyenik ortamda hizmet veriyoruz. Tüm odalar, oyun alanları ve bakım bölümleri Petfendy'ye aittir."
      },
      {
        title: "Kendi Personelimiz",
        desc: "Veteriner hekimler, eğitmenler, bakım uzmanları ve şoförler Petfendy bünyesinde çalışan profesyonel personellerimizdir. Üçüncü taraf hizmet sağlayıcı bulunmamaktadır."
      },
      {
        title: "Doğrudan Rezervasyon",
        desc: "Müşteriler, Petfendy'nin kendi hizmetleri için doğrudan rezervasyon yapar ve ödeme alır. Başka işletmelere aracılık yapmıyoruz."
      },
      {
        title: "Tek Hizmet Sağlayıcı",
        desc: "Tüm hizmetler (pet otel, pet kreş, pet taksi) Petfendy tarafından sunulmakta ve yönetilmektedir. Komisyon veya aracılık ücreti yoktur."
      }
    ],
    
    servicesOffered: {
      title: "Sunduğumuz Hizmetler",
      subtitle: "Kendi tesislerimizde, kendi personelimizle",
      services: [
        {
          name: "Pet Otel Hizmeti",
          desc: "Kendi tesisimizde bulunan 50+ lüks odada, evcil dostlarınız için konaklama hizmeti. Günlük bakım, oyun saatleri ve veteriner kontrolü dahil.",
          features: ["Kendi tesisimiz", "Kendi bakım personelimiz", "7/24 veteriner desteği"]
        },
        {
          name: "Pet Kreş Hizmeti",
          desc: "Gündüz bakım hizmeti ile evcil dostlarınız, kendi tesisimizde profesyonel eğitmenlerimiz eşliğinde güvenli ve eğlenceli vakit geçirir.",
          features: ["Kendi eğitim personelimiz", "Sosyalleşme programları", "Günlük aktivite raporları"]
        },
        {
          name: "Pet Taksi Hizmeti",
          desc: "Kendi araç filomuz ve profesyonel şoförlerimizle, evcil dostlarınızı güvenli bir şekilde istediğiniz yere ulaştırıyoruz.",
          features: ["Kendi araç filomuz", "Eğitimli şoförlerimiz", "Güvenli taşıma ekipmanları"]
        }
      ]
    },
    
    paymentModel: {
      title: "Ödeme Modeli",
      desc: "Müşteriler, Petfendy'nin kendi hizmetleri için doğrudan ödeme yapar. Tüm ödemeler Petfendy'ye aittir ve başka bir işletmeye aktarılmaz.",
      points: [
        "Rezervasyon ödemeleri doğrudan Petfendy'ye yapılır",
        "Hizmet bedeli, Petfendy'nin kendi hizmetleri içindir",
        "Komisyon veya aracılık ücreti yoktur",
        "İade ve iptal işlemleri Petfendy tarafından yönetilir"
      ]
    },
    
    legalStatus: {
      title: "Yasal Statü",
      desc: "Petfendy, Türkiye'de kayıtlı, vergi mükellefi bir işletmedir. Tüm yasal yükümlülüklerimizi yerine getirmekteyiz.",
      items: [
        "Ticari işletme olarak kayıtlı",
        "Vergi mükellefi",
        "KVKK uyumlu",
        "Mesafeli satış sözleşmesi mevcut",
        "İptal ve iade politikası açık"
      ]
    },
    
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
    
    businessModelTitle: "Our Business Model 🏢",
    businessModelSubtitle: "Direct Service Provider - Professional Pet Care Without Intermediaries",
    businessModelIntro: "Petfendy is a direct service provider offering pet hotel, pet daycare, and pet taxi services at its own facilities. We are not a marketplace or intermediary platform.",
    
    businessModelPoints: [
      {
        title: "Our Own Facilities",
        desc: "We provide services in our own modern and hygienic facility located in Ankara. All rooms, play areas, and care sections belong to Petfendy."
      },
      {
        title: "Our Own Staff",
        desc: "Veterinarians, trainers, care specialists, and drivers are professional staff working within Petfendy. There are no third-party service providers."
      },
      {
        title: "Direct Reservations",
        desc: "Customers make reservations directly for Petfendy's own services and make payments. We do not act as intermediaries for other businesses."
      },
      {
        title: "Single Service Provider",
        desc: "All services (pet hotel, pet daycare, pet taxi) are provided and managed by Petfendy. There are no commission or intermediary fees."
      }
    ],
    
    servicesOffered: {
      title: "Services We Offer",
      subtitle: "At our own facilities, with our own staff",
      services: [
        {
          name: "Pet Hotel Service",
          desc: "Accommodation service for your pets in 50+ luxury rooms at our own facility. Includes daily care, playtime, and veterinary check-ups.",
          features: ["Our own facility", "Our own care staff", "24/7 veterinary support"]
        },
        {
          name: "Pet Daycare Service",
          desc: "With daycare service, your pets spend safe and fun time with our professional trainers at our own facility.",
          features: ["Our own training staff", "Socialization programs", "Daily activity reports"]
        },
        {
          name: "Pet Taxi Service",
          desc: "We safely transport your pets to your desired location with our own vehicle fleet and professional drivers.",
          features: ["Our own vehicle fleet", "Trained drivers", "Safe transport equipment"]
        }
      ]
    },
    
    paymentModel: {
      title: "Payment Model",
      desc: "Customers pay directly for Petfendy's own services. All payments belong to Petfendy and are not transferred to another business.",
      points: [
        "Reservation payments are made directly to Petfendy",
        "Service fee is for Petfendy's own services",
        "No commission or intermediary fees",
        "Refunds and cancellations are managed by Petfendy"
      ]
    },
    
    legalStatus: {
      title: "Legal Status",
      desc: "Petfendy is a registered, taxpaying business in Turkey. We fulfill all our legal obligations.",
      items: [
        "Registered as a commercial business",
        "Taxpayer",
        "KVKK compliant",
        "Distance sales contract available",
        "Clear cancellation and refund policy"
      ]
    },
    
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

      {/* Business Model Section - NEW */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.businessModelTitle}</h2>
            <p className="text-xl text-blue-600 font-semibold mb-4">{t.businessModelSubtitle}</p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">{t.businessModelIntro}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {t.businessModelPoints.map((point: any, index: number) => (
              <Card key={index} className="border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{point.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{point.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services Offered */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.servicesOffered.title}</h3>
              <p className="text-gray-600">{t.servicesOffered.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {t.servicesOffered.services.map((service: any, index: number) => (
                <Card key={index} className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">{service.name}</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.desc}</p>
                    <div className="space-y-2">
                      {service.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Model */}
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.paymentModel.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{t.paymentModel.desc}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {t.paymentModel.points.map((point: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legal Status */}
          <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.legalStatus.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{t.legalStatus.desc}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {t.legalStatus.items.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
