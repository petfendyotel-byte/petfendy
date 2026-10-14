"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { authFetch, errorMessage, uploadImage } from "@/lib/admin-fetch"
import { BLOG_LIMITS, SEO_RECOMMENDED, slugify, stripHtml, type BlogListItem, type BlogPostDto } from "@/lib/blog-shared"
import { ArrowLeft, ExternalLink, ImageIcon, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react"

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  coverImageAlt: string
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt: string // datetime-local biçimi
  metaTitle: string
  metaDescription: string
}

const EMPTY_FORM: FormState = {
  title: "", slug: "", excerpt: "", content: "", coverImage: "", coverImageAlt: "", category: "", tags: [],
  author: "Petfendy Ekibi", published: false, publishedAt: "", metaTitle: "", metaDescription: "",
}

const pad = (n: number) => String(n).padStart(2, "0")
const toLocalInput = (iso: string | null): string => {
  if (!iso) return ""
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fromDto = (post: BlogPostDto): FormState => ({
  title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
  coverImage: post.coverImage ?? "", coverImageAlt: post.coverImageAlt ?? "", category: post.category,
  tags: post.tags, author: post.author, published: post.published, publishedAt: toLocalInput(post.publishedAt),
  metaTitle: post.metaTitle ?? "", metaDescription: post.metaDescription ?? "",
})
const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" }) : "-")

function statusOf(post: BlogListItem): { label: string; className: string } {
  if (!post.published) return { label: "Taslak", className: "bg-gray-100 text-gray-700" }
  if (post.publishedAt && new Date(post.publishedAt) > new Date()) return { label: "Zamanlanmış", className: "bg-amber-100 text-amber-800" }
  return { label: "Yayında", className: "bg-green-100 text-green-800" }
}

function Counter({ value, recommended, max }: { value: number; recommended: number; max: number }) {
  const over = value > recommended
  return (
    <span className={`text-xs ${value > max ? "text-red-600" : over ? "text-amber-600" : "text-muted-foreground"}`}>
      {value}/{recommended} {over ? "(arama sonuçlarında kesilebilir)" : ""}
    </span>
  )
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"list" | "edit">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [dirty, setDirty] = useState(false)
  const coverInput = useRef<HTMLInputElement>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setDirty(true)
  }

  const loadList = useCallback(async () => {
    try {
      const response = await authFetch("/api/blog?all=1", { cache: "no-store" })
      if (!response.ok) throw new Error(await errorMessage(response, "Yazılar yüklenemedi"))
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Yazılar yüklenemedi", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category))).sort(), [posts])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setSlugTouched(false)
    setTagInput("")
    setDirty(false)
    setEditorKey((k) => k + 1)
    setMode("edit")
  }

  const openEdit = async (id: string) => {
    setBusy(true)
    try {
      const response = await authFetch(`/api/blog/${id}`, { cache: "no-store" })
      if (!response.ok) throw new Error(await errorMessage(response, "Yazı yüklenemedi"))
      const post: BlogPostDto = await response.json()
      setForm(fromDto(post))
      setEditingId(post.id)
      setSlugTouched(true) // mevcut yazının adresi kendiliğinden değişmesin
      setTagInput("")
      setDirty(false)
      setEditorKey((k) => k + 1)
      setMode("edit")
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Yazı yüklenemedi", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const backToList = () => {
    if (dirty && !window.confirm("Kaydedilmemiş değişiklikler var. Listeye dönmek istiyor musunuz?")) return
    setMode("list")
    loadList()
  }

  const onTitleChange = (value: string) => {
    setForm((current) => ({ ...current, title: value, slug: slugTouched ? current.slug : slugify(value) }))
    setDirty(true)
  }

  const addTag = (raw: string) => {
    const pieces = raw.split(",").map((t) => t.trim()).filter(Boolean)
    if (pieces.length === 0) return
    const merged = Array.from(new Set([...form.tags, ...pieces])).slice(0, BLOG_LIMITS.tags)
    update("tags", merged)
    setTagInput("")
  }

  const handleCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      toast({ title: "Hata", description: "JPG, PNG, WebP veya GIF ve en çok 10MB olmalı", variant: "destructive" })
      return
    }
    setUploadingCover(true)
    try {
      update("coverImage", await uploadImage(file))
    } catch (error) {
      toast({ title: "Yüklenemedi", description: error instanceof Error ? error.message : "Bilinmeyen hata", variant: "destructive" })
    } finally {
      setUploadingCover(false)
    }
  }

  const save = async () => {
    if (form.title.trim().length < 3) {
      toast({ title: "Eksik bilgi", description: "Başlık en az 3 karakter olmalı", variant: "destructive" })
      return
    }
    if (stripHtml(form.content).length === 0 && !/<img\b/i.test(form.content)) {
      toast({ title: "Eksik bilgi", description: "İçerik boş olamaz", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      }
      const response = await authFetch(editingId ? `/api/blog/${editingId}` : "/api/blog", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(await errorMessage(response, "Yazı kaydedilemedi"))
      const saved: BlogPostDto = await response.json()
      setEditingId(saved.id)
      setForm((current) => ({ ...current, slug: saved.slug, publishedAt: toLocalInput(saved.publishedAt) }))
      setDirty(false)
      toast({ title: "✅ Kaydedildi", description: saved.published ? "Yazı yayında" : "Yazı taslak olarak kaydedildi" })
    } catch (error) {
      toast({ title: "Kaydedilemedi", description: error instanceof Error ? error.message : "Bilinmeyen hata", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (post: BlogListItem) => {
    if (!window.confirm(`"${post.title}" yazısı kalıcı olarak silinecek. Emin misiniz?`)) return
    setBusy(true)
    try {
      const response = await authFetch(`/api/blog/${post.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error(await errorMessage(response, "Yazı silinemedi"))
      setPosts((current) => current.filter((entry) => entry.id !== post.id))
      toast({ title: "🗑️ Silindi", description: "Yazı silindi" })
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Yazı silinemedi", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  // ---------------- Liste ----------------
  if (mode === "list") {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Blog Yönetimi</CardTitle>
              <CardDescription>Yazıları ekleyin, düzenleyin, yayınlayın veya silin. Taslaklar sitede görünmez.</CardDescription>
            </div>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" /> Yeni Yazı
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Yükleniyor...
            </div>
          ) : posts.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Henüz yazı yok. "Yeni Yazı" ile başlayın.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Görsel</th>
                    <th className="py-2 pr-3 font-medium">Başlık</th>
                    <th className="py-2 pr-3 font-medium hidden md:table-cell">Kategori</th>
                    <th className="py-2 pr-3 font-medium">Durum</th>
                    <th className="py-2 pr-3 font-medium hidden md:table-cell">Tarih</th>
                    <th className="py-2 text-right font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const status = statusOf(post)
                    return (
                      <tr key={post.id} className="border-b last:border-0">
                        <td className="py-2 pr-3">
                          {post.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.coverImage} alt="" className="h-12 w-16 rounded object-cover" />
                          ) : (
                            <div className="flex h-12 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="font-medium">{post.title}</div>
                          <div className="text-xs text-muted-foreground">/blog/{post.slug}</div>
                        </td>
                        <td className="py-2 pr-3 hidden md:table-cell">{post.category}</td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="py-2 pr-3 hidden md:table-cell">{formatDate(post.publishedAt ?? post.createdAt)}</td>
                        <td className="py-2">
                          <div className="flex justify-end gap-1">
                            {post.published && (
                              <Button asChild variant="ghost" size="sm" title="Sitede görüntüle">
                                <a href={`/tr/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Sitede görüntüle">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEdit(post.id)} disabled={busy}>
                              <Pencil className="w-4 h-4 mr-1" /> Düzenle
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => remove(post)} disabled={busy} aria-label="Sil">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // ---------------- Editör ----------------
  const previewTitle = truncate(form.metaTitle.trim() || form.title.trim() || "Yazı başlığı", SEO_RECOMMENDED.title + 10)
  const previewDescription = truncate(form.metaDescription.trim() || form.excerpt.trim() || stripHtml(form.content).slice(0, 200), SEO_RECOMMENDED.description)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={backToList}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Listeye dön
        </Button>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-600">Kaydedilmemiş değişiklikler var</span>}
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Sol: başlık, içerik */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="blog-title">Başlık</Label>
                <Input id="blog-title" value={form.title} maxLength={BLOG_LIMITS.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Yazı başlığı" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-slug">Adres (slug)</Label>
                <Input
                  id="blog-slug"
                  value={form.slug}
                  maxLength={BLOG_LIMITS.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    update("slug", slugify(e.target.value))
                  }}
                  placeholder="yazi-adresi"
                />
                <p className="text-xs text-muted-foreground break-all">petfendy.com/tr/blog/{form.slug || slugify(form.title) || "..."}</p>
                {editingId && form.published && (
                  <p className="text-xs text-amber-600">Yayındaki bir yazının adresini değiştirirseniz eski bağlantılar çalışmaz ve arama sıralaması etkilenebilir.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-excerpt">Kısa özet</Label>
                <Textarea id="blog-excerpt" rows={3} value={form.excerpt} maxLength={BLOG_LIMITS.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="Blog listesinde ve paylaşımlarda görünen kısa açıklama" />
                <p className="text-xs text-muted-foreground">{form.excerpt.length}/{BLOG_LIMITS.excerpt}</p>
              </div>
              <div className="space-y-2">
                <Label>İçerik</Label>
                <RichTextEditor
                  key={editorKey}
                  value={form.content}
                  onChange={(html) => update("content", html)}
                  onUploadImage={uploadImage}
                />
                <p className="text-xs text-muted-foreground">İpucu: Sayfa başlığı zaten yazı başlığıdır; bölümler için "Başlık 2", alt bölümler için "Başlık 3" kullanın. Resim eklerken açıklama (alt metin) yazmayı unutmayın.</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Arama Motoru (SEO) Ayarları</CardTitle>
              <CardDescription>Boş bırakırsanız başlık ve özet kullanılır.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blog-meta-title">Meta başlık</Label>
                  <Counter value={form.metaTitle.length} recommended={SEO_RECOMMENDED.title} max={BLOG_LIMITS.metaTitle} />
                </div>
                <Input id="blog-meta-title" value={form.metaTitle} maxLength={BLOG_LIMITS.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} placeholder={form.title || "Google'da görünecek başlık"} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blog-meta-desc">Meta açıklama</Label>
                  <Counter value={form.metaDescription.length} recommended={SEO_RECOMMENDED.description} max={BLOG_LIMITS.metaDescription} />
                </div>
                <Textarea id="blog-meta-desc" rows={3} value={form.metaDescription} maxLength={BLOG_LIMITS.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} placeholder={form.excerpt || "Google'da başlığın altında görünecek açıklama"} />
              </div>
              <div className="rounded-md border bg-white p-3">
                <p className="mb-1 text-xs text-muted-foreground">Google önizlemesi</p>
                <p className="truncate text-lg leading-tight text-blue-700">{previewTitle}</p>
                <p className="truncate text-sm text-green-700">petfendy.com › tr › blog › {form.slug || "..."}</p>
                <p className="text-sm text-gray-600">{previewDescription}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ: yayın, görsel, sınıflandırma */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Yayın</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="blog-published">{form.published ? "Yayında" : "Taslak"}</Label>
                <Switch id="blog-published" checked={form.published} onCheckedChange={(checked) => update("published", checked)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-date">Yayın tarihi</Label>
                <Input id="blog-date" type="datetime-local" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
                <p className="text-xs text-muted-foreground">Boş bırakırsanız kaydettiğiniz an kullanılır. Gelecek bir tarih verirseniz yazı o zamana kadar sitede görünmez.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-author">Yazar</Label>
                <Input id="blog-author" value={form.author} maxLength={BLOG_LIMITS.author} onChange={(e) => update("author", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Öne Çıkan Görsel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCover} />
              {form.coverImage ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt={form.coverImageAlt || "Öne çıkan görsel"} className="w-full rounded-md object-cover" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => coverInput.current?.click()} disabled={uploadingCover}>
                      {uploadingCover ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />} Değiştir
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { update("coverImage", ""); update("coverImageAlt", "") }}>
                      <X className="w-4 h-4 mr-1" /> Kaldır
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => coverInput.current?.click()} disabled={uploadingCover}>
                  {uploadingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />} Görsel yükle
                </Button>
              )}
              <div className="space-y-2">
                <Label htmlFor="blog-cover-alt">Görsel açıklaması (alt metin)</Label>
                <Input id="blog-cover-alt" value={form.coverImageAlt} maxLength={BLOG_LIMITS.altText} onChange={(e) => update("coverImageAlt", e.target.value)} placeholder="Görselde ne var? (SEO için)" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Kategori ve Etiketler</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blog-category">Kategori</Label>
                <Input id="blog-category" list="blog-categories" value={form.category} maxLength={BLOG_LIMITS.category} onChange={(e) => update("category", e.target.value)} placeholder="Genel" />
                <datalist id="blog-categories">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-tags">Etiketler (SEO)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" aria-label={`${tag} etiketini kaldır`} onClick={() => update("tags", form.tags.filter((t) => t !== tag))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="blog-tags"
                  value={tagInput}
                  maxLength={BLOG_LIMITS.tag}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.includes(",")) addTag(value)
                    else setTagInput(value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                  onBlur={() => addTag(tagInput)}
                  placeholder="Etiket yazıp Enter'a basın (ör. pet taksi)"
                />
                <p className="text-xs text-muted-foreground">En fazla {BLOG_LIMITS.tags} etiket. Etiketler yazının anahtar kelimeleri olarak da kullanılır.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
