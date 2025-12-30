"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBlogPosts } from "@/lib/storage"
import { mockBlogPosts } from "@/lib/mock-data"
import type { BlogPost } from "@/lib/types"
import { Calendar, User, ChevronRight } from "lucide-react"

export default function BlogPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations('blog')
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    // Try to get from localStorage first
    let blogPosts = getBlogPosts()
    
    // If empty, use mock data
    if (blogPosts.length === 0) {
      blogPosts = mockBlogPosts
    }
    
    // Filter published posts and sort by date
    const publishedPosts = blogPosts
      .filter(p => p.published)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    setPosts(publishedPosts)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg opacity-90">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => router.push(`/${locale}/blog/${post.slug}`)}
              >
                {post.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    {t('readMore')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('noPosts')}</p>
            </div>
          )}
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

