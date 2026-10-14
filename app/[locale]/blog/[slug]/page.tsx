import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogDetailView } from "@/components/blog-detail-view"
import { getPublishedPostBySlug, getRelatedPosts, sanitizeBlogHtml } from "@/lib/blog-db"
import { stripHtml, type BlogListItem, type BlogPostDto } from "@/lib/blog-shared"

// Yazılar yönetim panelinden değişebilir; her istekte güncel içerik okunur.
export const dynamic = "force-dynamic"

type Params = Promise<{ locale: string; slug: string }>

async function loadPost(slug: string): Promise<BlogPostDto | null> {
  try {
    return await getPublishedPostBySlug(slug)
  } catch (error) {
    console.error("Blog post error:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: "Yazı bulunamadı | Petfendy", robots: { index: false, follow: false } }

  const title = post.metaTitle || `${post.title} | Petfendy`
  const description = post.metaDescription || post.excerpt || stripHtml(post.content).slice(0, 155)
  const path = `/${locale}/blog/${post.slug}`
  const images = post.coverImage ? [{ url: post.coverImage, alt: post.coverImageAlt || post.title }] : undefined

  return {
    title,
    description,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    authors: [{ name: post.author }],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: `https://petfendy.com${path}`,
      siteName: "Petfendy - Ankara Pet Otel",
      locale: "tr_TR",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: post.coverImage ? [post.coverImage] : undefined },
  }
}

export default async function BlogDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  let related: BlogListItem[] = []
  try {
    related = await getRelatedPosts(post)
  } catch (error) {
    console.error("Blog related error:", error)
  }

  const safePost: BlogPostDto = { ...post, content: sanitizeBlogHtml(post.content) }
  const url = `https://petfendy.com/${locale}/blog/${post.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Petfendy", logo: { "@type": "ImageObject", url: "https://petfendy.com/images/petfendy-main-logo.png" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        // "<" karakteri kaçırılır: içerikteki bir "</script>" bloğu kapatamasın
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BlogDetailView post={safePost} related={related} locale={locale} />
    </>
  )
}
