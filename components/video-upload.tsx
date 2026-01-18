"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Video, Loader2, Youtube, Link as LinkIcon, Play } from "lucide-react"

interface VideoUploadProps {
  existingVideos: Array<{ 
    type: 'upload' | 'youtube', 
    url: string,
    thumbnail?: string,
    watchUrl?: string
  }>
  onVideosChange: (videos: Array<{ 
    type: 'upload' | 'youtube', 
    url: string,
    thumbnail?: string,
    watchUrl?: string
  }>) => void
  maxVideos?: number
}

export function VideoUpload({ existingVideos, onVideosChange, maxVideos = 5 }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [videos, setVideos] = useState<Array<{ 
    type: 'upload' | 'youtube', 
    url: string,
    thumbnail?: string,
    watchUrl?: string
  }>>(existingVideos || [])
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
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // Get YouTube watch URL
  const getYouTubeWatchUrl = (videoId: string): string => {
    return `https://www.youtube.com/watch?v=${videoId}`
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

    // Store the video ID instead of embed URL for better handling
    const newVideos = [...videos, { 
      type: 'youtube' as const, 
      url: videoId, // Store just the video ID
      thumbnail: getYouTubeThumbnail(videoId),
      watchUrl: getYouTubeWatchUrl(videoId)
    }]
    setVideos(newVideos)
    onVideosChange(newVideos)
    setYoutubeUrl("")

    toast({
      title: "✅ Eklendi",
      description: "YouTube videosu eklendi"
    })
  }

  // Simplified video compression - just reduce quality for faster upload
  const compressVideo = async (file: File): Promise<File> => {
    // For now, just return the original file to avoid compression issues
    // TODO: Implement proper server-side video compression
    return file
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

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/avi"]

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Hata",
          description: "Sadece MP4, WebM, OGG, MOV, AVI formatları destekleniyor",
          variant: "destructive"
        })
        return
      }

      // Max 200MB for videos
      if (file.size > 200 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Video boyutu maksimum 200MB olabilir",
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
        // Show upload toast
        toast({
          title: "📤 Yükleniyor...",
          description: `${file.name} MinIO'ya yükleniyor...`,
        })

        // Use original file for faster upload
        let finalFile: File = file

        // Only compress very large files (>50MB) by skipping compression for now
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "ℹ️ Büyük Dosya",
            description: `${file.name} büyük bir dosya, yükleme biraz zaman alabilir`,
          })
        }

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
        
        toast({
          title: "✅ Yüklendi",
          description: `${file.name} başarıyla MinIO'ya yüklendi`,
        })
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
            MP4, WebM, OGG, MOV, AVI - Maksimum 200MB
            <br />
            Videolar MinIO CDN'e yüklenir
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
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black group cursor-pointer"
                         onClick={() => window.open(video.watchUrl || `https://www.youtube.com/watch?v=${video.url}`, '_blank')}>
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.url}/maxresdefault.jpg`}
                        alt="YouTube Video Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to smaller thumbnail
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.url}/hqdefault.jpg`
                        }}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors">
                          <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                      {/* YouTube Logo */}
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        YouTube
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive" className="gap-1">
                        <Youtube className="w-3 h-3" />
                        YouTube
                      </Badge>
                      <span className="text-xs text-muted-foreground">Tıkla ve izle</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                      <video
                        src={video.url}
                        controls
                        preload="metadata"
                        className="w-full h-full object-contain"
                        controlsList="nodownload"
                        onError={(e) => {
                          // Silently handle video load errors - don't spam console
                          // console.error('Video load error:', e)
                        }}
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
