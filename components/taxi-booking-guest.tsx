"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { setTempTaxiReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Car, MapPin, Navigation, User, Home, Clock, Calculator } from "lucide-react"

// Türkiye illeri ve ilçeleri
const turkeyProvinces: Record<string, string[]> = {
  "Ankara": ["Çankaya", "Keçiören", "Mamak", "Etimesgut", "Yenimahalle", "Sincan", "Altındağ", "Pursaklar", "Gölbaşı", "Polatlı"],
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih", "Beyoğlu", "Bakırköy", "Ataşehir", "Maltepe", "Pendik", "Kartal", "Sarıyer", "Beykoz"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Bayraklı", "Gaziemir", "Balçova", "Narlıdere"],
  "Antalya": ["Muratpaşa", "Konyaaltı", "Kepez", "Aksu", "Döşemealtı", "Alanya", "Manavgat", "Serik"],
  "Bursa": ["Osmangazi", "Nilüfer", "Yıldırım", "Gemlik", "Mudanya", "İnegöl"],
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan"],
  "Konya": ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir"],
  "Gaziantep": ["Şahinbey", "Şehitkamil", "Oğuzeli", "Nizip"],
  "Mersin": ["Yenişehir", "Mezitli", "Akdeniz", "Toroslar", "Tarsus"],
  "Kayseri": ["Melikgazi", "Kocasinan", "Talas", "Develi"],
  "Eskişehir": ["Odunpazarı", "Tepebaşı", "Sivrihisar"],
  "Samsun": ["İlkadım", "Atakum", "Canik", "Tekkeköy"],
  "Denizli": ["Merkezefendi", "Pamukkale", "Çivril"],
  "Muğla": ["Bodrum", "Marmaris", "Fethiye", "Milas", "Dalaman"],
  "Aydın": ["Efeler", "Nazilli", "Söke", "Kuşadası", "Didim"],
  "Trabzon": ["Ortahisar", "Akçaabat", "Yomra", "Araklı"],
  "Diyarbakır": ["Bağlar", "Kayapınar", "Yenişehir", "Sur"],
  "Erzurum": ["Yakutiye", "Palandöken", "Aziziye"],
  "Malatya": ["Battalgazi", "Yeşilyurt"],
  "Van": ["İpekyolu", "Tuşba", "Edremit"],
}

// Ankara'dan diğer illere yaklaşık mesafeler (km)
const distancesFromAnkara: Record<string, number> = {
  "Ankara": 0,
  "İstanbul": 450,
  "İzmir": 580,
  "Antalya": 480,
  "Bursa": 380,
  "Adana": 490,
  "Konya": 260,
  "Gaziantep": 670,
  "Mersin": 480,
  "Kayseri": 320,
  "Eskişehir": 230,
  "Samsun": 420,
  "Denizli": 480,
  "Muğla": 600,
  "Aydın": 550,
  "Trabzon": 760,
  "Diyarbakır": 920,
  "Erzurum": 880,
  "Malatya": 680,
  "Van": 1200,
}

