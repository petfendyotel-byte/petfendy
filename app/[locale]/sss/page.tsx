"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  ChevronUp,
  Hotel,
  Car,
  CreditCard,
  Shield,
  Clock,
  Phone,
  PawPrint,
  HelpCircle,
  MessageCircle
} from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  faqs: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    id: "genel",
    title: "Genel Sorular",
    icon: <HelpCircle className="w-6 h-6" />,
    color: "bg-blue-500",
    faqs: [
      {
        question: "Petfendy nedir?",
        answer: "Petfendy, evcil hayvanlarınız için güvenilir pet otel ve pet taksi hizmetleri sunan bir platformdur. 2020 yılından beri binlerce evcil hayvan sahibine hizmet vermekteyiz."
      },
      {
        question: "Hangi şehirlerde hizmet veriyorsunuz?",
        answer: "Şu anda Türkiye genelinde 20'den fazla ilde pet otel ve pet taksi hizmeti sunmaktayız. Ankara merkezli olarak tüm Türkiye'ye ulaşım sağlıyoruz."
      },
      {
        question: "Hangi hayvan türlerini kabul ediyorsunuz?",
        answer: "Köpek, kedi ve diğer evcil hayvanları kabul ediyoruz. Özel bakım gerektiren hayvanlar için lütfen önceden bizimle iletişime geçin."
      }
    ]
  },
  {
    id: "otel",
    title: "Pet Otel",
    icon: <Hotel className="w-6 h-6" />,
    color: "bg-orange-500",
    faqs: [
      {
        question: "Pet otel rezervasyonu nasıl yapılır?",
        answer: "Web sitemiz üzerinden 'Pet Otel Rezervasyonu' butonuna tıklayarak, tarih ve oda seçimi yapabilir, evcil hayvanınızın bilgilerini girerek kolayca rezervasyon oluşturabilirsiniz."
      },
      {
        question: "Otel odalarında hangi özellikler var?",
        answer: "Odalarımızda klima, 24 saat kamera izleme, rahat yataklar, oyun alanları ve günlük temizlik hizmeti bulunmaktadır. VIP odalarımızda ek olarak özel bahçe alanı mevcuttur."
      },
      {
        question: "Evcil hayvanımı ziyaret edebilir miyim?",
        answer: "Evet, belirlenen ziyaret saatlerinde evcil hayvanınızı ziyaret edebilirsiniz. Ayrıca 24 saat canlı kamera izleme hizmeti ile dostunuzu her an görebilirsiniz."
      },
      {
        question: "Veteriner hizmeti var mı?",
        answer: "Evet, tesisimizde uzman veteriner hekimler bulunmaktadır. Acil durumlar için 24 saat veteriner desteği sağlıyoruz."
      },
      {
        question: "Özel diyet uygulayan hayvanlar için hizmet var mı?",
        answer: "Evet, özel diyet gereksinimleri olan evcil hayvanlar için kendi mamalarını getirebilir veya bizim önerdiğimiz özel diyetleri tercih edebilirsiniz."
      }
    ]
  },
  {
    id: "taksi",
    title: "Pet Taksi",
    icon: <Car className="w-6 h-6" />,
    color: "bg-green-500",
    faqs: [
      {
        question: "Pet taksi hizmeti nasıl çalışır?",
        answer: "İl ve ilçe seçimi yaparak mesafe hesaplaması yaptırabilirsiniz. VIP veya paylaşımlı taksi seçeneklerinden birini seçerek rezervasyon oluşturabilirsiniz."
      },
      {
        question: "VIP ve Paylaşımlı taksi arasındaki fark nedir?",
        answer: "VIP takside evcil hayvanınız tek başına özel araçla taşınır. Paylaşımlı takside ise diğer evcil hayvanlarla birlikte daha uygun fiyata taşıma yapılır."
      },
      {
        question: "Uzun mesafe taşıma yapıyor musunuz?",
        answer: "Evet, Türkiye'nin her yerine uzun mesafe pet taşıma hizmeti sunuyoruz. Ankara merkezli olarak tüm illere ulaşım sağlıyoruz."
      },
      {
        question: "Araçlarınız güvenli mi?",
        answer: "Tüm araçlarımız klimalı, hijyenik ve evcil hayvan taşımacılığına uygun donanıma sahiptir. Sürücülerimiz eğitimli ve deneyimlidir."
      }
    ]
  },
  {
    id: "odeme",
    title: "Ödeme & Fiyatlandırma",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-purple-500",
    faqs: [
      {
        question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        answer: "Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Online ödemelerimiz güvenli SSL sertifikası ile korunmaktadır."
      },
      {
        question: "Taksitli ödeme yapabilir miyim?",
        answer: "Evet, kredi kartı ile 12 aya kadar taksitli ödeme imkanı sunuyoruz."
      },
      {
        question: "İptal ve iade politikanız nedir?",
        answer: "Rezervasyonunuzu 48 saat öncesine kadar ücretsiz iptal edebilirsiniz. 48 saatten az süre kala yapılan iptallerde %50 kesinti uygulanır."
      },
      {
        question: "Fiyatlar neye göre belirleniyor?",
        answer: "Pet otel fiyatları oda tipine ve konaklama süresine göre, pet taksi fiyatları ise mesafe ve araç tipine göre belirlenmektedir."
      }
    ]
  },
  {
    id: "guvenlik",
    title: "Güvenlik & Sağlık",
    icon: <Shield className="w-6 h-6" />,
    color: "bg-red-500",
    faqs: [
      {
        question: "Evcil hayvanımın güvenliği nasıl sağlanıyor?",
        answer: "24 saat kamera sistemi, güvenlik personeli, veteriner kontrolü ve hijyen protokolleri ile evcil hayvanınızın güvenliğini en üst düzeyde sağlıyoruz."
      },
      {
        question: "Aşı zorunluluğu var mı?",
        answer: "Evet, tüm evcil hayvanların güncel aşılarının yapılmış olması gerekmektedir. Aşı kartını rezervasyon sırasında ibraz etmeniz gerekmektedir."
      },
      {
        question: "Acil durumda ne yapılıyor?",
        answer: "Acil sağlık durumlarında 24 saat veteriner desteğimiz devreye girer ve size anında bilgi verilir. Gerekirse en yakın veteriner kliniğine sevk yapılır."
      }
    ]
  },
  {
    id: "rezervasyon",
    title: "Rezervasyon & İptal",
    icon: <Clock className="w-6 h-6" />,
    color: "bg-cyan-500",
    faqs: [
      {
        question: "Rezervasyon ne kadar önceden yapılmalı?",
        answer: "En az 24 saat önceden rezervasyon yapmanızı öneririz. Yoğun dönemlerde (bayramlar, tatil sezonları) daha erken rezervasyon yapmanız avantajınıza olacaktır."
      },
      {
        question: "Rezervasyonumu nasıl değiştirebilirim?",
        answer: "Rezervasyon değişikliği için müşteri hizmetlerimizi arayabilir veya WhatsApp üzerinden bizimle iletişime geçebilirsiniz."
      },
      {
        question: "Üye olmadan rezervasyon yapabilir miyim?",
        answer: "Evet, üye olmadan misafir olarak rezervasyon yapabilirsiniz. Ancak üye olarak daha hızlı işlem yapabilir ve özel indirimlerden faydalanabilirsiniz."
      }
    ]
  }
]

