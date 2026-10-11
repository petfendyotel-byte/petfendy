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

const content = {
  tr: {
    heroTitle: "Sıkça Sorulan Sorular 🐾",
    heroSubtitle: "Petfendy hakkında merak ettiklerinizin cevaplarını burada bulabilirsiniz",
    ctaTitle: "Sorunuzun cevabını bulamadınız mı?",
    ctaSubtitle: "Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar",
    contactUs: "Bize Ulaşın",
    whatsapp: "WhatsApp",
    categories: [
      {
        id: "genel",
        title: "Genel Sorular",
        faqs: [
          { question: "Petfendy nedir?", answer: "Petfendy, evcil hayvanlarınız için güvenilir pet otel ve pet taksi hizmetleri sunan bir platformdur. 2020 yılından beri binlerce evcil hayvan sahibine hizmet vermekteyiz." },
          { question: "Hangi şehirlerde hizmet veriyorsunuz?", answer: "Ankara'da otel ve kreş hizmeti, 81 ilde taksi hizmeti sunuyoruz. Ankara merkezli olarak tüm Türkiye'ye ulaşım sağlıyoruz." },
          { question: "Hangi hayvan türlerini kabul ediyorsunuz?", answer: "Köpek, kedi ve diğer evcil hayvanları kabul ediyoruz. Özel bakım gerektiren hayvanlar için lütfen önceden bizimle iletişime geçin." }
        ]
      },
      {
        id: "otel",
        title: "Pet Otel",
        faqs: [
          { question: "Pet otel rezervasyonu nasıl yapılır?", answer: "Web sitemiz üzerinden 'Pet Otel Rezervasyonu' butonuna tıklayarak, tarih ve oda seçimi yapabilir, evcil hayvanınızın bilgilerini girerek kolayca rezervasyon oluşturabilirsiniz." },
          { question: "Otel odalarında hangi özellikler var?", answer: "Odalarımızda klima, 24 saat kamera izleme, rahat yataklar, oyun alanları ve günlük temizlik hizmeti bulunmaktadır. VIP odalarımızda ek olarak özel bahçe alanı mevcuttur." },
          { question: "Evcil hayvanımı ziyaret edebilir miyim?", answer: "Evet, belirlenen ziyaret saatlerinde evcil hayvanınızı ziyaret edebilirsiniz. Ayrıca 24 saat canlı kamera izleme hizmeti ile dostunuzu her an görebilirsiniz." },
          { question: "Veteriner hizmeti var mı?", answer: "Evet, tesisimizde uzman veteriner hekimler bulunmaktadır. Acil durumlar için 24 saat veteriner desteği sağlıyoruz." },
          { question: "Özel diyet uygulayan hayvanlar için hizmet var mı?", answer: "Evet, özel diyet gereksinimleri olan evcil hayvanlar için kendi mamalarını getirebilir veya bizim önerdiğimiz özel diyetleri tercih edebilirsiniz." }
        ]
      },
      {
        id: "taksi",
        title: "Pet Taksi",
        faqs: [
          { question: "Pet taksi hizmeti nasıl çalışır?", answer: "İl ve ilçe seçimi yaparak mesafe hesaplaması yaptırabilirsiniz. VIP taksi ile rezervasyon oluşturabilirsiniz." },
          { question: "Uzun mesafe taşıma yapıyor musunuz?", answer: "Evet, Türkiye'nin her yerine uzun mesafe pet taşıma hizmeti sunuyoruz. Ankara merkezli olarak tüm illere ulaşım sağlıyoruz." },
          { question: "Araçlarınız güvenli mi?", answer: "Tüm araçlarımız klimalı, hijyenik ve evcil hayvan taşımacılığına uygun donanıma sahiptir. Sürücülerimiz eğitimli ve deneyimlidir." }
        ]
      },
      {
        id: "odeme",
        title: "Ödeme & Fiyatlandırma",
        faqs: [
          { question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", answer: "Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Online ödemelerimiz güvenli SSL sertifikası ile korunmaktadır." },
          { question: "Taksitli ödeme yapabilir miyim?", answer: "Evet, kredi kartı ile 12 aya kadar taksitli ödeme imkanı sunuyoruz." },
          { question: "İptal ve iade politikanız nedir?", answer: "Rezervasyonunuzu 48 saat öncesine kadar ücretsiz iptal edebilirsiniz. 48 saatten az süre kala yapılan iptallerde %50 kesinti uygulanır." },
          { question: "Fiyatlar neye göre belirleniyor?", answer: "Pet otel fiyatları oda tipine ve konaklama süresine göre, pet taksi fiyatları ise mesafe ve araç tipine göre belirlenmektedir." }
        ]
      },
      {
        id: "guvenlik",
        title: "Güvenlik & Sağlık",
        faqs: [
          { question: "Evcil hayvanımın güvenliği nasıl sağlanıyor?", answer: "24 saat kamera sistemi, güvenlik personeli, veteriner kontrolü ve hijyen protokolleri ile evcil hayvanınızın güvenliğini en üst düzeyde sağlıyoruz." },
          { question: "Aşı zorunluluğu var mı?", answer: "Evet, tüm evcil hayvanların güncel aşılarının yapılmış olması gerekmektedir. Aşı kartını rezervasyon sırasında ibraz etmeniz gerekmektedir." },
          { question: "Acil durumda ne yapılıyor?", answer: "Acil sağlık durumlarında 24 saat veteriner desteğimiz devreye girer ve size anında bilgi verilir. Gerekirse en yakın veteriner kliniğine sevk yapılır." }
        ]
      },
      {
        id: "rezervasyon",
        title: "Rezervasyon & İptal",
        faqs: [
          { question: "Rezervasyon ne kadar önceden yapılmalı?", answer: "En az 24 saat önceden rezervasyon yapmanızı öneririz. Yoğun dönemlerde (bayramlar, tatil sezonları) daha erken rezervasyon yapmanız avantajınıza olacaktır." },
          { question: "Rezervasyonumu nasıl değiştirebilirim?", answer: "Rezervasyon değişikliği için müşteri hizmetlerimizi arayabilir veya WhatsApp üzerinden bizimle iletişime geçebilirsiniz." },
          { question: "Üye olmadan rezervasyon yapabilir miyim?", answer: "Evet, üye olmadan misafir olarak rezervasyon yapabilirsiniz. Ancak üye olarak daha hızlı işlem yapabilir ve özel indirimlerden faydalanabilirsiniz." }
        ]
      }
    ]
  },
  en: {
    heroTitle: "Frequently Asked Questions 🐾",
    heroSubtitle: "Find answers to your questions about Petfendy here",
    ctaTitle: "Couldn't find the answer to your question?",
    ctaSubtitle: "Our customer service is happy to help you",
    contactUs: "Contact Us",
    whatsapp: "WhatsApp",
    categories: [
      {
        id: "genel",
        title: "General Questions",
        faqs: [
          { question: "What is Petfendy?", answer: "Petfendy is a platform that offers reliable pet hotel and pet taxi services for your pets. We have been serving thousands of pet owners since 2020." },
          { question: "Which cities do you serve?", answer: "We offer hotel and daycare services in Ankara, and taxi services in all 81 provinces. We provide transportation to all of Turkey from our Ankara headquarters." },
          { question: "Which animal species do you accept?", answer: "We accept dogs, cats and other pets. Please contact us in advance for animals that require special care." }
        ]
      },
      {
        id: "otel",
        title: "Pet Hotel",
        faqs: [
          { question: "How do I make a pet hotel reservation?", answer: "You can easily create a reservation by clicking the 'Pet Hotel Reservation' button on our website, selecting dates and rooms, and entering your pet's information." },
          { question: "What features do hotel rooms have?", answer: "Our rooms have air conditioning, 24-hour camera monitoring, comfortable beds, play areas and daily cleaning service. Our VIP rooms also have a private garden area." },
          { question: "Can I visit my pet?", answer: "Yes, you can visit your pet during designated visiting hours. You can also see your friend at any time with our 24-hour live camera monitoring service." },
          { question: "Is there veterinary service?", answer: "Yes, we have expert veterinarians at our facility. We provide 24-hour veterinary support for emergencies." },
          { question: "Is there service for animals on special diets?", answer: "Yes, for pets with special dietary requirements, you can bring their own food or choose the special diets we recommend." }
        ]
      },
      {
        id: "taksi",
        title: "Pet Taxi",
        faqs: [
          { question: "How does the pet taxi service work?", answer: "You can calculate the distance by selecting province and district. You can create a reservation with our VIP taxi." },
          { question: "Do you do long distance transportation?", answer: "Yes, we offer long distance pet transportation service to all parts of Turkey. We provide transportation to all provinces from our Ankara headquarters." },
          { question: "Are your vehicles safe?", answer: "All our vehicles are air-conditioned, hygienic and equipped for pet transportation. Our drivers are trained and experienced." }
        ]
      },
      {
        id: "odeme",
        title: "Payment & Pricing",
        faqs: [
          { question: "What payment methods do you accept?", answer: "You can pay by credit card, debit card and bank transfer/EFT. Our online payments are protected with a secure SSL certificate." },
          { question: "Can I pay in installments?", answer: "Yes, we offer installment payment options up to 12 months with credit card." },
          { question: "What is your cancellation and refund policy?", answer: "You can cancel your reservation free of charge up to 48 hours in advance. A 50% deduction is applied for cancellations made less than 48 hours in advance." },
          { question: "How are prices determined?", answer: "Pet hotel prices are determined by room type and length of stay, while pet taxi prices are determined by distance and vehicle type." }
        ]
      },
      {
        id: "guvenlik",
        title: "Security & Health",
        faqs: [
          { question: "How is my pet's safety ensured?", answer: "We ensure the safety of your pet at the highest level with 24-hour camera system, security personnel, veterinary control and hygiene protocols." },
          { question: "Is vaccination mandatory?", answer: "Yes, all pets must have their current vaccinations. You must present the vaccination card at the time of reservation." },
          { question: "What happens in an emergency?", answer: "In emergency health situations, our 24-hour veterinary support is activated and you are immediately informed. If necessary, referral is made to the nearest veterinary clinic." }
        ]
      },
      {
        id: "rezervasyon",
        title: "Reservation & Cancellation",
        faqs: [
          { question: "How far in advance should I make a reservation?", answer: "We recommend making a reservation at least 24 hours in advance. Making an earlier reservation during busy periods (holidays, vacation seasons) will be to your advantage." },
          { question: "How can I change my reservation?", answer: "For reservation changes, you can call our customer service or contact us via WhatsApp." },
          { question: "Can I make a reservation without being a member?", answer: "Yes, you can make a reservation as a guest without being a member. However, as a member, you can process faster and benefit from special discounts." }
        ]
      }
    ]
  }
}

const categoryIcons: Record<string, React.ReactNode> = {
  genel: <HelpCircle className="w-6 h-6" />,
  otel: <Hotel className="w-6 h-6" />,
  taksi: <Car className="w-6 h-6" />,
  odeme: <CreditCard className="w-6 h-6" />,
  guvenlik: <Shield className="w-6 h-6" />,
  rezervasyon: <Clock className="w-6 h-6" />
}

const categoryColors: Record<string, string> = {
  genel: "bg-blue-500",
  otel: "bg-orange-500",
  taksi: "bg-green-500",
  odeme: "bg-purple-500",
  guvenlik: "bg-red-500",
  rezervasyon: "bg-cyan-500"
}

export default function FAQPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>("genel")

  const toggleItem = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isOpen = (categoryId: string, index: number) => openItems[`${categoryId}-${index}`] || false

  const activeData = t.categories.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600"></div>
        <div className="absolute top-10 left-10 opacity-20"><PawPrint className="w-16 h-16 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><PawPrint className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.heroTitle}</h1>
          <p className="text-lg md:text-xl opacity-95">{t.heroSubtitle}</p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {t.categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 ${activeCategory === category.id ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-orange-50"}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {categoryIcons[category.id]}
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
                <div className={`w-12 h-12 ${categoryColors[activeData.id]} rounded-xl flex items-center justify-center text-white`}>
                  {categoryIcons[activeData.id]}
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen(activeData.id, index) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {isOpen(activeData.id, index) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{t.ctaTitle}</h3>
              <p className="text-white/90 mb-8">{t.ctaSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold rounded-full px-8"
                  onClick={() => router.push(`/${locale}/iletisim`)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t.contactUs}
                </Button>
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8"
                  onClick={() => window.open('https://wa.me/905323073264', '_blank')}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t.whatsapp}
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
