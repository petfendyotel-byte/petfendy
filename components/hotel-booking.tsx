"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import type { HotelRoom } from "@/lib/types"
import { mockHotelRooms } from "@/lib/mock-data"
import { setTempReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from 'next-intl';
import { toast } from "@/components/ui/use-toast"

export function HotelBooking() {
  const t = useTranslations('hotel');
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [rooms] = useState<HotelRoom[]>(mockHotelRooms)
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [petCount, setPetCount] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
          {rooms.map((room) => (
            <Card
              key={room.id}
              className={`cursor-pointer transition-all ${selectedRoom?.id === room.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedRoom(room)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <CardDescription>{t(`roomTypes.${room.type}`)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                  <ul className="text-sm space-y-1">
                    {room.amenities.map((amenity, idx) => (
                      <li key={idx}>• {amenity}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
