"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock, MessageCircle, Building2, Send, Instagram } from "lucide-react"

const content = {
  tr: {
    title: "İLETİŞİM",
    subtitle: "Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.",
    contactInfo: "İletişim Bilgileri",
    phone: "Telefon",
    phoneDesc: "7/24 Destek Hattı",
    email: "E-posta",
    emailDesc: "24 saat içinde yanıt",
    address: "Adres",
    addressValue: "Bağlıca, Şehit Hikmet Özer Cd. No:101\nEtimesgut/Ankara",
    workingHours: "Çalışma Saatleri",
    workingHoursValue: "Pazartesi - Pazar\n09:00 - 22:00",
    socialMedia: "Sosyal Medya",
    followUs: "Bizi takip edin",
    companyInfo: "Şirket Bilgileri",
    companyName: "BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ",
    taxOffice: "Vergi Dairesi",
    taxNumber: "Vergi No",
    mapTitle: "Konum"
  },
  en: {
    title: "CONTACT",
    subtitle: "You can contact us for your questions, suggestions or support requests.",
    contactInfo: "Contact Information",
    phone: "Phone",
    phoneDesc: "24/7 Support Line",
    email: "Email",
    emailDesc: "Response within 24 hours",
    address: "Address",
    addressValue: "Bağlıca, Şehit Hikmet Özer St. No:101\nEtimesgut/Ankara, Turkey",
    workingHours: "Working Hours",
    workingHoursValue: "Monday - Sunday\n09:00 - 22:00",
    socialMedia: "Social Media",
    followUs: "Follow us",
    companyInfo: "Company Information",
    companyName: "BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY",
    taxOffice: "Tax Office",
    taxNumber: "Tax Number",
    mapTitle: "Location"
  }
}

export default function ContactPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute top-10 left-10 opacity-20"><MessageCircle className="w-24 h-24 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><Send className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Phone className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-blue-100 text-sm max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t.contactInfo}</h2>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Phone */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.phone}</h3>
                    <p className="text-xs text-gray-500 mb-2">{t.phoneDesc}</p>
                    <a href="tel:+905323073264" className="text-blue-600 font-medium hover:underline">
                      +90 532 307 32 64
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.email}</h3>
                    <p className="text-xs text-gray-500 mb-2">{t.emailDesc}</p>
                    <a href="mailto:petfendyotel@gmail.com" className="text-green-600 font-medium hover:underline">
                      petfendyotel@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.address}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line mt-2">{t.addressValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.workingHours}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line mt-2">{t.workingHoursValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media & Company Info */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Social Media */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">{t.socialMedia}</h3>
                <p className="text-gray-500 text-sm mb-4">{t.followUs}</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/petfendy/" target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{t.companyInfo}</h3>
                    <p className="text-gray-600 text-sm">{t.companyName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mt-8">
            <CardContent className="p-0">
              <h3 className="font-bold text-gray-900 p-6 pb-0">{t.mapTitle}</h3>
              <div className="aspect-video w-full">
                <iframe
                  src="https://maps.google.com/maps?q=Etimesgut,Ankara,Turkey&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-b-2xl"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
