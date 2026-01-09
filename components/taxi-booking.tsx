"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import type { TaxiService, TaxiVehicle, CityPricing } from "@/lib/types"
import { mockTaxiServices, mockCityPricings, mockTurkishCities } from "@/lib/mock-data"
import { setTempTaxiReservation } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function TaxiBooking() {
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
  const [scheduledDate, setScheduledDate] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load taxi vehicles from localStorage
  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem("petfendy_taxi_vehicles") || "[]")
    setTaxiVehicles(storedVehicles)

    // Listen for vehicle updates
    const handleVehiclesUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("petfendy_taxi_vehicles") || "[]")
      setTaxiVehicles(updated)
    }

    window.addEventListener('taxiVehiclesUpdated', handleVehiclesUpdate)
    return () => window.removeEventListener('taxiVehiclesUpdated', handleVehiclesUpdate)
  }, [])

  // Calculate distance based on city pairs or use default
  // Distance automatically includes round trip (x2) since vehicle starts from Ankara
  const getDistance = (): number => {
    if (!fromCity || !toCity) return 0
    
    // Check if there's a predefined city pricing
    const cityPricing = cityPricings.find(
      (cp) => 
        (cp.fromCity === fromCity && cp.toCity === toCity) ||
        (cp.fromCity === toCity && cp.toCity === fromCity)
    )
    
    let oneWayDistance: number
    if (cityPricing) {
      oneWayDistance = cityPricing.distanceKm
    } else {
      // Default distance for same city or unknown pairs
      if (fromCity === toCity) {
        oneWayDistance = 20
      } else {
        oneWayDistance = 100 // Default distance for unknown city pairs
      }
    }
    
    // Return round trip distance (x2) since vehicle needs to return to Ankara
    return oneWayDistance * 2
  }

  const getCityPricing = (): CityPricing | null => {
    if (!fromCity || !toCity) return null
    
    return cityPricings.find(
      (cp) => 
        (cp.fromCity === fromCity && cp.toCity === toCity) ||
        (cp.fromCity === toCity && cp.toCity === fromCity)
    ) || null
  }

  const calculatePrice = (): number => {
    if (!selectedService || !fromCity || !toCity) return 0

    const distance = getDistance()
    const cityPricing = getCityPricing()

    // Use vehicle's pricePerKm if selected, otherwise use service's pricePerKm
    const pricePerKm = selectedVehicle ? selectedVehicle.pricePerKm : selectedService.pricePerKm

    // Distance already includes round trip calculation (x2)
    // Calculate total price: basePrice + (distance * pricePerKm)
    let totalPrice = selectedService.basePrice + (pricePerKm * distance)

    // Apply city-specific additional fees
    if (cityPricing) {
      totalPrice += cityPricing.additionalFee

      // Apply discount if available
      if (cityPricing.discount > 0) {
        totalPrice -= (totalPrice * cityPricing.discount) / 100
      }
    }

    return totalPrice
  }

  const handleBooking = () => {
    setError("")
    setSuccess("")

    if (!selectedService) {
      setError("Lütfen bir taksi hizmeti seçin")
      return
    }

    if (!selectedVehicle) {
      setError("Lütfen bir araç seçin")
      return
    }

    if (!fromCity || !toCity) {
      setError("Lütfen kalkış ve varış şehirlerini seçin")
      return
    }

    if (!scheduledDate) {
      setError("Lütfen bir tarih seçin")
      return
    }

    const distance = getDistance()
    const price = calculatePrice()
    const cityPricing = getCityPricing()

    // Store taxi reservation using storage utility
    const taxiReservation = {
      serviceName: selectedService.name,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      vehicleType: selectedVehicle.type,
      pickupCity: fromCity,
      dropoffCity: toCity,
      distance,
      scheduledDate,
      basePrice: selectedService.basePrice,
      pricePerKm: selectedVehicle.pricePerKm,
      additionalFee: cityPricing?.additionalFee || 0,
      discount: cityPricing?.discount || 0,
      totalPrice: price,
    }

    setTempTaxiReservation(taxiReservation)

    toast({
      title: "✅ Rezervasyon Hazır!",
      description: `${selectedService.name} - ${selectedVehicle.name}. Ödeme sayfasına yönlendiriliyorsunuz...`,
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
        <h2 className="text-2xl font-bold mb-4">Hayvan Taksi Hizmeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all ${
                selectedService?.id === service.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedService(service)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Başlangıç Ücreti</p>
                  <p className="font-semibold">₺{service.basePrice}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Km Başına</p>
                  <p className="font-semibold">₺{service.pricePerKm}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Ağırlık</p>
                  <p className="font-semibold">{service.maxPetWeight} kg</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedService.name} - Rezervasyon Detayları</CardTitle>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Kalkış Şehri</label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Şehir seçin</option>
                {mockTurkishCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varış Şehri</label>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Şehir seçin</option>
                {mockTurkishCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Selection */}
            {fromCity && toCity && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Araç Seçimi *</label>
                {taxiVehicles.filter(v => v.isAvailable).length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Şu anda müsait araç bulunmamaktadır. Lütfen yönetici ile iletişime geçin.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <RadioGroup value={selectedVehicle?.id || ""} onValueChange={(value) => {
                    const vehicle = taxiVehicles.find(v => v.id === value)
                    setSelectedVehicle(vehicle || null)
                  }}>
                    <div className="grid gap-3">
                      {taxiVehicles.filter(v => v.isAvailable).map((vehicle) => (
                        <div key={vehicle.id} className="relative">
                          <RadioGroupItem
                            value={vehicle.id}
                            id={vehicle.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={vehicle.id}
                            className="flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-accent transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{vehicle.name}</span>
                                  <Badge variant={vehicle.type === "vip" ? "default" : "secondary"}>
                                    {vehicle.type === "vip" ? "VIP Taksi" : "Paylaşımlı Taksi"}
                                  </Badge>
                                </div>
                                {vehicle.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{vehicle.description}</p>
                                )}
                                {vehicle.features && vehicle.features.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {vehicle.features.map((feature, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">
                                  {vehicle.capacity} kişi
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih ve Saat</label>
              <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>

            {fromCity && toCity && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Güzergah:</span>
                  <span className="font-semibold">{fromCity} → {toCity}</span>
                </div>
                {selectedVehicle && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Seçilen Araç:</span>
                    <span className="font-semibold">{selectedVehicle.name}</span>
                  </div>
                )}
                {getCityPricing() && getCityPricing()!.additionalFee > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Şehirler Arası Ek Ücret:</span>
                    <span className="font-semibold">₺{getCityPricing()!.additionalFee}</span>
                  </div>
                )}
                {getCityPricing() && getCityPricing()!.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim ({getCityPricing()!.discount}%):</span>
                    <span className="font-semibold">
                      -₺{((calculatePrice() / (1 - getCityPricing()!.discount / 100)) * getCityPricing()!.discount / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span className="text-primary">₺{calculatePrice().toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleBooking} className="w-full" size="lg">
              Sepete Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
