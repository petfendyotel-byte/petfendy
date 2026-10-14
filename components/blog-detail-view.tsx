"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Tag, User } from "lucide-react"
import type { BlogListItem, BlogPostDto } from "@/lib/blog-shared"
import "@/styles/blog-content.css"

interface BlogDetailViewProps {
  // content: sunucuda temizlenmiş (sanitize) HTML
  post: BlogPostDto
  related: BlogListItem[]
  locale: string
}

export function BlogDetailView({ post, related, locale }: BlogDetailViewProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Button asChild variant="ghost" className="gap-2">
          <Link href={`/${locale}/blog`}>
            <ArrowLeft className="w-4 h-4" />
            Blog'a Dön
          </Link>
        </Button>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {post.coverImage && (
          <div className="relative h-72 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <Badge>{post.category}</Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          {post.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </div>
          )}
        </div>

        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">İlgili Yazılar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {related.map((item) => (
              <Link key={item.id} href={`/${locale}/blog/${item.slug}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  {item.coverImage && (
                    <div className="relative h-40">
                      <Image src={item.coverImage} alt={item.coverImageAlt || item.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer locale={locale} />
    </div>
  )
}
