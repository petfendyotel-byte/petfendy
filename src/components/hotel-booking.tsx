"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import type { HotelRoom } from "@/lib/types"
import { mockHotelRooms } from "@/lib/mock-data"
import { setTempReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  
  const [petInfo, setPetInfo] = useState<Array<{ name: string; type: string; age: number }>>([
    { name: "", type: "dog", age: 0 }
  ])

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
    
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      setError("Lütfen iletişim bilgilerinizi doldurun")
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestInfo.email)) {
      setError("Lütfen geçerli bir e-posta adresi girin")
      return
    }
    
    const validPets = petInfo.filter(pet => pet.name && pet.age > 0)
    if (validPets.length === 0) {
      setError("Lütfen en az bir hayvan bilgisi girin")
      return
    }

    const nights = calculateNights()
    const total = calculateTotal()

    const reservationData = {
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkInDate,
      checkOutDate,
      nights,
      petCount,
      specialRequests,
      additionalServices: [],
      basePrice: total,
      servicesTotal: 0,
      totalPrice: total,
      guestInfo,
      petInfo: validPets,
    }

    setTempReservation(reservationData)

    toast({
      title: "✅ Rezervasyon Hazır!",
      description: `${selectedRoom.name} - ${petCount} hayvan, ${nights} gece. Ödeme sayfasına yönlendiriliyorsunuz...`,
      duration: 2000,
    })

    setTimeout(() => {
      router.push(`/${locale}/checkout`)
    }, 500)
  }
  
  const updatePetInfo = (index: number, field: string, value: string | number) => {
    const updated = [...petInfo]
    updated[index] = { ...updated[index], [field]: value }
    setPetInfo(updated)
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
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1
                  setPetCount(count)
                  const newPetInfo = Array(count).fill(null).map((_, i) => 
                    petInfo[i] || { name: "", type: "dog", age: 0 }
                  )
                  setPetInfo(newPetInfo)
                }}
                placeholder="Kaç hayvan?"
              />
              {petCount > 1 && (
                <p className="text-xs text-muted-foreground">
                  İlk hayvan fiyata dahil. Ek {petCount - 1} hayvan için gecelik +₺{(selectedRoom.pricePerNight * 0.5 * (petCount - 1)).toFixed(2)} ek ücret.
                </p>
              )}
            </div>
            
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">İletişim Bilgileriniz *</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Ad Soyad *</Label>
                  <Input
                    id="guestName"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">E-posta *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Telefon *</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Hayvan Bilgileri *</h3>
              {petInfo.map((pet, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b last:border-0">
                  <div className="space-y-2">
                    <Label>Hayvan {index + 1} - İsim *</Label>
                    <Input
                      value={pet.name}
                      onChange={(e) => updatePetInfo(index, 'name', e.target.value)}
                      placeholder="Örn: Boncuk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tür *</Label>
                    <select
                      value={pet.type}
                      onChange={(e) => updatePetInfo(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="dog">Köpek</option>
                      <option value="cat">Kedi</option>
                      <option value="bird">Kuş</option>
                      <option value="rabbit">Tavşan</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Yaş *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={pet.age || ""}
                      onChange={(e) => updatePetInfo(index, 'age', parseInt(e.target.value) || 0)}
                      placeholder="Yaş"
                    />
                  </div>
                </div>
              ))}
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
