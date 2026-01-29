"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getFAQs } from "@/lib/storage"
import { mockFAQs } from "@/lib/mock-data"
import type { FAQ } from "@/lib/types"
import { Search } from "lucide-react"

export default function FAQPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([])

  useEffect(() => {
    // Try to get from localStorage first
    let faqList = getFAQs()
    
    // If empty, use mock data
    if (faqList.length === 0) {
      faqList = mockFAQs
    }
    
    // Filter published and sort by order
    const publishedFAQs = faqList
      .filter(f => f.published)
      .sort((a, b) => a.order - b.order)
    
    setFaqs(publishedFAQs)
    setFilteredFAQs(publishedFAQs)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFAQs(faqs)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
      setFilteredFAQs(filtered)
    }
  }, [searchQuery, faqs])

  // Group FAQs by category
  const categorizedFAQs = filteredFAQs.reduce((acc, faq) => {
    const category = faq.category || 'Genel'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sık Sorulan Sorular</h1>
          <p className="text-lg opacity-90">
            Merak ettiklerinizin cevaplarını burada bulabilirsiniz
          </p>
        </div>
      </section>

      {/* Search & FAQs */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Soru ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* FAQs by Category */}
          {Object.entries(categorizedFAQs).map(([category, categoryFAQs]) => (
            <div key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">{category}</h2>
                <Badge variant="secondary">{categoryFAQs.length} soru</Badge>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {categoryFAQs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-gray-600 pt-2">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? "Aradığınız soru bulunamadı." : "Henüz soru bulunmuyor."}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

