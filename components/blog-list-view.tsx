"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, User } from "lucide-react"
import type { BlogListItem } from "@/lib/blog-shared"

export function BlogListView({ posts, locale }: { posts: BlogListItem[]; locale: string }) {
  const t = useTranslations("blog")

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group block">
                <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  {post.coverImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")}
                          </time>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center rounded-md py-2 text-sm font-medium group-hover:bg-gray-900 group-hover:text-white transition-colors">
                      {t("readMore")}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t("noPosts")}</p>
            </div>
          )}
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
