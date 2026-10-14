import type { Metadata } from "next"
import { BlogListView } from "@/components/blog-list-view"
import { getPublishedPosts } from "@/lib/blog-db"
import { pageMetadata } from "@/lib/seo"
import type { BlogListItem } from "@/lib/blog-shared"

// Yazılar yönetim panelinden değişebilir; her istekte güncel liste okunur.
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(
    locale,
    "blog",
    "Blog | Evcil Hayvan Bakımı, Pet Otel ve Pet Taksi Rehberi - Petfendy",
    "Evcil hayvan bakımı, pet otel, pet kreş ve pet taksi ile ilgili Petfendy rehber yazıları ve ipuçları."
  )
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  let posts: BlogListItem[] = []
  try {
    posts = await getPublishedPosts()
  } catch (error) {
    console.error("Blog list error:", error)
  }
  return <BlogListView posts={posts} locale={locale} />
}
