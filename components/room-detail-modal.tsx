"use client"

import { useState } from "react"
import Image from "next/image"
import type { HotelRoom } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Bed, 
  Users, 
  Check,
  Play,
  ExternalLink
} from "lucide-react"

interface RoomDetailModalProps {
  room: HotelRoom | null
  isOpen: boolean
  onClose: () => void
  onSelect?: (room: HotelRoom) => void
  locale?: string
}

export function RoomDetailModal({ room, isOpen, onClose, onSelect, locale = 'tr' }: RoomDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  if (!room) return null

  const images = room.images || []
  const videos = room.videos || []
  const hasImages = images.length > 0
  const hasVideos = videos.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      standard: { tr: "Standart Oda", en: "Standard Room" },
      deluxe: { tr: "Deluxe Oda", en: "Deluxe Room" },
      suite: { tr: "Suit Oda", en: "Suite Room" }
    }
    return labels[type]?.[locale] || type
  }

  const getRoomTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      standard: "🛏️",
      deluxe: "⭐",
      suite: "👑"
    }
    return emojis[type] || "🏨"
  }

  const getYouTubeEmbedUrl = (url: string) => {
    // YouTube URL'lerini embed formatına çevir
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>{room.name} - {getRoomTypeLabel(room.type)}</DialogTitle>
        </VisuallyHidden>
        {/* Image Gallery */}
        <div className="relative">
          {hasImages ? (
            <div className="relative h-72 md:h-96 w-full bg-gray-100">
              <Image
                src={images[currentImageIndex]}
                alt={`${room.name} - ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Video Button */}
              {hasVideos && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  {locale === 'tr' ? 'Video İzle' : 'Watch Video'}
                </button>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
              <span className="text-6xl">{getRoomTypeEmoji(room.type)}</span>
            </div>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === currentImageIndex ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getRoomTypeEmoji(room.type)}</span>
                <h2 className="text-2xl font-bold">{room.name}</h2>
              </div>
              <Badge variant="secondary" className="text-sm">
                {getRoomTypeLabel(room.type)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-500">₺{room.pricePerNight}</p>
              <p className="text-sm text-muted-foreground">
                {locale === 'tr' ? '/ gece' : '/ night'}
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex gap-6 py-4 border-y">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>
                {room.capacity} {locale === 'tr' ? 'evcil hayvan' : 'pets'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-muted-foreground" />
              <span>{getRoomTypeLabel(room.type)}</span>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div>
              <h3 className="font-semibold mb-2">
                {locale === 'tr' ? 'Açıklama' : 'Description'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                {locale === 'tr' ? 'Olanaklar' : 'Amenities'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {room.features && room.features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                {locale === 'tr' ? 'Özellikler' : 'Features'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {onSelect && (
            <Button 
              onClick={() => {
                onSelect(room)
                onClose()
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-lg py-6"
            >
              {locale === 'tr' ? 'Bu Odayı Seç' : 'Select This Room'} - ₺{room.pricePerNight}/{locale === 'tr' ? 'gece' : 'night'}
            </Button>
          )}
        </div>

        {/* Video Modal */}
        {showVideo && hasVideos && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              
              {videos[currentVideoIndex].type === 'youtube' ? (
                <div className="aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(videos[currentVideoIndex].url)}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={videos[currentVideoIndex].url}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                />
              )}

              {/* Video Navigation */}
              {videos.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentVideoIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        idx === currentVideoIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
