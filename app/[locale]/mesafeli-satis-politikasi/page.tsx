"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Scale, MapPin } from "lucide-react"

const content = {
  tr: {
    title: "MESAFELİ SATIŞ SÖZLEŞMESİ",
    articles: [
      {
        num: 1,
        title: "Madde 1 - Taraflar",
        text: "İşbu sözleşme, bir tarafta merkezi Ankara adresinde bulunan BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ (bundan sonra \"Satıcı\" olarak anılacaktır) ile diğer tarafta, Satıcı'nın hizmetlerini platform üzerinden satın alan tüketici (\"Alıcı\") arasında, aşağıda belirtilen hüküm ve şartlar çerçevesinde akdedilmiştir."
      },
      {
        num: 2,
        title: "Madde 2 - Tanımlar",
        definitions: [
          { term: "Bakanlık", desc: "Ticaret Bakanlığı" },
          { term: "Kanun", desc: "6502 sayılı Tüketicinin Korunması Hakkında Kanun" },
          { term: "Yönetmelik", desc: "Mesafeli Sözleşmeler Yönetmeliği" },
          { term: "Satıcı", desc: "BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ, dijital rezervasyon ve organizasyon hizmeti sağlayıcısıdır. Hizmet bedeli Satıcı tarafından tahsil edilir." },
          { term: "Alıcı", desc: "Satıcı'dan dijital rezervasyon ve organizasyon hizmeti satın alan gerçek veya tüzel kişi." },
          { term: "Hizmet", desc: "Petfendy tarafından kendi adına sunulan dijital rezervasyon ve organizasyon hizmeti." },
          { term: "Platform", desc: "Satıcı'nın hizmetlerini sunduğu www.petfendy.com internet sitesi." },
        ]
      },
      {
        num: 3,
        title: "Madde 3 - Konu",
        text: "İşbu sözleşme, Alıcı'nın Satıcı'dan satın aldığı dijital rezervasyon ve organizasyon hizmetine ilişkin tarafların hak ve yükümlülüklerini 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun çerçevesinde düzenler."
      },
      {
        num: 4,
        title: "Madde 4 - Sözleşme Konusu Hizmetin Özellikleri ve Bedeli",
        text: "Alıcı, satın almış olduğu dijital rezervasyon ve organizasyon hizmetinin detayları, fiyatı ve koşullarını satın alma işleminden önce incelemekle yükümlüdür."
      },
      {
        num: 5,
        title: "Madde 5 - Ödeme ve İade Koşulları",
        items: [
          "Hizmet bedeli İyzico güvenli ödeme sistemi ile Satıcı tarafından tahsil edilir.",
          "Ödemeler kredi kartı, banka kartı ile gerçekleştirilebilir.",
          "İade işlemleri aynı ödeme yöntemiyle 10-14 iş günü içinde tamamlanır.",
          "Hizmet başlamadan önce cayma hakkı 6502 sayılı Kanun uyarınca 14 gün süreyle geçerlidir.",
          "Hizmetin ifasına başlanması durumunda cayma hakkı kullanılamaz."
        ]
      },
      {
        num: 6,
        title: "Madde 6 - Cayma Hakkı",
        items: [
          "Alıcı, 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 47. maddesi uyarınca, hizmet sözleşmesinin kurulduğu tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.",
          "Cayma hakkı, hizmetin ifasına başlanmadan önce kullanılabilir. Hizmetin ifasına başlanması durumunda cayma hakkı düşer.",
          "Cayma bildiriminin yazılı olarak veya kalıcı veri saklayıcısı ile Satıcı'ya (petfendyotel@gmail.com) iletilmesi gerekmektedir.",
          "Cayma hakkının kullanılması halinde, ödenen bedel 14 iş günü içinde aynı ödeme yöntemiyle iade edilir.",
          "İade işlemleri İyzico ödeme sistemi üzerinden gerçekleştirilir."
        ]
      },
      {
        num: 7,
        title: "Madde 7 - Satıcı'nın Yükümlülükleri",
        items: [
          "Satıcı, dijital rezervasyon ve organizasyon hizmetini kendi adına ve hesabına sunmaktadır.",
          "Satıcı, hizmet kalitesinden ve müşteri memnuniyetinden doğrudan sorumludur.",
          "Satıcı, hizmet bedeli tahsilatını İyzico ödeme sistemi üzerinden gerçekleştirir.",
          "Satıcı, iade işlemlerini aynı ödeme yöntemiyle yapmakla yükümlüdür.",
          "Satıcı, tüketici haklarına ilişkin yasal yükümlülüklerini yerine getirmekle sorumludur."
        ]
      },
      {
        num: 8,
        title: "Madde 8 - Alıcı'nın Yükümlülükleri",
        items: [
          "Alıcı, platform üzerinden seçtiği hizmete ilişkin tüm bilgileri dikkatle incelemekle yükümlüdür.",
          "Alıcı, hizmet sağlayıcıdan aldığı hizmet sırasında oluşabilecek sorunlarda Satıcı ile iletişime geçebilecektir."
        ]
      },
      {
        num: 9,
        title: "Madde 9 - Sözleşmenin Süresi ve Feshi",
        text: "İşbu sözleşme, Alıcı'nın platform üzerinden hizmet satın alması ile yürürlüğe girer. Taraflar, karşılıklı mutabakat ile sözleşmeyi feshedebilir."
      },
      {
        num: 10,
        title: "Madde 10 - Uyuşmazlıkların Çözümü",
        text: "İşbu sözleşmeden doğabilecek uyuşmazlıkların çözümünde, Ankara Tüketici Hakem Heyetleri ve Ankara Tüketici Mahkemeleri yetkilidir."
      },
      {
        num: 11,
        title: "Madde 11 - Yürürlük",
        text: "Alıcı, platform üzerinden hizmet satın alırken işbu sözleşmenin tüm koşullarını okuduğunu, anladığını ve kabul ettiğini beyan eder. Sözleşme, Alıcı tarafından elektronik ortamda onaylandığı ve hizmet bedeli ödendiği anda yürürlüğe girer."
      }
    ],
    parties: "Taraflar:",
    seller: "Satıcı:",
    sellerInfo: "BSG EVCİL HAYVAN BAKIM DIŞ TİCARET PAZARLAMA VE SANAYİ LİMİTED ŞİRKETİ\nİstasyon Mah. Şehit Hikmet Özer Cd. No:101 Etimesgut/Ankara",
    buyer: "Alıcı:",
    buyerInfo: "[Ad-Soyad / Ticari Unvan]"
  },
  en: {
    title: "DISTANCE SALES AGREEMENT",
    articles: [
      {
        num: 1,
        title: "Article 1 - Parties",
        text: "This agreement has been concluded between BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY (hereinafter referred to as \"Seller\") headquartered in Ankara and the consumer (\"Buyer\") who purchases the Seller's services through the platform, within the framework of the terms and conditions specified below."
      },
      {
        num: 2,
        title: "Article 2 - Definitions",
        definitions: [
          { term: "Ministry", desc: "Ministry of Trade" },
          { term: "Law", desc: "Consumer Protection Law No. 6502" },
          { term: "Regulation", desc: "Distance Contracts Regulation" },
          { term: "Seller", desc: "BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY provides intermediary services between pet owners and service providers through the platform." },
          { term: "Buyer", desc: "The consumer who requests services through the Seller's platform and pays for these services." },
          { term: "Platform", desc: "The digital platform operated by the Seller that enables Buyers to purchase services from service providers." },
        ]
      },
      {
        num: 3,
        title: "Article 3 - Subject",
        text: "This agreement regulates the rights and obligations of the parties regarding the services that the Buyer can purchase from service providers through the Seller's platform."
      },
      {
        num: 4,
        title: "Article 4 - Features and Price of the Service",
        text: "The Buyer is obliged to review the details, price, conditions and information about the service provider of the service selected through the platform before making a purchase."
      },
      {
        num: 5,
        title: "Article 5 - Payment and Refund Conditions",
        items: [
          "The Buyer will pay the service fee specified on the platform through online payment methods.",
          "If the Buyer exercises the right of withdrawal, the refund process will be completed within 14 business days.",
          "If the service is not provided by the provider, the refund process will be carried out after the Seller's evaluation."
        ]
      },
      {
        num: 6,
        title: "Article 6 - Right of Withdrawal",
        items: [
          "The Buyer may exercise the right of withdrawal within 14 days after purchasing the service without giving any reason.",
          "If the right of withdrawal is exercised, the withdrawal notification can be made to the Seller in writing or through the relevant section on the platform.",
          "If the right of withdrawal is exercised, the service fee will be refunded to the Buyer using the same payment method."
        ]
      },
      {
        num: 7,
        title: "Article 7 - Seller's Obligations",
        items: [
          "The Seller is obliged to ensure that the information on the platform is accurate, complete and up-to-date.",
          "The Seller acts as an intermediary between service providers and Buyers."
        ]
      },
      {
        num: 8,
        title: "Article 8 - Buyer's Obligations",
        items: [
          "The Buyer is obliged to carefully review all information regarding the service selected through the platform.",
          "The Buyer may contact the Seller in case of problems during the service received from the service provider."
        ]
      },
      {
        num: 9,
        title: "Article 9 - Duration and Termination",
        text: "This agreement enters into force when the Buyer purchases a service through the platform. The parties may terminate the agreement by mutual consent."
      },
      {
        num: 10,
        title: "Article 10 - Dispute Resolution",
        text: "Ankara Consumer Arbitration Committees and Ankara Consumer Courts are authorized to resolve disputes arising from this agreement."
      },
      {
        num: 11,
        title: "Article 11 - Effectiveness",
        text: "The Buyer declares that they have read, understood and accepted all terms of this agreement when purchasing services through the platform. The agreement enters into force when it is approved electronically by the Buyer and the service fee is paid."
      }
    ],
    parties: "Parties:",
    seller: "Seller:",
    sellerInfo: "BSG PET CARE FOREIGN TRADE MARKETING AND INDUSTRY LIMITED COMPANY\nİstasyon Mah. Şehit Hikmet Özer St. No:101 Etimesgut/Ankara",
    buyer: "Buyer:",
    buyerInfo: "[Name-Surname / Trade Name]"
  }
}

