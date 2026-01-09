"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { setTempTaxiReservation, clearTempReservation } from "@/lib/storage"
import { mockTurkishCities, mockCityDistricts } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Car, MapPin, Navigation, User, Home, Clock, Calculator } from "lucide-react"

export function TaxiBookingGuest() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  
  const [pickupProvince, setPickupProvince] = useState("")
  const [pickupDistrict, setPickupDistrict] = useState("")
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffProvince, setDropoffProvince] = useState("")
  const [dropoffDistrict, setDropoffDistrict] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [pricePerKm, setPricePerKm] = useState({ vip: 0, shared: 0 })
  const [selectedTaxiType, setSelectedTaxiType] = useState<"vip" | "shared">("shared")
  const [isCalculating, setIsCalculating] = useState(false)
  
  const [petName, setPetName] = useState("")
  const [petType, setPetType] = useState("dog")
  const [petBreed, setPetBreed] = useState("")
  const [petWeight, setPetWeight] = useState("")
  
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const [sharedTaxiSchedules, setSharedTaxiSchedules] = useState<any[]>([])
  
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")

  useEffect(() => {
    const storedPrices = localStorage.getItem("petfendy_taxi_prices")
    if (storedPrices) {
      const prices = JSON.parse(storedPrices)
      setPricePerKm({ vip: prices.vipPricePerKm || 0, shared: prices.sharedPricePerKm || 0 })
    }
    const storedSchedules = localStorage.getItem("petfendy_shared_taxi_schedules")
    if (storedSchedules) {
      const schedules = JSON.parse(storedSchedules)
      const activeSchedules = schedules.filter((s: any) => {
        const dt = new Date(s.date + 'T' + s.time)
        return s.isActive && dt > new Date() && s.bookedSeats < s.capacity
      })
      setSharedTaxiSchedules(activeSchedules)
    }
  }, [])

  useEffect(() => { setPickupDistrict("") }, [pickupProvince])
  useEffect(() => { setDropoffDistrict("") }, [dropoffProvince])

  const calculatePrice = async () => {
    if (!pickupProvince || !pickupDistrict || !dropoffProvince || !dropoffDistrict) {
      toast({ title: "Hata", description: "Lutfen kalkis ve varis illerini ve ilcelerini secin", variant: "destructive" })
      return
    }
    setIsCalculating(true)
    try {
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupProvince, pickupDistrict, dropoffProvince, dropoffDistrict })
      })
      const data = await response.json()
      if (data.success && data.totalDistance) {
        setCalculatedDistance(data.totalDistance)
        const kmPrice = selectedTaxiType === "vip" ? pricePerKm.vip : pricePerKm.shared
        setCalculatedPrice(data.totalDistance * kmPrice)
        toast({ title: "Fiyat Hesaplandi", description: pickupProvince + " - " + dropoffProvince + " guzergahi icin fiyat belirlendi", duration: 3000 })
      } else {
        toast({ title: "Hata", description: "Fiyat hesaplanamadi", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Hata", description: "Fiyat hesaplanamadi", variant: "destructive" })
    } finally {
      setIsCalculating(false)
    }
  }

  useEffect(() => {
    if (calculatedDistance) {
      const kmPrice = selectedTaxiType === "vip" ? pricePerKm.vip : pricePerKm.shared
      setCalculatedPrice(calculatedDistance * kmPrice)
    }
  }, [selectedTaxiType, calculatedDistance, pricePerKm])

  const handleSubmit = () => {
    if (!pickupProvince || !pickupDistrict) { toast({ title: "Hata", description: "Lutfen kalkis ili ve ilcesini secin", variant: "destructive" }); return }
    if (!dropoffProvince || !dropoffDistrict) { toast({ title: "Hata", description: "Lutfen varis ili ve ilcesini secin", variant: "destructive" }); return }
    if (!calculatedPrice) { toast({ title: "Hata", description: "Lutfen once fiyat hesaplayin", variant: "destructive" }); return }
    if (!petName || !petBreed) { toast({ title: "Hata", description: "Lutfen hayvan bilgilerini doldurun", variant: "destructive" }); return }
    if (!scheduledDate || !scheduledTime) { toast({ title: "Hata", description: "Lutfen tarih ve saat secin", variant: "destructive" }); return }
    if (selectedTaxiType === "shared" && !selectedScheduleId) { toast({ title: "Hata", description: "Lutfen bir sefer secin", variant: "destructive" }); return }
    if (!guestName || !guestPhone || !guestEmail) { toast({ title: "Hata", description: "Lutfen iletisim bilgilerini doldurun", variant: "destructive" }); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) { toast({ title: "Hata", description: "Gecerli bir e-posta adresi girin", variant: "destructive" }); return }

    const taxiReservation = {
      vehicleType: selectedTaxiType,
      vehicleName: selectedTaxiType === "vip" ? "VIP Taksi" : "Paylasimli Taksi",
      pickupProvince, pickupDistrict, pickupAddress,
      dropoffProvince, dropoffDistrict, dropoffAddress,
      distance: calculatedDistance,
      pricePerKm: selectedTaxiType === "vip" ? pricePerKm.vip : pricePerKm.shared,
      scheduledDate: scheduledDate + "T" + scheduledTime,
      scheduleId: selectedTaxiType === "shared" ? selectedScheduleId : null,
      totalPrice: calculatedPrice,
      petInfo: { name: petName, type: petType, breed: petBreed, weight: petWeight ? parseFloat(petWeight) : null },
      guestInfo: { name: guestName, phone: guestPhone, email: guestEmail },
      specialNotes,
    }
    clearTempReservation()
    setTempTaxiReservation(taxiReservation)
    toast({ title: "Rezervasyon Hazir!", description: "Odeme sayfasina yonlendiriliyorsunuz...", duration: 2000 })
    setTimeout(() => { router.push("/" + locale + "/checkout/guest") }, 500)
  }

  const provinces = mockTurkishCities.sort()

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold">Pet Taksi Hizmeti</h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/" + locale + "/home")} className="gap-2">
          <Home className="w-4 h-4" />Ana Sayfa
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-4 block">Taksi Tipi</Label>
          <RadioGroup value={selectedTaxiType} onValueChange={(v) => setSelectedTaxiType(v as "vip" | "shared")} className="grid grid-cols-2 gap-4">
            <div className="relative">
              <RadioGroupItem value="shared" id="shared" className="peer sr-only" />
              <Label htmlFor="shared" className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 hover:bg-gray-50 transition-colors">
                <Car className="w-8 h-8 text-blue-500 mb-2" />
                <span className="font-semibold">Paylasimli Taksi</span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="vip" id="vip" className="peer sr-only" />
              <Label htmlFor="vip" className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50 transition-colors">
                <Car className="w-8 h-8 text-orange-500 mb-2" />
                <span className="font-semibold">VIP Taksi</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <h3 className="font-semibold text-lg">Guzergah Bilgileri</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600"><MapPin className="w-4 h-4" /><Label className="font-medium">Kalkis Ili</Label></div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={pickupProvince} onValueChange={setPickupProvince}>
                <SelectTrigger><SelectValue placeholder="Seciniz" /></SelectTrigger>
                <SelectContent>{provinces.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={pickupDistrict} onValueChange={setPickupDistrict} disabled={!pickupProvince}>
                <SelectTrigger><SelectValue placeholder="Kalkis Ilcesi" /></SelectTrigger>
                <SelectContent>{pickupProvince && mockCityDistricts[pickupProvince]?.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Kalkis Adresi" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600"><Navigation className="w-4 h-4" /><Label className="font-medium">Varis Ili</Label></div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={dropoffProvince} onValueChange={setDropoffProvince}>
                <SelectTrigger><SelectValue placeholder="Seciniz" /></SelectTrigger>
                <SelectContent>{provinces.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={dropoffDistrict} onValueChange={setDropoffDistrict} disabled={!dropoffProvince}>
                <SelectTrigger><SelectValue placeholder="Varis Ilcesi" /></SelectTrigger>
                <SelectContent>{dropoffProvince && mockCityDistricts[dropoffProvince]?.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Varis Adresi" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} />
          </div>
          <Button onClick={calculatePrice} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!pickupProvince || !pickupDistrict || !dropoffProvince || !dropoffDistrict || isCalculating}>
            {isCalculating ? (<><span className="animate-spin mr-2">&#8987;</span>Hesaplaniyor...</>) : (<><Calculator className="w-4 h-4 mr-2" />Fiyat Hesapla</>)}
          </Button>
          {calculatedPrice !== null && calculatedPrice > 0 && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Tahmini Ucret:</span>
                <span className="text-2xl font-bold text-green-700">&#8378;{calculatedPrice.toFixed(2)}</span>
              </div>
              <div className="text-xs text-green-600 mt-1 text-center">{pickupProvince}/{pickupDistrict} &#8594; {dropoffProvince}/{dropoffDistrict}</div>
              <div className="text-xs text-gray-500 mt-2 text-center">{selectedTaxiType === "vip" ? "VIP Taksi" : "Paylasimli Taksi"} hizmeti</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Evcil Hayvan Bilgileri</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Evcil Hayvan Adi</Label><Input placeholder="Hayvan adi" value={petName} onChange={(e) => setPetName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Hayvan Turu</Label><Select value={petType} onValueChange={setPetType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dog">Kopek</SelectItem><SelectItem value="cat">Kedi</SelectItem><SelectItem value="other">Diger</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Cins</Label><Input placeholder="Cins" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} /></div>
            <div className="space-y-2"><Label>Agirlik (kg)</Label><Input type="number" placeholder="Agirlik" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-lg">Tarih ve Saat</h3></div>
          {selectedTaxiType === "shared" ? (
            <div className="space-y-3">
              <Label>Mevcut Seferler</Label>
              {sharedTaxiSchedules.length === 0 ? (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-700 text-sm">Su anda planlanan sefer bulunmamaktadir.</p>
                  <p className="text-yellow-600 text-xs mt-1">Lutfen VIP taksi secenegini tercih edin.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedTaxiSchedules.map((schedule) => (
                    <div key={schedule.id} className="relative">
                      <input type="radio" id={schedule.id} name="sharedTaxiSchedule" value={schedule.id} checked={selectedScheduleId === schedule.id} onChange={(e) => { setSelectedScheduleId(e.target.value); setScheduledDate(schedule.date); setScheduledTime(schedule.time) }} className="peer sr-only" />
                      <label htmlFor={schedule.id} className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{new Date(schedule.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div className="text-sm text-muted-foreground">Kalkis: {schedule.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{schedule.capacity - schedule.bookedSeats} yer mevcut</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tarih</Label><Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} /></div>
              <div className="space-y-2"><Label>Saat</Label><Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2"><User className="w-5 h-5 text-gray-600" /><h3 className="font-semibold text-lg">Iletisim Bilgileri</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ad Soyad</Label><Input placeholder="Ad Soyad" value={guestName} onChange={(e) => setGuestName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefon</Label><Input type="tel" placeholder="05XX XXX XX XX" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>E-posta</Label><Input type="email" placeholder="ornek@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Ozel Notlar</Label><Textarea placeholder="Ozel isteklerinizi yazin..." value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3 sticky bottom-4">
        <Button variant="outline" className="flex-1" onClick={() => router.back()}>Geri</Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={!calculatedPrice}>Uye Olmadan Devam Et</Button>
      </div>
    </div>
  )
}