export default function FAQPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>("genel")

  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isOpen = (categoryId: string, index: number) => {
    return openItems[`${categoryId}-${index}`] || false
  }

  const activeData = faqCategories.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600"></div>
        
        <div className="absolute top-10 left-10 opacity-20">
          <PawPrint className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <PawPrint className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sıkça Sorulan Sorular 🐾
          </h1>
          <p className="text-lg md:text-xl opacity-95">
            Petfendy hakkında merak ettiklerinizin cevaplarını burada bulabilirsiniz
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 ${
                  activeCategory === category.id 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "hover:bg-orange-50"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span className="ml-2">{category.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {activeData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 ${activeData.color} rounded-xl flex items-center justify-center text-white`}>
                  {activeData.icon}
                </div>
                <h2 className="text-2xl font-bold">{activeData.title}</h2>
              </div>

              {activeData.faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-md rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => toggleItem(activeData.id, index)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-5 bg-white">
                      <h3 className="font-semibold text-gray-800 pr-4">{faq.question}</h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isOpen(activeData.id, index) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {isOpen(activeData.id, index) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    {isOpen(activeData.id, index) && (
                      <div className="px-5 pb-5 pt-0 bg-orange-50/50 border-t">
                        <p className="text-gray-600 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500">
            <CardContent className="p-10 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Sorunuzun cevabını bulamadınız mı?
              </h3>
              <p className="text-white/90 mb-8">
                Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-full px-8"
                  onClick={() => router.push(`/${locale}/iletisim`)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Bize Ulaşın
                </Button>
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8"
                  onClick={() => window.open('https://wa.me/905551234567', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
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
