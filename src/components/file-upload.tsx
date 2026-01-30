"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react"

interface FileUploadProps {
  type: "image" | "video"
  existingFiles: string[]
  onFilesChange: (urls: string[]) => void
  maxFiles?: number
}

export function FileUpload({ type, existingFiles, onFilesChange, maxFiles = 10 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>(existingFiles)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validate file count
    if (previews.length + files.length > maxFiles) {
      toast({
        title: "Hata",
        description: `Maksimum ${maxFiles} dosya yükleyebilirsiniz`,
        variant: "destructive"
      })
      return
    }

    // Validate file types
    const allowedTypes = type === "image"
      ? ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
      : ["video/mp4", "video/webm", "video/ogg"]

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Hata",
          description: `Sadece ${type === "image" ? "resim" : "video"} dosyaları yükleyebilirsiniz`,
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "Hata",
          description: `Dosya boyutu çok büyük. Maksimum ${type === "image" ? "10MB" : "50MB"}`,
          variant: "destructive"
        })
        return
      }
    }

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const newUrls = [...previews, ...data.urls]
      setPreviews(newUrls)
      onFilesChange(newUrls)

      toast({
        title: "✅ Başarılı",
        description: `${files.length} dosya yüklendi`
      })

      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Hata",
        description: "Dosya yükleme başarısız",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    onFilesChange(newPreviews)

    toast({
      title: "Silindi",
      description: "Dosya listeden kaldırıldı"
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || previews.length >= maxFiles}
          onClick={() => document.getElementById(`file-input-${type}`)?.click()}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : type === "image" ? (
            <ImageIcon className="w-4 h-4" />
          ) : (
            <Video className="w-4 h-4" />
          )}
          {uploading ? "Yükleniyor..." : `${type === "image" ? "Resim" : "Video"} Yükle`}
        </Button>
        <span className="text-xs text-muted-foreground">
          {previews.length}/{maxFiles}
        </span>
        <Input
          id={`file-input-${type}`}
          type="file"
          accept={type === "image" ? "image/*" : "video/*"}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted">
              {type === "image" ? (
                <div className="relative h-32 w-full">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-full flex items-center justify-center bg-black/5">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                {index + 1}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {type === "image"
          ? "JPG, PNG, WebP, GIF - Maksimum 10MB"
          : "MP4, WebM, OGG - Maksimum 50MB"}
      </p>
    </div>
  )
}
