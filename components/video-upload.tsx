"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Video, Loader2, Youtube, Link as LinkIcon } from "lucide-react"

interface VideoUploadProps {
  existingVideos: Array<{ type: 'upload' | 'youtube', url: string }>
  onVideosChange: (videos: Array<{ type: 'upload' | 'youtube', url: string }>) => void
  maxVideos?: number
}

export function VideoUpload({ existingVideos, onVideosChange, maxVideos = 5 }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [videos, setVideos] = useState<Array<{ type: 'upload' | 'youtube', url: string }>>(existingVideos || [])
  const [youtubeUrl, setYoutubeUrl] = useState("")

  // Sync with external changes (important for edit mode)
  useEffect(() => {
    setVideos(existingVideos || [])
  }, [existingVideos])

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Handle YouTube URL
  const handleAddYoutubeUrl = () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen YouTube URL'si girin",
        variant: "destructive"
      })
      return
    }

    const videoId = extractYoutubeId(youtubeUrl)
    if (!videoId) {
      toast({
        title: "Hata",
        description: "Geçersiz YouTube URL'si",
        variant: "destructive"
      })
      return
    }

    if (videos.length >= maxVideos) {
      toast({
        title: "Hata",
        description: `Maksimum ${maxVideos} video ekleyebilirsiniz`,
        variant: "destructive"
      })
      return
    }

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`
    const newVideos = [...videos, { type: 'youtube' as const, url: embedUrl }]
    setVideos(newVideos)
    onVideosChange(newVideos)
    setYoutubeUrl("")

    toast({
      title: "✅ Eklendi",
      description: "YouTube videosu eklendi"
    })
  }

  // Compress video using canvas and MediaRecorder
  const compressVideo = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        video.currentTime = 0
      }

      video.onseeked = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Reduce dimensions by 50% for compression
        const scale = 0.7
        canvas.width = video.videoWidth * scale
        canvas.height = video.videoHeight * scale

        const stream = canvas.captureStream()
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
          videoBitsPerSecond: 1000000 // 1 Mbps
        })

        const chunks: Blob[] = []
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data)
          }
        }

        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: 'video/webm' })
          resolve(compressedBlob)
        }

        mediaRecorder.start()

        // Draw frames
        const fps = 24
        const interval = 1000 / fps
        let lastTime = 0

        const drawFrame = (currentTime: number) => {
          if (currentTime - lastTime >= interval && ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            lastTime = currentTime
          }

          if (video.currentTime < video.duration) {
            video.currentTime += 1 / fps
            requestAnimationFrame(drawFrame)
          } else {
            mediaRecorder.stop()
          }
        }

        requestAnimationFrame(drawFrame)
      }

      video.onerror = () => {
        reject(new Error('Video loading failed'))
      }

      video.src = URL.createObjectURL(file)
      video.load()
    })
  }

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (videos.length + files.length > maxVideos) {
      toast({
        title: "Hata",
        description: `Maksimum ${maxVideos} video ekleyebilirsiniz`,
        variant: "destructive"
      })
      return
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Hata",
          description: "Sadece MP4, WebM, OGG, MOV formatları destekleniyor",
          variant: "destructive"
        })
        return
      }

      // Max 100MB
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Video boyutu maksimum 100MB olabilir",
          variant: "destructive"
        })
        return
      }
    }

    setUploading(true)
    setCompressing(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        // Show compression toast
        toast({
          title: "🔄 Sıkıştırılıyor...",
          description: `${file.name} sıkıştırılıyor (Bu işlem 1-2 dakika sürebilir)`,
        })

        // Compress video
        let finalFile: File | Blob = file

        // Only compress if file is larger than 10MB
        if (file.size > 10 * 1024 * 1024) {
          try {
            const compressedBlob = await compressVideo(file)
            const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)
            const compressedSizeMB = (compressedBlob.size / (1024 * 1024)).toFixed(2)

            toast({
              title: "✅ Sıkıştırıldı",
              description: `${originalSizeMB}MB → ${compressedSizeMB}MB`,
            })

            finalFile = new File([compressedBlob], file.name, { type: 'video/webm' })
          } catch (error) {
            console.error('Compression error:', error)
            toast({
              title: "⚠️ Uyarı",
              description: "Sıkıştırma başarısız, orijinal dosya yüklenecek",
            })
          }
        }

        setCompressing(false)

        // Upload file - use 'file' key to match API
        const formData = new FormData()
        formData.append('file', finalFile)
        formData.append('type', 'video')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        // API returns { file: { url: ... } }
        uploadedUrls.push(data.file.url)
      }

      const newVideos = [
        ...videos,
        ...uploadedUrls.map(url => ({ type: 'upload' as const, url }))
      ]
      setVideos(newVideos)
      onVideosChange(newVideos)

      toast({
        title: "✅ Başarılı",
        description: `${files.length} video yüklendi`
      })

      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Hata",
        description: "Video yükleme başarısız",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setCompressing(false)
    }
  }

  const handleRemove = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
    onVideosChange(newVideos)

    toast({
      title: "Silindi",
      description: "Video kaldırıldı"
    })
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Video Yükle
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2">
            <Youtube className="w-4 h-4" />
            YouTube Linki
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading || videos.length >= maxVideos}
              onClick={() => document.getElementById('video-file-input')?.click()}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {compressing ? "Sıkıştırılıyor..." : uploading ? "Yükleniyor..." : "Video Seç"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {videos.length}/{maxVideos}
            </span>
            <Input
              id="video-file-input"
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, OGG, MOV - Maksimum 100MB
            <br />
            10MB'den büyük videolar otomatik sıkıştırılır
          </p>
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube Video URL'si</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddYoutubeUrl()}
              />
              <Button
                type="button"
                onClick={handleAddYoutubeUrl}
                disabled={videos.length >= maxVideos}
                className="gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Ekle
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              YouTube video linki yapıştırın (youtube.com veya youtu.be)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Previews */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {videos.map((video, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-3">
                {video.type === 'youtube' ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={video.url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive" className="gap-1">
                        <Youtube className="w-3 h-3" />
                        YouTube
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Video className="w-3 h-3" />
                      Yüklendi
                    </Badge>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