export default function DistanceSalesPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = content[locale as keyof typeof content] || content.tr

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
        <div className="absolute top-10 left-10 opacity-20"><FileText className="w-24 h-24 text-white" /></div>
        <div className="absolute bottom-10 right-10 opacity-20"><Scale className="w-20 h-20 text-white" /></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {t.articles.map((article) => (
            <Card key={article.num} className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                    {article.num}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-3">{article.title}</h2>
                    {article.text && <p className="text-gray-600 leading-relaxed text-sm">{article.text}</p>}
                    {article.definitions && (
                      <div className="space-y-3">
                        {article.definitions.map((def, i) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="font-semibold text-indigo-600 min-w-[100px]">{def.term}:</span>
                            <span className="text-gray-600">{def.desc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {article.items && (
                      <ul className="space-y-2 text-gray-600 text-sm">
                        {article.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">{article.num}.{i + 1}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Parties */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
            <CardContent className="p-6 sm:p-8 text-white">
              <h3 className="font-bold text-lg mb-4">{t.parties}</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="font-bold mb-2">{t.seller}</p>
                  <p className="text-sm text-indigo-100 whitespace-pre-line">{t.sellerInfo}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="font-bold mb-2">{t.buyer}</p>
                  <p className="text-sm text-indigo-100">{t.buyerInfo}</p>
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
