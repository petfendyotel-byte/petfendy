"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPageBySlug } from "@/lib/storage"
import { mockPages } from "@/lib/mock-data"
import type { Page } from "@/lib/types"

export default function AboutPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const [pageData, setPageData] = useState<Page | null>(null)

  useEffect(() => {
    // Try to get from localStorage first
    let page = getPageBySlug('about')
    
    // If not found, use mock data
    if (!page) {
      page = mockPages.find(p => p.slug === 'about') || null
    }
    
    setPageData(page)
  }, [])

  if (!pageData) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gray-900">
        {pageData.heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={pageData.heroImage}
              alt={pageData.title}
              fill
              className="object-cover opacity-60"
            />
          </div>
        )}
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageData.title}</h1>
          {pageData.subtitle && (
            <p className="text-lg md:text-xl opacity-90">{pageData.subtitle}</p>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
