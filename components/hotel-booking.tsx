"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import type { HotelRoom } from "@/lib/types"
import { mockHotelRooms } from "@/lib/mock-data"
import { setTempReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from 'next-intl';
import { toast } from "@/components/ui/use-toast"
import { RoomDetailModal } from "@/components/room-detail-modal"
import { Info, Play } from "lucide-react"

export function HotelBooking() {
  const t = useTranslations('hotel');
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [rooms, setRooms] = useState<HotelRoom[]>(mockHotelRooms)
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null)
  const [detailRoom, setDetailRoom] = useState<HotelRoom | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [petCount, setPetCount] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load rooms from API (or localStorage as fallback)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms?available=true')
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setRooms(data)
            return
          }
        }
      } catch (error) {
        console.error('Failed to fetch rooms from API:', error)
      }
      
      // Fallback to localStorage
      const storedRooms = localStorage.getItem("petfendy_rooms")
      if (storedRooms) {
        const parsedRooms = JSON.parse(storedRooms)
        if (parsedRooms.length > 0) {
          setRooms(parsedRooms)
        }
      }
    }

    fetchRooms()

    // Listen for room updates
    const handleRoomsUpdate = () => {
      fetchRooms()
    }

    window.addEventListener('roomsUpdated', handleRoomsUpdate)
    return () => window.removeEventListener('roomsUpdated', handleRoomsUpdate)
  }, [])

  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 0
  }

  const calculateTotal = (): number => {
    if (!selectedRoom) return 0
    const nights = calculateNights()
    const basePrice = selectedRoom.pricePerNight * nights

    // İlk hayvan fiyata dahil, ek hayvanlar için %50 ücret
    const additionalPetFee = petCount > 1 ? (selectedRoom.pricePerNight * 0.5) * (petCount - 1) * nights : 0

    return basePrice + additionalPetFee
  }

  const handleBooking = () => {
    setError("")
    setSuccess("")

    if (!selectedRoom) {
      setError(t('selectRoomError'))
      return
    }

    if (!checkInDate || !checkOutDate) {
      setError(t('selectDatesError'))
      return
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (checkOut <= checkIn) {
      setError(t('dateValidationError'))
      return
    }

    if (petCount < 1) {
      setError("Lütfen en az 1 hayvan seçin")
      return
    }

    if (petCount > selectedRoom.capacity) {
      setError(`Bu oda en fazla ${selectedRoom.capacity} hayvan kapasitesine sahiptir`)
      return
    }

    const nights = calculateNights()
    const total = calculateTotal()

    // Create reservation data
    const reservationData = {
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkInDate,
      checkOutDate,
      nights,
      petCount,
      specialRequests,
      additionalServices: [], // No additional services in this old component
      basePrice: total,
      servicesTotal: 0,
      totalPrice: total,
    }

    setTempReservation(reservationData)

    // Show toast notification
    toast({
      title: "✅ Rezervasyon Hazır!",
      description: `${selectedRoom.name} - ${petCount} hayvan, ${nights} gece. Ödeme sayfasına yönlendiriliyorsunuz...`,
      duration: 2000,
    })

    // Redirect to checkout
    setTimeout(() => {
      router.push(`/${locale}/checkout`)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.filter(r => r.available).map((room) => (
            <Card
              key={room.id}
              className={`cursor-pointer transition-all overflow-hidden ${selectedRoom?.id === room.id ? "ring-2 ring-primary" : ""}`}
            >
              {/* Room Image */}
              {room.images && room.images.length > 0 ? (
                <div 
                  className="relative h-40 w-full"
                  onClick={() => setSelectedRoom(room)}
                >
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                  {room.images.length > 1 && (
                    <Badge variant="secondary" className="absolute bottom-2 left-2">
                      +{room.images.length - 1} resim
                    </Badge>
                  )}
                  {room.videos && room.videos.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Video
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="h-32 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center"
                  onClick={() => setSelectedRoom(room)}
                >
                  <span className="text-4xl">
                    {room.type === "standard" ? "🛏️" : room.type === "deluxe" ? "⭐" : "👑"}
                  </span>
                </div>
              )}

              {/* Detail Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setDetailRoom(room)
                  setShowDetailModal(true)
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
              >
                <Info className="w-4 h-4 text-white" />
              </button>

              <CardHeader onClick={() => setSelectedRoom(room)}>
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <CardDescription>{t(`roomTypes.${room.type}`)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3" onClick={() => setSelectedRoom(room)}>
                <div>
                  <p className="text-sm text-muted-foreground">{t('capacity')}</p>
                  <p className="font-semibold">{room.capacity} {t('pets')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('price')}</p>
                  <p className="text-xl font-bold text-primary">₺{room.pricePerNight}{t('perNight')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('amenities')}</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{room.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={detailRoom}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setDetailRoom(null)
        }}
        onSelect={(room) => setSelectedRoom(room)}
        locale={locale}
      />

      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>{t('roomDetails', { roomName: selectedRoom.name })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('checkIn')}</label>
                <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('checkOut')}</label>
                <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hayvan Sayısı (Kapasite: {selectedRoom.capacity})</label>
              <Input
                type="number"
                min="1"
                max={selectedRoom.capacity}
                value={petCount}
                onChange={(e) => setPetCount(parseInt(e.target.value) || 1)}
                placeholder="Kaç hayvan?"
              />
              {petCount > 1 && (
                <p className="text-xs text-muted-foreground">
                  İlk hayvan fiyata dahil. Ek {petCount - 1} hayvan için gecelik +₺{(selectedRoom.pricePerNight * 0.5 * (petCount - 1)).toFixed(2)} ek ücret.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('specialRequests')}</label>
              <Input
                type="text"
                placeholder={t('specialRequestsPlaceholder')}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            {checkInDate && checkOutDate && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t('nights')}:</span>
                  <span className="font-semibold">{calculateNights()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('nightPrice')}:</span>
                  <span className="font-semibold">₺{selectedRoom.pricePerNight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hayvan Sayısı:</span>
                  <span className="font-semibold">{petCount}</span>
                </div>
                {petCount > 1 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Ek Hayvan Ücreti ({petCount - 1} hayvan):</span>
                    <span className="font-semibold">
                      +₺{((selectedRoom.pricePerNight * 0.5) * (petCount - 1) * calculateNights()).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>{t('total')}:</span>
                  <span className="text-primary">₺{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleBooking} className="w-full" size="lg">
              Satın Al
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
