"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Info, Building2, CreditCard, Phone, Mail, MapPin, Clock, Shield } from "lucide-react"

const content = {
  tr: {
    title: "ÖN BİLGİLENDİRME FORMU",
    subtitle: "6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında",
    sections: [
      {
        icon: "building",
        title: "Satıcı Bilgileri",
        items: [
          { label: "Ticari Unvan", value: "BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ" },
          { label: "Adres", value: "Bağlıca, Şehit Hikmet Özer Cd. No:101 Etimesgut/Ankara" },
          { label: "Telefon", value: "+90 532 307 32 64" },
          { label: "E-posta", value: "petfendyotel@gmail.com" },
        ]
      },
      {
        icon: "info",
        title: "Hizmet Bilgileri",
        text: "Petfendy platformu üzerinden sunulan hizmetler; pet otel konaklama, pet taksi hizmetleri ve ilgili ek hizmetlerdir. Hizmetlerin detayları, özellikleri ve fiyatları platform üzerinde açıkça belirtilmektedir."
      },
      {
        icon: "credit",
        title: "Ödeme Bilgileri",
        items: [
          { label: "Ödeme Yöntemi", value: "Kredi Kartı / Banka Kartı (İyzico altyapısı)" },
          { label: "Taksit Seçenekleri", value: "Banka kartlarına göre değişkenlik gösterir" },
          { label: "Fatura", value: "Elektronik fatura e-posta adresinize gönderilir" },
        ]
      },
      {
        icon: "clock",
        title: "Cayma Hakkı",
        text: "Tüketici, hizmet satın aldıktan sonra 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma hakkının kullanılması halinde, ödenen bedel 14 iş günü içinde iade edilir. Ancak, hizmetin ifasına başlanmış ise cayma hakkı kullanılamaz."
      },
      {
        icon: "shield",
        title: "Kişisel Verilerin Korunması",
        text: "Kişisel verileriniz 6698 sayılı KVKK kapsamında korunmaktadır. Detaylı bilgi için Gizlilik Politikası sayfamızı inceleyebilirsiniz."
      }
    ],
    agreement: "Bu formu onaylayarak yukarıdaki bilgileri okuduğunuzu ve anladığınızı kabul etmiş olursunuz.",
    lastUpdate: "Son Güncelleme: 15 Aralık 2024"
  },
  en: {
    title: "PRELIMINARY INFORMATION FORM",
    subtitle: "Within the scope of Consumer Protection Law No. 6502 and Distance Contracts Regulation",
    sections: [
      {
        icon: "building",
        title: "Seller Information",
        items: [
          { label: "Trade Name", value: "BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY" },
          { label: "Address", value: "Bağlıca, Şehit Hikmet Özer St. No:101 Etimesgut/Ankara, Turkey" },
          { label: "Phone", value: "+90 532 307 32 64" },
          { label: "Email", value: "petfendyotel@gmail.com" },
        ]
      },
      {
        icon: "info",
        title: "Service Information",
        text: "Services offered through the Petfendy platform include pet hotel accommodation, pet taxi services and related additional services. Details, features and prices of services are clearly stated on the platform."
      },
      {
        icon: "credit",
        title: "Payment Information",
        items: [
          { label: "Payment Method", value: "Credit Card / Debit Card (İyzico infrastructure)" },
          { label: "Installment Options", value: "Varies according to bank cards" },
          { label: "Invoice", value: "Electronic invoice is sent to your email address" },
        ]
      },
      {
        icon: "clock",
        title: "Right of Withdrawal",
        text: "The consumer may exercise the right of withdrawal within 14 days after purchasing the service without giving any reason. If the right of withdrawal is exercised, the amount paid will be refunded within 14 business days. However, if the performance of the service has started, the right of withdrawal cannot be used."
      },
      {
        icon: "shield",
        title: "Protection of Personal Data",
        text: "Your personal data is protected under the Personal Data Protection Law No. 6698. For detailed information, please review our Privacy Policy page."
      }
    ],
    agreement: "By approving this form, you accept that you have read and understood the above information.",
    lastUpdate: "Last Update: December 15, 2024"
  }
}

const iconMap = {
  building: Building2,
  info: Info,
  credit: CreditCard,
  clock: Clock,
  shield: Shield
}

export default function PreliminaryInfoPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"></div>
        <div className="absolute top-10 left-10 opacity-20"><FileText className="w-24 h-24 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><Info className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-teal-100 text-sm max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {t.sections.map((section, index) => {
            const IconComponent = iconMap[section.icon as keyof typeof iconMap] || Info
            return (
              <Card key={index} className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                      {section.text && <p className="text-gray-600 leading-relaxed text-sm">{section.text}</p>}
                      {section.items && (
                        <div className="space-y-3">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                              <span className="font-semibold text-gray-700 sm:min-w-[140px]">{item.label}:</span>
                              <span className="text-gray-600">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Agreement */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500">
            <CardContent className="p-6 sm:p-8 text-white text-center">
              <p className="text-teal-100 mb-2">{t.agreement}</p>
              <p className="text-xs text-teal-200">{t.lastUpdate}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer locale={locale} />
    </div>
  )
}
