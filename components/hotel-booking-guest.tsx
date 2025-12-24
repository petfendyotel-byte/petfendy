"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import type { HotelRoom } from "@/lib/types"
import { mockHotelRooms } from "@/lib/mock-data"
import { setTempReservation, clearTempTaxiReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { RoomDetailModal } from "@/components/room-detail-modal"
import { Hotel, Sparkles, Calendar, User, PawPrint, ArrowLeft, Info, Home, Play } from "lucide-react"

// Ek hizmetler
const additionalServices = [
  { id: "grooming", name: "Tıraş ve Bakım", price: 100, icon: "✂️" },
  { id: "training", name: "Eğitim", price: 150, icon: "🎓" },
  { id: "vet", name: "Veteriner Kontrolü", price: 200, icon: "👨‍⚕️" },
]

export function HotelBookingGuest() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [rooms, setRooms] = useState<HotelRoom[]>(mockHotelRooms)
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [detailRoom, setDetailRoom] = useState<HotelRoom | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Pet bilgileri
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("dog")
  const [petBreed, setPetBreed] = useState("")
  const [petWeight, setPetWeight] = useState("")
  
  // Tarihler
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  
  // İletişim bilgileri
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")

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

  const calculateServicesTotal = (): number => {
    return selectedServices.reduce((total, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId)
      return total + (service?.price || 0)
    }, 0)
  }

  const calculateTotal = (): number => {
    if (!selectedRoom) return 0
    const nights = calculateNights()
    const roomTotal = selectedRoom.pricePerNight * nights
    const servicesTotal = calculateServicesTotal()
    return roomTotal + servicesTotal
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = () => {
    // Validasyonlar
    if (!selectedRoom) {
      toast({ title: "Hata", description: "Lütfen bir oda tipi seçin", variant: "destructive" })
      return
    }
    if (!petName || !petBreed || !petWeight) {
      toast({ title: "Hata", description: "Lütfen hayvan bilgilerini doldurun", variant: "destructive" })
      return
    }
    if (!checkInDate || !checkOutDate) {
      toast({ title: "Hata", description: "Lütfen giriş ve çıkış tarihlerini seçin", variant: "destructive" })
      return
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast({ title: "Hata", description: "Çıkış tarihi giriş tarihinden sonra olmalıdır", variant: "destructive" })
      return
    }
    if (!guestName || !guestPhone || !guestEmail) {
      toast({ title: "Hata", description: "Lütfen iletişim bilgilerini doldurun", variant: "destructive" })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      toast({ title: "Hata", description: "Geçerli bir e-posta adresi girin", variant: "destructive" })
      return
    }

    const nights = calculateNights()
    const servicesTotal = calculateServicesTotal()
    const totalPrice = calculateTotal()

    // Rezervasyon verisi
    const reservationData = {
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkInDate,
      checkOutDate,
      nights,
      petCount: 1,
      petInfo: {
        name: petName,
        type: petType,
        breed: petBreed,
        weight: parseFloat(petWeight)
      },
      guestInfo: {
        name: guestName,
        phone: guestPhone,
        email: guestEmail
      },
      specialRequests: specialNotes,
      additionalServices: selectedServices.map(id => {
        const service = additionalServices.find(s => s.id === id)!
        return { id, name: service.name, price: service.price }
      }),
      basePrice: selectedRoom.pricePerNight * nights,
      servicesTotal,
      totalPrice,
    }

    // Eski taksi rezervasyonunu temizle
    clearTempTaxiReservation()
    // Yeni otel rezervasyonunu kaydet
    setTempReservation(reservationData)

    toast({
      title: "✅ Rezervasyon Hazır!",
      description: "Ödeme sayfasına yönlendiriliyorsunuz...",
      duration: 2000,
    })

    setTimeout(() => {
      router.push(`/${locale}/checkout/guest`)
    }, 500)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pet Otel Rezervasyonu</h1>
            <p className="text-sm text-muted-foreground">hotel.pet.info</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/${locale}/home`)}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Button>
      </div>

      {/* Pet Bilgileri */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Evcil Hayvan Adı</Label>
              <Input 
                placeholder="Hayvan adı" 
                value={petName} 
                onChange={(e) => setPetName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Hayvan Türü</Label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Köpek</SelectItem>
                  <SelectItem value="cat">Kedi</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cins</Label>
              <Input 
                placeholder="Cins" 
                value={petBreed} 
                onChange={(e) => setPetBreed(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Ağırlık (kg)</Label>
              <Input 
                type="number" 
                placeholder="Ağırlık" 
                value={petWeight} 
                onChange={(e) => setPetWeight(e.target.value)} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarihler */}
      <Card className="border-0 shadow-sm bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Tarihler</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giriş Tarihi</Label>
              <Input 
                type="date" 
                value={checkInDate} 
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Çıkış Tarihi</Label>
              <Input 
                type="date" 
                value={checkOutDate} 
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oda Tipi */}
      <Card className="border-0 shadow-sm bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Hotel className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Oda Tipi</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.filter(r => r.available).map((room) => (
              <div
                key={room.id}
                className={`relative rounded-xl cursor-pointer transition-all overflow-hidden ${
                  selectedRoom?.id === room.id 
                    ? "ring-2 ring-orange-400 shadow-lg" 
                    : "hover:shadow-md"
                }`}
              >
                {/* Room Image */}
                {room.images && room.images.length > 0 ? (
                  <div 
                    className="relative h-32 w-full"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                    {room.videos && room.videos.length > 0 && (
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
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

                {/* Room Info */}
                <div 
                  className={`p-4 ${selectedRoom?.id === room.id ? "bg-orange-50" : "bg-white"}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <p className="font-medium text-sm mb-1">{room.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {room.type === "standard" ? "Standart" : room.type === "deluxe" ? "Deluxe" : "Suit"}
                  </p>
                  <p className="text-xl font-bold text-orange-500">₺{room.pricePerNight}</p>
                  <p className="text-xs text-muted-foreground">/gece</p>
                </div>

                {/* Detail Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setDetailRoom(room)
                    setShowDetailModal(true)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>

                {/* Selected Indicator */}
                {selectedRoom?.id === room.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

      {/* Ek Hizmetler */}
      <Card className="border-0 shadow-sm bg-purple-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Ek Hizmetler</span>
          </div>
          <div className="space-y-3">
            {additionalServices.map((service) => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? "bg-purple-100 border-2 border-purple-300"
                    : "bg-white border-2 border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedServices.includes(service.id)} />
                  <span className="text-xl">{service.icon}</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className="text-orange-500 font-semibold">₺{service.price}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card className="border-0 shadow-sm bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-semibold">İletişim Bilgileri</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input 
                placeholder="Ad Soyad" 
                value={guestName} 
                onChange={(e) => setGuestName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input 
                type="tel" 
                placeholder="05XX XXX XX XX" 
                value={guestPhone} 
                onChange={(e) => setGuestPhone(e.target.value)} 
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>E-posta</Label>
            <Input 
              type="email" 
              placeholder="ornek@email.com" 
              value={guestEmail} 
              onChange={(e) => setGuestEmail(e.target.value)} 
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Özel Notlar</Label>
            <Textarea 
              placeholder="Özel isteklerinizi yazın..." 
              value={specialNotes} 
              onChange={(e) => setSpecialNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Özet ve Butonlar */}
      {selectedRoom && checkInDate && checkOutDate && (
        <Card className="border-0 shadow-lg bg-white sticky bottom-4">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-3xl font-bold text-primary">₺{calculateTotal().toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateNights()} gece + {selectedServices.length} hizmet
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                onClick={handleSubmit}
              >
                Üye Olmadan Devam Et 🎉
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