export function TaxiBookingGuest() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  // Güzergah bilgileri
  const [pickupProvince, setPickupProvince] = useState("")
  const [pickupDistrict, setPickupDistrict] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffProvince, setDropoffProvince] = useState("")
  const [dropoffDistrict, setDropoffDistrict] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  
  // Mesafe ve fiyat
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)
  const [pricePerKm, setPricePerKm] = useState({ vip: 15, shared: 8 }) // Varsayılan fiyatlar
  const [selectedTaxiType, setSelectedTaxiType] = useState<"vip" | "shared">("shared")
  
  // Pet bilgileri
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("dog")
  const [petBreed, setPetBreed] = useState("")
  const [petWeight, setPetWeight] = useState("")
  
  // Tarih ve saat
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  
  // İletişim bilgileri
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")

  // Yönetim panelinden fiyatları yükle
  useEffect(() => {
    const storedPrices = localStorage.getItem("petfendy_taxi_prices")
    if (storedPrices) {
      const prices = JSON.parse(storedPrices)
      setPricePerKm({
        vip: prices.vipPricePerKm || 15,
        shared: prices.sharedPricePerKm || 8
      })
    }
  }, [])

  // İlçe listesini sıfırla
  useEffect(() => {
    setPickupDistrict("")
  }, [pickupProvince])

  useEffect(() => {
    setDropoffDistrict("")
  }, [dropoffProvince])

  // Fiyat Hesaplama
  const calculateDistance = () => {
    if (!pickupProvince || !dropoffProvince) {
      toast({ title: "Hata", description: "Lütfen kalkış ve varış illerini seçin", variant: "destructive" })
      return
    }

    // Ankara merkez noktası olarak hesaplama
    // Ankara -> Alış ili + Alış ili -> Bırakış ili mesafesi
    const pickupFromAnkara = distancesFromAnkara[pickupProvince] || 100
    const dropoffFromAnkara = distancesFromAnkara[dropoffProvince] || 100
    
    let totalDistance: number
    
    if (pickupProvince === dropoffProvince) {
      // Aynı il içi taşıma (ilçeler arası)
      totalDistance = 30 // Varsayılan şehir içi mesafe
    } else {
      // Farklı iller arası
      // Ankara'dan alış noktasına + alış noktasından bırakış noktasına
      totalDistance = pickupFromAnkara + Math.abs(dropoffFromAnkara - pickupFromAnkara) + 20 // +20 ilçe içi
    }

    setCalculatedDistance(totalDistance)
    toast({ 
      title: "✅ Fiyat Hesaplandı", 
      description: `Tahmini �cret: ${totalDistance} km`,
      duration: 3000 
    })
  }

  const calculatePrice = (): number => {
    if (!calculatedDistance) return 0
    const kmPrice = selectedTaxiType === "vip" ? pricePerKm.vip : pricePerKm.shared
    return calculatedDistance * kmPrice
  }

  const handleSubmit = () => {
    // Validasyonlar
    if (!pickupProvince || !pickupDistrict) {
      toast({ title: "Hata", description: "Lütfen kalkış ili ve ilçesini seçin", variant: "destructive" })
      return
    }
    if (!dropoffProvince || !dropoffDistrict) {
      toast({ title: "Hata", description: "Lütfen varış ili ve ilçesini seçin", variant: "destructive" })
      return
    }
    if (!calculatedDistance) {
      toast({ title: "Hata", description: "Lütfen önce Fiyat Hesaplayın", variant: "destructive" })
      return
    }
    if (!petName || !petBreed) {
      toast({ title: "Hata", description: "Lütfen hayvan bilgilerini doldurun", variant: "destructive" })
      return
    }
    if (!scheduledDate || !scheduledTime) {
      toast({ title: "Hata", description: "Lütfen tarih ve saat seçin", variant: "destructive" })
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

    const totalPrice = calculatePrice()

    const taxiReservation = {
      vehicleType: selectedTaxiType,
      vehicleName: selectedTaxiType === "vip" ? "VIP Taksi" : "Paylaşımlı Taksi",
      pickupProvince,
      pickupDistrict,
      pickupAddress,
      dropoffProvince,
      dropoffDistrict,
      dropoffAddress,
      distance: calculatedDistance,
      pricePerKm: selectedTaxiType === "vip" ? pricePerKm.vip : pricePerKm.shared,
      scheduledDate: `${scheduledDate}T${scheduledTime}`,
      totalPrice,
      petInfo: { 
        name: petName, 
        type: petType,
        breed: petBreed,
        weight: petWeight ? parseFloat(petWeight) : null
      },
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

  const provinces = Object.keys(turkeyProvinces).sort()

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pet Taksi Hizmeti</h1>
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

      {/* Taksi Tipi Seçimi */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-4 block">Taksi Tipi</Label>
          <RadioGroup 
            value={selectedTaxiType} 
            onValueChange={(v) => setSelectedTaxiType(v as "vip" | "shared")}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem value="shared" id="shared" className="peer sr-only" />
              <Label
                htmlFor="shared"
                className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 hover:bg-gray-50 transition-colors"
              >
                <Car className="w-8 h-8 text-blue-500 mb-2" />
                <span className="font-semibold">Paylaşımlı Taksi</span>
                <span className="text-sm text-muted-foreground">₺{pricePerKm.shared}/km</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="vip" id="vip" className="peer sr-only" />
              <Label
                htmlFor="vip"
                className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50 transition-colors"
              >
                <Car className="w-8 h-8 text-orange-500 mb-2" />
                <span className="font-semibold">VIP Taksi</span>
                <span className="text-sm text-muted-foreground">₺{pricePerKm.vip}/km</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Güzergah Bilgileri */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <h3 className="font-semibold text-lg">Güzergah Bilgileri</h3>
          
          {/* Kalkış */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <MapPin className="w-4 h-4" />
              <Label className="font-medium">Kalkış İli</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={pickupProvince} onValueChange={setPickupProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={pickupDistrict} onValueChange={setPickupDistrict} disabled={!pickupProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Kalkış İlçesi" />
                </SelectTrigger>
                <SelectContent>
                  {pickupProvince && turkeyProvinces[pickupProvince]?.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input 
              placeholder="Kalkış Adresi" 
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </div>

          {/* Varış */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <Navigation className="w-4 h-4" />
              <Label className="font-medium">Varış İli</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={dropoffProvince} onValueChange={setDropoffProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dropoffDistrict} onValueChange={setDropoffDistrict} disabled={!dropoffProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Varış İlçesi" />
                </SelectTrigger>
                <SelectContent>
                  {dropoffProvince && turkeyProvinces[dropoffProvince]?.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input 
              placeholder="Varış Adresi" 
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
            />
          </div>

          {/* Fiyat Hesapla Butonu */}
          <Button 
            onClick={calculateDistance}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!pickupProvince || !dropoffProvince}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Fiyat Hesapla
          </Button>

          {/* Hesaplanan Mesafe */}
          {calculatedDistance && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Tahmini �cret:</span>
                <span className="text-2xl font-bold text-green-700">?{calculatedPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-green-700 font-medium">Tahmini Ücret:</span>
                <span className="text-2xl font-bold text-green-700">₺{calculatePrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evcil Hayvan Bilgileri */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Evcil Hayvan Bilgileri</h3>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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

      {/* Tarih ve Saat */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-lg">Tarih ve Saat</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input 
                type="date" 
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Saat</Label>
              <Input 
                type="time" 
                value={scheduledTime} 
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İletişim Bilgileri */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-lg">İletişim Bilgileri</h3>
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
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input 
              type="email" 
              placeholder="ornek@email.com" 
              value={guestEmail} 
              onChange={(e) => setGuestEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
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

      {/* Butonlar */}
      <div className="flex gap-3 sticky bottom-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => router.back()}
        >
          Geri
        </Button>
        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={!calculatedDistance}
        >
          Üye Olmadan Devam Et
        </Button>
      </div>
    </div>
  )
}
