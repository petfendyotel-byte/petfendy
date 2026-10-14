"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken, setAuthToken } from "@/lib/storage"
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react"

interface GalleryItem {
  id: string
  url: string
  title?: string
  description?: string
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 10 * 1024 * 1024

async function refreshToken(): Promise<boolean> {
  const refresh = typeof window !== "undefined" ? localStorage.getItem("petfendy_refresh_token") : null
  if (!refresh) return false
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    })
    if (!response.ok) return false
    const data = await response.json()
    const access = data.data?.tokens?.accessToken
    if (!access) return false
    setAuthToken(access)
    if (data.data?.tokens?.refreshToken) localStorage.setItem("petfendy_refresh_token", data.data.tokens.refreshToken)
    return true
  } catch {
    return false
  }
}

// Giriş bilgisiyle istek atar; oturum süresi dolmuşsa (401) yenileyip bir kez tekrar dener.
async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const send = () =>
    fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${getAuthToken()}` } })
  let response = await send()
  if (response.status === 401 && (await refreshToken())) response = await send()
  return response
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}))
  if (response.status === 401) return "Oturum sona erdi. Lütfen çıkış yapıp tekrar giriş yapın."
  return body.error ? `${body.error}` : fallback
}

// Başlık ve açıklama kutuları; odak kutudan çıkınca (blur) iki alan birlikte kaydedilir.
function TextFields({ item, onSave }: { item: GalleryItem; onSave: (title: string, description: string) => void }) {
  const [title, setTitle] = useState(item.title ?? "")
  const [description, setDescription] = useState(item.description ?? "")
  const save = () => onSave(title.trim(), description.trim())
  return (
    <>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        placeholder="Başlık (isteğe bağlı)"
        maxLength={120}
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={save}
        placeholder="Açıklama (isteğe bağlı)"
        maxLength={300}
      />
    </>
  )
}

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setItems(data.images || [])
    } catch {
      toast({ title: "Hata", description: "Galeri yüklenemedi", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ""
    if (files.length === 0) return

    setBusy(true)
    let added = 0
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Hata", description: `${file.name}: yalnızca JPG, PNG, WebP veya GIF yüklenebilir`, variant: "destructive" })
        continue
      }
      if (file.size > MAX_SIZE) {
        toast({ title: "Hata", description: `${file.name}: dosya 10MB'tan büyük`, variant: "destructive" })
        continue
      }
      try {
        const form = new FormData()
        form.append("file", file)
        form.append("type", "image")
        const uploaded = await authFetch("/api/upload", { method: "POST", body: form })
        if (!uploaded.ok) throw new Error(await errorMessage(uploaded, "Yükleme başarısız"))
        const uploadData = await uploaded.json()
        const url = uploadData?.file?.url
        if (!url) throw new Error("Yükleme adresi alınamadı")

        const saved = await authFetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
        if (!saved.ok) throw new Error(await errorMessage(saved, "Galeriye eklenemedi"))
        added++
      } catch (error) {
        toast({
          title: "Eklenemedi",
          description: `${file.name}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
          variant: "destructive",
        })
      }
    }
    await load()
    setBusy(false)
    if (added > 0) toast({ title: "✅ Eklendi", description: `${added} resim galeriye eklendi` })
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    try {
      const response = await authFetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: next.map((item) => item.id) }),
      })
      if (!response.ok) throw new Error(await errorMessage(response, "Sıralama kaydedilemedi"))
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Sıralama kaydedilemedi", variant: "destructive" })
      load()
    }
  }

  const remove = async (item: GalleryItem) => {
    if (!window.confirm("Bu resmi galeriden kaldırmak istiyor musunuz?")) return
    setBusy(true)
    try {
      const response = await authFetch(`/api/gallery/${item.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error(await errorMessage(response, "Resim silinemedi"))
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      toast({ title: "🗑️ Silindi", description: "Resim galeriden kaldırıldı" })
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Resim silinemedi", variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const saveText = async (item: GalleryItem, title: string, description: string) => {
    if ((item.title ?? "") === title && (item.description ?? "") === description) return
    try {
      const response = await authFetch(`/api/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      if (!response.ok) throw new Error(await errorMessage(response, "Kaydedilemedi"))
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, title: title || undefined, description: description || undefined } : entry
        )
      )
    } catch (error) {
      toast({ title: "Hata", description: error instanceof Error ? error.message : "Kaydedilemedi", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Galeri Yönetimi</CardTitle>
            <CardDescription>
              Resim ekleyin, oklarla sırasını değiştirin veya silin. Sıra galeri sayfasında soldan sağa, yukarıdan aşağıya görünür.
            </CardDescription>
          </div>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            <Button onClick={() => fileInput.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Resim Ekle
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Galeride resim yok. "Resim Ekle" ile başlayın.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-card">
                <div className="relative h-48 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.title || "Galeri resmi"} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{index + 1}</span>
                </div>
                <div className="p-3 space-y-2">
                  <TextFields item={item} onSave={(title, description) => saveText(item, title, description)} />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => move(index, -1)}
                        disabled={busy || index === 0}
                        aria-label="Öne al"
                        title="Öne al"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => move(index, 1)}
                        disabled={busy || index === items.length - 1}
                        aria-label="Sona al"
                        title="Sona al"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => remove(item)} disabled={busy} aria-label="Sil">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
