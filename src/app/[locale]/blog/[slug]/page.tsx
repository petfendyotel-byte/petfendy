"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/storage"
import { mockBlogPosts } from "@/lib/mock-data"
import type { BlogPost } from "@/lib/types"
import { Calendar, User, ArrowLeft, Tag } from "lucide-react"

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    // Try to get from localStorage first
    let blogPost = getBlogPostBySlug(slug)
    
    // If not found, try mock data
    if (!blogPost) {
      blogPost = mockBlogPosts.find(p => p.slug === slug) || null
    }
    
    setPost(blogPost)

    // Get related posts
    if (blogPost) {
      let allPosts = getBlogPosts()
      if (allPosts.length === 0) {
        allPosts = mockBlogPosts
      }
      
      const related = allPosts
        .filter(p => p.id !== blogPost.id && p.published && p.category === blogPost.category)
        .slice(0, 3)
      
      setRelatedPosts(related)
    }
  }, [slug])

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar locale={locale} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p>Blog yazısı bulunamadı.</p>
          <Button onClick={() => router.push(`/${locale}/blog`)} className="mt-4">
            Blog'a Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/${locale}/blog`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Blog'a Dön
        </Button>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-96 rounded-xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Badge>{post.category}</Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        {/* Author & Date */}
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">İlgili Yazılar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Card 
                key={relatedPost.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/${locale}/blog/${relatedPost.slug}`)}
              >
                {relatedPost.coverImage && (
                  <div className="relative h-40">
                    <Image
                      src={relatedPost.coverImage}
                      alt={relatedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{relatedPost.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Footer locale={locale} />
    </div>
  )
}

