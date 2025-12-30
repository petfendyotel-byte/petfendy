"use client"

import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Car, Scissors, GraduationCap, ChevronRight } from "lucide-react"

export default function ServicesPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations('services')

  const services = [
    {
      id: 1,
      titleKey: "service1.title",
      descriptionKey: "service1.description",
      icon: Home,
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      id: 2,
      titleKey: "service2.title",
      descriptionKey: "service2.description",
      icon: Car,
      color: "from-orange-500 to-orange-700",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      id: 3,
      titleKey: "service3.title",
      descriptionKey: "service3.description",
      icon: Scissors,
      color: "from-pink-500 to-pink-700",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      id: 4,
      titleKey: "service4.title",
      descriptionKey: "service4.description",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg md:text-xl opacity-90">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                  <div className={`bg-gradient-to-br ${service.color} p-8`}>
                    <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white mb-3">
                      {t(service.titleKey)}
                    </CardTitle>
                    <p className="text-white/90">
                      {t(service.descriptionKey)}
                    </p>
                  </div>
                  <CardContent className="p-6">
                    <Button 
                      variant="outline"
                      className="w-full group-hover:bg-gray-900 group-hover:text-white transition-colors"
                      onClick={() => router.push(`/${locale}`)}
                    >
                      {t('detailsButton')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

