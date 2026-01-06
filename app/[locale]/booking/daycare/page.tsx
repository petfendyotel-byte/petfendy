"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Heart, Clock, Users, Gamepad2, Stethoscope, ArrowLeft, Home } from "lucide-react"

// Kreş hizmetleri
const daycareServices = [
  { id: "play", name: "Oyun Zamanı", description: "Diğer hayvanlarla sosyal oyun", icon: "🎾" },
  { id: "walk", name: "Yürüyüş", description: "Günlük egzersiz ve yürüyüş", icon: "🚶" },
  { id: "feeding", name: "Beslenme", description: "Özel diyet ve beslenme takibi", icon: "🍽️" },
  { id: "grooming", name: "Bakım", description: "Temel temizlik ve bakım", icon: "✂️" },
  { id: "training", name: "Eğitim", description: "Temel itaat eğitimi", icon: "🎓" },
]

// Zaman dilimleri
const timeSlots = [
  { id: "morning", name: "Sabah (08:00-12:00)", hours: 4 },
  { id: "afternoon", name: "Öğleden Sonra (13:00-17:00)", hours: 4 },
  { id: "fullday", name: "Tam Gün (08:00-17:00)", hours: 9 },
]

export default function DaycarePage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  // Pet bilgileri
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("dog")
  const [petBreed, setPetBreed] = useState("")
  const [petAge, setPetAge] = useState("")
  const [petWeight, setPetWeight] = useState("")
  
  // Rezervasyon bilgileri
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  // İletişim bilgileri
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = () => {
    // Validasyonlar
    if (!petName || !petBreed || !petAge) {
      toast({ title: "Hata", description: "Lütfen hayvan bilgilerini doldurun", variant: "destructive" })
      return
    }
    if (!selectedDate || !selectedTimeSlot) {
      toast({ title: "Hata", description: "Lütfen tarih ve zaman dilimi seçin", variant: "destructive" })
      return
    }
    if (!ownerName || !ownerPhone || !ownerEmail) {
      toast({ title: "Hata", description: "Lütfen iletişim bilgilerini doldurun", variant: "destructive" })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(ownerEmail)) {
      toast({ title: "Hata", description: "Geçerli bir e-posta adresi girin", variant: "destructive" })
      return
    }

    // Rezervasyon verisi
    const reservationData = {
      type: "daycare",
      petInfo: {
        name: petName,
        type: petType,
        breed: petBreed,
        age: parseInt(petAge),
        weight: parseFloat(petWeight) || null
      },
      date: selectedDate,
      timeSlot: timeSlots.find(slot => slot.id === selectedTimeSlot),
      services: selectedServices.map(id => {
        const service = daycareServices.find(s => s.id === id)!
        return { id, name: service.name, description: service.description }
      }),
      ownerInfo: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail
      },
      specialNotes,
      createdAt: new Date().toISOString()
    }

    // LocalStorage'a kaydet (geçici)
    const existingReservations = JSON.parse(localStorage.getItem("petfendy_daycare_reservations") || "[]")
    existingReservations.push(reservationData)
    localStorage.setItem("petfendy_daycare_reservations", JSON.stringify(existingReservations))

    toast({
      title: "✅ Kreş Rezervasyonu Alındı!",
      description: `${petName} için ${selectedDate} tarihinde rezervasyon oluşturuldu.`,
      duration: 3000,
    })

    // Ana sayfaya yönlendir
    setTimeout(() => {
      router.push(`/${locale}/home`)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar locale={locale} />
      
      <div className="max-w-4xl mx-auto p-4 pt-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pet Kreş Rezervasyonu</h1>
              <p className="text-sm text-muted-foreground">Günlük bakım hizmeti</p>
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
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-500" />
              Evcil Hayvan Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hayvan Adı</Label>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cins</Label>
                <Input 
                  placeholder="Cins" 
                  value={petBreed} 
                  onChange={(e) => setPetBreed(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Yaş</Label>
                <Input 
                  type="number" 
                  placeholder="Yaş" 
                  value={petAge} 
                  onChange={(e) => setPetAge(e.target.value)} 
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

        {/* Tarih ve Zaman */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Tarih ve Zaman Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-3">
              <Label>Zaman Dilimi</Label>
              <div className="grid gap-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedTimeSlot(slot.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      selectedTimeSlot === slot.id
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{slot.name}</span>
                      <span className="text-sm text-muted-foreground">{slot.hours} saat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hizmetler */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-green-500" />
              Kreş Hizmetleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {daycareServices.map((service) => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  selectedServices.includes(service.id)
                    ? "bg-green-50 border-2 border-green-300"
                    : "bg-white border-2 border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedServices.includes(service.id)} />
                  <span className="text-xl">{service.icon}</span>
                  <div>
                    <span className="font-medium">{service.name}</span>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ad Soyad</Label>
                <Input 
                  placeholder="Ad Soyad" 
                  value={ownerName} 
                  onChange={(e) => setOwnerName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input 
                  type="tel" 
                  placeholder="05XX XXX XX XX" 
                  value={ownerPhone} 
                  onChange={(e) => setOwnerPhone(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input 
                type="email" 
                placeholder="ornek@email.com" 
                value={ownerEmail} 
                onChange={(e) => setOwnerEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Özel Notlar</Label>
              <Textarea 
                placeholder="Hayvanınızla ilgili özel durumlar, alerjiler, ilaçlar vb..." 
                value={specialNotes} 
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Butonlar */}
        <div className="flex gap-3 sticky bottom-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            onClick={handleSubmit}
          >
            Kreş Rezervasyonu Yap
          </Button>
        </div>
      </div>

      <Footer locale={locale} />
    </div>
  )
}