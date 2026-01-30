"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { getGalleryImages } from "@/lib/storage"
import { mockGalleryImages } from "@/lib/mock-data"
import type { GalleryImage } from "@/lib/types"

export default function GalleryPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const [images, setImages] = useState<GalleryImage[]>([])

  useEffect(() => {
    // Try to get from localStorage first
    let galleryImages = getGalleryImages()
    
    // If empty, use mock data
    if (galleryImages.length === 0) {
      galleryImages = mockGalleryImages
    }
    
    setImages(galleryImages)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">İşte Dostlarımız</h1>
          <p className="text-lg opacity-90">
            Petfendy'e uğrayan dostlarımızla anılar biriktirmeyi ve bunları saklamayı seviyoruz. İşte dostlarımızla anılarımızın bazıları...
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="relative h-64">
                  <Image
                    src={image.url}
                    alt={image.title || 'Gallery image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {(image.title || image.description) && (
                  <CardContent className="p-4">
                    {image.title && (
                      <h3 className="font-semibold mb-1">{image.title}</h3>
                    )}
                    {image.description && (
                      <p className="text-sm text-gray-600">{image.description}</p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Henüz galeri görseli bulunmuyor.</p>
            </div>
          )}
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

