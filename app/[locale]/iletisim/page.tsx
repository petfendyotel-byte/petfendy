"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  Building2,
  Send
} from "lucide-react"

export default function ContactPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        <div className="absolute top-10 left-10 opacity-20">
          <MessageCircle className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Send className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Phone className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">İLETİŞİM</h1>
          <p className="text-blue-100 text-sm max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Phone */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Telefon</h3>
                    <p className="text-gray-500 text-sm mb-2">7/24 Destek Hattı</p>
                    <a href="tel:+905323073264" className="text-lg font-semibold text-green-600 hover:text-green-700">
                      +90 532 307 32 64
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">E-posta</h3>
                    <p className="text-gray-500 text-sm mb-2">24 saat içinde yanıt</p>
                    <a href="mailto:petfendyotel@gmail.com" className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                      petfendyotel@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <MessageCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-500 text-sm mb-2">Hızlı iletişim</p>
                    <a 
                      href="https://wa.me/905323073264" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      +90 532 307 32 64
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-7 h-7 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Çalışma Saatleri</h3>
                    <p className="text-gray-500 text-sm mb-2">Müşteri Hizmetleri</p>
                    <p className="text-gray-700">
                      <span className="font-medium">Pazartesi - Pazar:</span> 09:00 - 22:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Info */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl mb-4">Şirket Bilgileri</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Şirket Unvanı</p>
                      <p className="font-medium text-gray-900">Petfendy Limited Şirketi</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Vergi Dairesi</p>
                      <p className="font-medium text-gray-900">Etimesgut Vergi Dairesi</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Adres</p>
                        <p className="font-medium text-gray-900">
                          Bağlıca, Şehit Hikmet Özer Cd. No:101<br />
                          Etimesgut / Ankara, Türkiye
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mt-8">
            <CardContent className="p-0">
              <div className="bg-gray-200 h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Harita yakında eklenecek</p>
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
