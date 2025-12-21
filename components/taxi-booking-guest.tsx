"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { TaxiService, TaxiVehicle, CityPricing } from "@/lib/types"
import { mockTaxiServices, mockCityPricings, mockTurkishCities } from "@/lib/mock-data"
import { setTempTaxiReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Car, MapPin, Calendar, User, ArrowLeft, Home } from "lucide-react"

export function TaxiBookingGuest() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [services] = useState<TaxiService[]>(mockTaxiServices)
  const [cityPricings] = useState<CityPricing[]>(mockCityPricings)
  const [taxiVehicles, setTaxiVehicles] = useState<TaxiVehicle[]>([])
  
  const [selectedService, setSelectedService] = useState<TaxiService | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<TaxiVehicle | null>(null)
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  
  // Pet bilgileri
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("dog")
  
  // İletişim bilgileri
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")

  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem("petfendy_taxi_vehicles") || "[]")
    if (storedVehicles.length > 0) {
      setTaxiVehicles(storedVehicles)
    } else {
      // Default vehicles
      const defaultVehicles: TaxiVehicle[] = [
        { id: "v1", name: "Ekonomik Araç", type: "shared", pricePerKm: 5, capacity: 2, isAvailable: true, description: "Küçük hayvanlar için uygun", features: ["Klima", "Su"], createdAt: new Date(), updatedAt: new Date() },
        { id: "v2", name: "VIP Araç", type: "vip", pricePerKm: 10, capacity: 4, isAvailable: true, description: "Konforlu yolculuk", features: ["Klima", "Su", "Mama", "Özel Kafes"], createdAt: new Date(), updatedAt: new Date() },
      ]
      setTaxiVehicles(defaultVehicles)
    }
  }, [])

  const getDistance = (): number => {
    if (!fromCity || !toCity) return 0
    const cityPricing = cityPricings.find(
      (cp) => (cp.fromCity === fromCity && cp.toCity === toCity) || (cp.fromCity === toCity && cp.toCity === fromCity)
    )
    if (cityPricing) return cityPricing.distanceKm
    if (fromCity === toCity) return 20
    return 100
  }

  const getCityPricing = (): CityPricing | null => {
    if (!fromCity || !toCity) return null
    return cityPricings.find(
      (cp) => (cp.fromCity === fromCity && cp.toCity === toCity) || (cp.fromCity === toCity && cp.toCity === fromCity)
    ) || null
  }

  const calculatePrice = (): number => {
    if (!selectedService || !selectedVehicle || !fromCity || !toCity) return 0
    const distance = getDistance()
    const cityPricing = getCityPricing()
    let totalPrice = selectedService.basePrice + (selectedVehicle.pricePerKm * distance)
    if (isRoundTrip) totalPrice *= 2
    if (cityPricing) {
      totalPrice += cityPricing.additionalFee
      if (cityPricing.discount > 0) {
        totalPrice -= (totalPrice * cityPricing.discount) / 100
      }
    }
    return totalPrice
  }

  const handleSubmit = () => {
    if (!selectedService) {
      toast({ title: "Hata", description: "Lütfen bir hizmet seçin", variant: "destructive" })
      return
    }
    if (!selectedVehicle) {
      toast({ title: "Hata", description: "Lütfen bir araç seçin", variant: "destructive" })
      return
    }
    if (!fromCity || !toCity) {
      toast({ title: "Hata", description: "Lütfen kalkış ve varış şehirlerini seçin", variant: "destructive" })
      return
    }
    if (!scheduledDate) {
      toast({ title: "Hata", description: "Lütfen tarih seçin", variant: "destructive" })
      return
    }
    if (!petName) {
      toast({ title: "Hata", description: "Lütfen hayvan adını girin", variant: "destructive" })
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

    const distance = getDistance()
    const price = calculatePrice()
    const cityPricing = getCityPricing()

    const taxiReservation = {
      serviceName: selectedService.name,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      vehicleType: selectedVehicle.type,
      pickupCity: fromCity,
      dropoffCity: toCity,
      distance,
      scheduledDate,
      isRoundTrip,
      basePrice: selectedService.basePrice,
      pricePerKm: selectedVehicle.pricePerKm,
      additionalFee: cityPricing?.additionalFee || 0,
      discount: cityPricing?.discount || 0,
      totalPrice: price,
      petInfo: { name: petName, type: petType },
      guestInfo: { name: guestName, phone: guestPhone, email: guestEmail },
      specialNotes,
    }

    setTempTaxiReservation(taxiReservation)

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
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pet Taksi Rezervasyonu</h1>
            <p className="text-sm text-muted-foreground">Güvenli hayvan taşımacılığı</p>
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
              <Input placeholder="Hayvan adı" value={petName} onChange={(e) => setPetName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hayvan Türü</Label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Köpek</SelectItem>
                  <SelectItem value="cat">Kedi</SelectItem>
                  <SelectItem value="bird">Kuş</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Güzergah */}
      <Card className="border-0 shadow-sm bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Güzergah</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kalkış Şehri</Label>
              <Select value={fromCity} onValueChange={setFromCity}>
                <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                <SelectContent>
                  {mockTurkishCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Varış Şehri</Label>
              <Select value={toCity} onValueChange={setToCity}>
                <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                <SelectContent>
                  {mockTurkishCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-lg">
            <Switch id="roundtrip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
            <Label htmlFor="roundtrip" className="cursor-pointer">Gidiş-Dönüş (2x fiyat)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tarih */}
      <Card className="border-0 shadow-sm bg-purple-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">Tarih ve Saat</span>
          </div>
          <Input 
            type="datetime-local" 
            value={scheduledDate} 
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </CardContent>
      </Card>

      {/* Hizmet Seçimi */}
      <Card className="border-0 shadow-sm bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-green-600" />
            <span className="font-semibold">Hizmet Tipi</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl cursor-pointer text-center transition-all ${
                  selectedService?.id === service.id 
                    ? "bg-green-100 border-2 border-green-400" 
                    : "bg-white border-2 border-transparent hover:border-gray-200"
                }`}
              >
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-lg font-bold text-green-600 mt-1">₺{service.basePrice}</p>
                <p className="text-xs text-muted-foreground">başlangıç</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Araç Seçimi */}
      {selectedService && fromCity && toCity && (
        <Card className="border-0 shadow-sm bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold">Araç Seçimi</span>
            </div>
            {taxiVehicles.filter(v => v.isAvailable).length === 0 ? (
              <Alert><AlertDescription>Şu anda müsait araç bulunmamaktadır.</AlertDescription></Alert>
            ) : (
              <RadioGroup value={selectedVehicle?.id || ""} onValueChange={(value) => {
                const vehicle = taxiVehicles.find(v => v.id === value)
                setSelectedVehicle(vehicle || null)
              }}>
                <div className="space-y-3">
                  {taxiVehicles.filter(v => v.isAvailable).map((vehicle) => (
                    <div key={vehicle.id} className="relative">
                      <RadioGroupItem value={vehicle.id} id={vehicle.id} className="peer sr-only" />
                      <Label
                        htmlFor={vehicle.id}
                        className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-orange-400 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{vehicle.name}</span>
                            <Badge variant={vehicle.type === "vip" ? "default" : "secondary"}>
                              {vehicle.type === "vip" ? "VIP" : "Paylaşımlı"}
                            </Badge>
                          </div>
                          {vehicle.description && <p className="text-sm text-muted-foreground">{vehicle.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">₺{vehicle.pricePerKm}/km</p>
                          <p className="text-xs text-muted-foreground">{vehicle.capacity} hayvan</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      )}

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
              <Input placeholder="Ad Soyad" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input type="tel" placeholder="05XX XXX XX XX" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>E-posta</Label>
            <Input type="email" placeholder="ornek@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
          </div>
          <div className="mt-4 space-y-2">
            <Label>Özel Notlar</Label>
            <Textarea placeholder="Özel isteklerinizi yazın..." value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Özet ve Butonlar */}
      {selectedService && selectedVehicle && fromCity && toCity && (
        <Card className="border-0 shadow-lg bg-white sticky bottom-4">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-3xl font-bold text-primary">₺{calculatePrice().toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {getDistance()} km {isRoundTrip && "(Gidiş-Dönüş)"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
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
