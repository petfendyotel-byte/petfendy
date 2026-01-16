"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, ExternalLink, Loader2 } from "lucide-react"

interface InstagramPost {
  id: string
  caption: string
  media_type: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

// Fallback görseller (API çalışmazsa)
const fallbackPosts = [
  {
    id: "fallback-1",
    caption: "Petfendy oyun anları 🐾",
    media_type: "IMAGE",
    media_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop&q=75",
    permalink: "https://www.instagram.com/petfendy/",
    timestamp: new Date().toISOString()
  },
  {
    id: "fallback-2", 
    caption: "Petfendy'de kedi ve köpek sevgisi 🐱😺",
    media_type: "IMAGE",
    media_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&q=75",
    permalink: "https://www.instagram.com/petfendy/",
    timestamp: new Date().toISOString()
  },
  {
    id: "fallback-3",
    caption: "Petfendy ailesiyle beraber 🐾✨",
    media_type: "IMAGE",
    media_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&q=75",
    permalink: "https://www.instagram.com/petfendy/",
    timestamp: new Date().toISOString()
  }
]

interface InstagramFeedProps {
  title: string
  buttonText: string
}

export function InstagramFeed({ title, buttonText }: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/instagram')
        const data = await response.json()
        
        if (data.success && data.posts.length > 0) {
          setPosts(data.posts.slice(0, 3)) // İlk 3 gönderi
        } else {
          setPosts(fallbackPosts)
          setError(true)
        }
      } catch (err) {
        console.error('Instagram gönderileri yüklenemedi:', err)
        setPosts(fallbackPosts)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Caption'ı kısalt
  const truncateCaption = (caption: string, maxLength: number = 60) => {
    if (!caption) return ""
    if (caption.length <= maxLength) return caption
    return caption.substring(0, maxLength) + "..."
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {!error && (
            <p className="text-gray-600">@petfendy hesabından son paylaşımlar</p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {posts.map((post) => (
              <a 
                key={post.id} 
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="relative h-64">
                    <Image
                      src={post.media_url}
                      alt={truncateCaption(post.caption, 30) || "Petfendy Instagram"}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {truncateCaption(post.caption) || "Petfendy 🐾"}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button
            size="lg"
            className="gradient-orange-pink hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-2xl px-8 py-6 text-lg gap-3"
            onClick={() => window.open('https://www.instagram.com/petfendy/', '_blank')}
          >
            <Instagram className="w-6 h-6" />
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  )
}
