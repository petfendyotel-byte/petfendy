"use client"

import { useState, useEffect } from "react"
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
  Building2,
  Shield,
  UserPlus,
  Calendar,
  CreditCard,
  Navigation,
  Bell,
  Headphones,
  Heart,
  MapPin,
  Clock,
  PawPrint,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { InstagramFeed } from "@/components/instagram-feed"

// Slider images - optimized with smaller sizes and quality
const sliderImages = [
  {
    src: "/images/slider-hotel.jpg",
    alt: "Petfendy Luxury Pet Hotel",
    title: "Lüks Pet Otel",
    subtitle: "Evcil dostlarınız için 5 yıldızlı konaklama"
  },
  {
    src: "/images/slider-taxi.jpg", 
    alt: "Petfendy Pet Taksi",
    title: "Pet Taksi",
    subtitle: "Konforlu & Güvenli Yolculuk"
  },
  {
    src: "/images/slider-pets.jpg",
    alt: "Pet Hotel & Taxi",
    title: "Petfendy",
    subtitle: "Evcil dostlarınız için en iyi hizmet"
  }
]

export default function HomePage() {
  const tHome = useTranslations('homepage')
  const tNew = useTranslations('homepage.newHome')
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar locale={locale} />

      {/* Hero Section with Slider */}
      <section className="relative h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden">
        {/* LCP Image - First slide rendered separately for priority */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src="/images/slider-hotel.jpg"
            alt="Petfendy Luxury Pet Hotel"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={60}
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Other Slider Images */}
        {sliderImages.slice(1).map((slide, index) => (
          <div
            key={index + 1}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index + 1 === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover"
              loading="lazy"
              sizes="100vw"
              quality={60}
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}

        {/* Slider Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          {/* Pet Icon Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <PawPrint className="w-20 h-20 md:w-24 md:h-24 text-white animate-bounce-slow" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl">
            <span className="text-gradient bg-gradient-to-r from-white via-yellow-200 to-pink-200 bg-clip-text text-transparent">
              {tNew('heroTitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 opacity-95 font-medium drop-shadow-lg">
            {tNew('heroSubtitle')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-50 gap-3 px-6 py-5 text-base rounded-2xl hover-scale shadow-2xl font-semibold"
              onClick={() => router.push(`/${locale}/booking/hotel`)}
            >
              <HomeIcon className="w-5 h-5" />
              {tNew('hotelButton')}
            </Button>
            <Button
              size="lg"
              className="gradient-orange-pink hover:opacity-90 gap-3 px-6 py-5 text-base rounded-2xl hover-scale shadow-2xl font-semibold text-white border-2 border-white/30"
              onClick={() => router.push(`/${locale}/booking/taxi`)}
            >
              <Car className="w-5 h-5" />
              {tNew('taxiButton')}
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 gap-3 px-6 py-5 text-base rounded-2xl hover-scale shadow-2xl font-semibold text-white border-2 border-white/30"
              onClick={() => router.push(`/${locale}/booking/daycare`)}
            >
              <Heart className="w-5 h-5" />
              {tNew('daycareButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section id="services" className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <PawPrint className="w-12 h-12 text-orange-500 animate-bounce-slow" />
              <Sparkles className="w-8 h-8 text-pink-500 -ml-4 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              {locale === 'en' ? 'Our Services' : 'Hizmetlerimiz'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {locale === 'en' ? 'We offer the best services for your pet friends' : 'Evcil dostlarınız için en iyi hizmetleri sunuyoruz'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pet Otel Card */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden group cursor-pointer bg-white flex flex-col h-full">
              <div className="gradient-orange-pink p-8 relative overflow-hidden flex-1 flex flex-col min-h-[280px]">
                {/* Decorative Pet Icons */}
                <PawPrint className="absolute top-4 right-4 w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                <PawPrint className="absolute bottom-4 left-4 w-16 h-16 text-white/15 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <HomeIcon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-3 font-bold drop-shadow-lg">
                    {tNew('petHotelTitle')}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base leading-relaxed flex-1">
                    {tNew('petHotelDesc')}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="p-6 bg-white mt-auto">
                <Button 
                  className="w-full gradient-orange-pink hover:opacity-90 text-white py-5 text-base rounded-xl font-semibold hover-scale shadow-lg"
                  onClick={() => router.push(`/${locale}/booking/hotel`)}
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  {tNew('hotelButton')}
                </Button>
              </CardContent>
            </Card>

            {/* Pet Taksi Card */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden group cursor-pointer bg-white flex flex-col h-full">
              <div className="gradient-warm p-8 relative overflow-hidden flex-1 flex flex-col min-h-[280px]">
                {/* Decorative Pet Icons */}
                <PawPrint className="absolute top-4 right-4 w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                <PawPrint className="absolute bottom-4 left-4 w-16 h-16 text-white/15 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-3 font-bold drop-shadow-lg">
                    {tNew('petTaxiTitle')}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base leading-relaxed flex-1">
                    {tNew('petTaxiDesc')}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="p-6 bg-white mt-auto">
                <Button 
                  className="w-full gradient-warm hover:opacity-90 text-white py-5 text-base rounded-xl font-semibold hover-scale shadow-lg"
                  onClick={() => router.push(`/${locale}/booking/taxi`)}
                >
                  <Car className="w-5 h-5 mr-2" />
                  {tNew('taxiButton')}
                </Button>
              </CardContent>
            </Card>

            {/* Pet Kreş Card */}
            <Card className="border-0 shadow-xl hover-scale rounded-3xl overflow-hidden group cursor-pointer bg-white flex flex-col h-full">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 relative overflow-hidden flex-1 flex flex-col min-h-[280px]">
                {/* Decorative Pet Icons */}
                <PawPrint className="absolute top-4 right-4 w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                <PawPrint className="absolute bottom-4 left-4 w-16 h-16 text-white/15 group-hover:scale-110 transition-transform duration-300" />
                
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white mb-3 font-bold drop-shadow-lg">
                    {tNew('petDaycareTitle')}
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base leading-relaxed flex-1">
                    {tNew('petDaycareDesc')}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="p-6 bg-white mt-auto">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-5 text-base rounded-xl font-semibold hover-scale shadow-lg"
                  onClick={() => router.push(`/${locale}/booking/daycare`)}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {tNew('daycareButton')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pet Otel Güvenliği */}
            <Card className="border-2 hover:border-orange-300 transition-colors h-full">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">{tNew('hotelSecurityTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {tNew('hotelSecurityDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Pet Taksi Güvenliği */}
            <Card className="border-2 hover:border-pink-300 transition-colors h-full">
              <CardHeader>
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl">{tNew('taxiSecurityTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {tNew('taxiSecurityDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Pet Kreş Güvenliği */}
            <Card className="border-2 hover:border-purple-300 transition-colors h-full">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">{tNew('daycareSecurityTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {tNew('daycareSecurityDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{tNew('howItWorksTitle')}</h2>
            <p className="text-gray-600 text-lg">{tNew('howItWorksSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('step1Title')}</h3>
                <p className="text-sm text-gray-600">
                  {tNew('step1Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('step2Title')}</h3>
                <p className="text-sm text-gray-600">
                  {tNew('step2Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('step3Title')}</h3>
                <p className="text-sm text-gray-600">
                  {tNew('step3Desc')}
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('step4Title')}</h3>
                <p className="text-sm text-gray-600">
                  {tNew('step4Desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Petfendy */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{tNew('whyPetfendyTitle')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature1')}</h3>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature2')}</h3>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature3')}</h3>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature4')}</h3>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature5')}</h3>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tNew('feature6')}</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <InstagramFeed 
        title={tNew('instagramTitle')} 
        buttonText={tNew('instagramButton')} 
      />

      {/* Safety Banner Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                {tNew('safetyBannerTitle')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {tNew('safetyBannerDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="gradient-warm hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/booking/hotel`)}
                >
                  {tNew('safetyBannerButton1')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold rounded-2xl px-8 py-6 text-lg"
                  onClick={() => router.push(`/${locale}/hakkimda`)}
                >
                  {tNew('safetyBannerButton2')}
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50">
                <img
                  src="/images/petfendy-services.png"
                  alt="Pet Otel, Pet Kreş ve Pet Taksi Hizmetleri"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-200 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
