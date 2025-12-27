"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "./file-upload"
import { VideoUpload } from "./video-upload"
import { X, Save, Image as ImageIcon, Video } from "lucide-react"
import type { HotelRoom } from "@/lib/types"

interface RoomEditModalProps {
  isOpen: boolean
  onClose: () => void
  room: HotelRoom | null
  onSave: (updatedRoom: HotelRoom) => void
  isLoading?: boolean
}

export function RoomEditModal({ isOpen, onClose, room, onSave, isLoading = false }: RoomEditModalProps) {
  const [editedRoom, setEditedRoom] = useState<HotelRoom | null>(room)
  const [roomImages, setRoomImages] = useState<string[]>(room?.images || [])
  const [roomVideos, setRoomVideos] = useState<{ type: 'youtube' | 'upload', url: string }[]>(room?.videos || [])

  // Reset form when room changes
  useEffect(() => {
    if (room) {
      setEditedRoom(room)
      setRoomImages(room.images || [])
      setRoomVideos(room.videos || [])
    }
  }, [room])

  const handleSave = () => {
    if (!editedRoom) return

    const updatedRoom: HotelRoom = {
      ...editedRoom,
      images: roomImages,
      videos: roomVideos,
      amenities: editedRoom.amenities || [],
      features: editedRoom.features || [],
    }

    onSave(updatedRoom)
    onClose()
  }

  const handleInputChange = (field: keyof HotelRoom, value: any) => {
    if (!editedRoom) return
    setEditedRoom({ ...editedRoom, [field]: value })
  }

  const handleAmenitiesChange = (value: string) => {
    if (!editedRoom) return
    const amenities = value.split(",").map((a) => a.trim()).filter(a => a)
    setEditedRoom({ ...editedRoom, amenities })
  }

  const handleFeaturesChange = (value: string) => {
    if (!editedRoom) return
    const features = value.split(",").map((f) => f.trim()).filter(f => f)
    setEditedRoom({ ...editedRoom, features })
  }

  if (!editedRoom) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Oda Düzenle: {editedRoom.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Oda Bilgileri</TabsTrigger>
            <TabsTrigger value="images">Resimler</TabsTrigger>
            <TabsTrigger value="videos">Videolar</TabsTrigger>
            <TabsTrigger value="amenities">Olanaklar</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Oda Adı</Label>
                    <Input
                      id="name"
                      value={editedRoom.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Oda adını girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Oda Tipi</Label>
                    <select
                      id="type"
                      value={editedRoom.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="standard">Standart</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Kapasite</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={editedRoom.capacity}
                      onChange={(e) => handleInputChange("capacity", parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat (Gece)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editedRoom.pricePerNight}
                      onChange={(e) => handleInputChange("pricePerNight", parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={editedRoom.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Oda hakkında detaylı açıklama"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editedRoom.available}
                    onChange={(e) => handleInputChange("available", e.target.checked)}
                  />
                  <Label htmlFor="available">Oda Müsait</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Oda Resimleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  type="image"
                  existingFiles={roomImages}
                  onFilesChange={setRoomImages}
                  maxFiles={10}
                />
                {roomImages.length > 0 && (
                  <div className="mt-4">
                    <Badge variant="secondary">
                      {roomImages.length} resim yüklendi
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Oda Videoları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoUpload
                  existingVideos={roomVideos}
                  onVideosChange={setRoomVideos}
                  maxVideos={5}
                />
                {roomVideos.length > 0 && (
                  <div className="mt-4">
                    <Badge variant="secondary">
                      {roomVideos.length} video yüklendi
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Olanaklar ve Özellikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amenities">Olanaklar (virgülle ayırın)</Label>
                  <Input
                    id="amenities"
                    value={editedRoom.amenities?.join(", ") || ""}
                    onChange={(e) => handleAmenitiesChange(e.target.value)}
                    placeholder="Yatak, Klima, Oyuncak, Kamera, 7/24 Bakım"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
                  <Input
                    id="features"
                    value={editedRoom.features?.join(", ") || ""}
                    onChange={(e) => handleFeaturesChange(e.target.value)}
                    placeholder="Günlük temizlik, Doğal ışık, Ses yalıtımı"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
