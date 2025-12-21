"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getTempReservation, clearTempReservation, getTempTaxiReservation, clearTempTaxiReservation, type TaxiReservationData } from "@/lib/storage"
import { useAuth } from "@/components/auth-context"
import { PaymentModal } from "@/components/payment-modal"
import { toast } from "@/components/ui/use-toast"
import { emailService } from "@/lib/email-service"
import type { HotelReservationData, Order } from "@/lib/types"
import { ShoppingBag, User, CreditCard, Car, Hotel } from "lucide-react"

type ReservationType = "hotel" | "taxi"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [reservationType, setReservationType] = useState<ReservationType | null>(null)
  const [hotelReservation, setHotelReservation] = useState<HotelReservationData | null>(null)
  const [taxiReservation, setTaxiReservation] = useState<TaxiReservationData | null>(null)
  const [checkoutStep, setCheckoutStep] = useState<"select" | "guest-info" | "payment">("select")
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Guest information
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    const tempHotelReservation = getTempReservation()
    const tempTaxiReservation = getTempTaxiReservation()
    
    if (tempHotelReservation) {
      setHotelReservation(tempHotelReservation)
      setReservationType("hotel")
    } else if (tempTaxiReservation) {
      setTaxiReservation(tempTaxiReservation)
      setReservationType("taxi")
    } else {
      router.push('/tr/home')
      return
    }
  }, [router])

  const calculateTotal = (): number => {
    if (reservationType === "hotel" && hotelReservation) {
      return hotelReservation.totalPrice || 0
    }
    if (reservationType === "taxi" && taxiReservation) {
      return taxiReservation.totalPrice || 0
    }
    return 0
  }

  const handleMemberLogin = () => {
    router.push('/tr')
  }

  const handleGuestCheckout = () => {
    setCheckoutStep("guest-info")
  }

  const handleGuestInfoSubmit = () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm bilgileri doldurun.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestInfo.email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive",
      })
      return
    }

    setCheckoutStep("payment")
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    setIsLoading(true)
    try {
      const customerEmail = isAuthenticated ? user?.email || "" : guestInfo.email
      const customerName = isAuthenticated ? user?.name || "" : guestInfo.name

      if (reservationType === "hotel" && hotelReservation) {
        const order: Order = {
          id: `order-${Date.now()}`,
          userId: isAuthenticated ? user?.id || "guest" : `guest-${Date.now()}`,
          items: [{
            id: `hotel-${Date.now()}`,
            type: "hotel",
            itemId: hotelReservation.roomId,
            quantity: hotelReservation.nights,
            price: hotelReservation.totalPrice,
            details: {
              roomName: hotelReservation.roomName,
              checkInDate: hotelReservation.checkInDate,
              checkOutDate: hotelReservation.checkOutDate,
              petCount: hotelReservation.petCount,
              specialRequests: hotelReservation.specialRequests,
              additionalServices: hotelReservation.additionalServices,
            }
          }],
          totalPrice: calculateTotal(),
          status: "paid",
          paymentMethod: "credit_card",
          invoiceNumber: `INV-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const orders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
        orders.push(order)
        localStorage.setItem("petfendy_orders", JSON.stringify(orders))

        const booking = {
          id: `booking-${Date.now()}`,
          userId: isAuthenticated ? user?.id || null : null,
          guestInfo: !isAuthenticated ? guestInfo : null,
          type: "hotel" as const,
          roomId: hotelReservation.roomId,
          roomName: hotelReservation.roomName,
          checkInDate: hotelReservation.checkInDate,
          checkOutDate: hotelReservation.checkOutDate,
          petCount: hotelReservation.petCount,
          specialRequests: hotelReservation.specialRequests,
          additionalServices: hotelReservation.additionalServices,
          totalPrice: hotelReservation.totalPrice,
          status: "confirmed" as const,
          createdAt: new Date(),
        }

        const existingBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
        localStorage.setItem("petfendy_bookings", JSON.stringify([...existingBookings, booking]))

        if (customerEmail && customerName) {
          await emailService.sendBookingConfirmationEmail({
            customerEmail,
            customerName,
            bookingType: "hotel",
            bookingDetails: `${hotelReservation.roomName} (${hotelReservation.nights} gece, ${hotelReservation.petCount} hayvan)`,
            bookingDate: new Date(),
            totalAmount: calculateTotal()
          })
        }

        clearTempReservation()
      }

      if (reservationType === "taxi" && taxiReservation) {
        const order: Order = {
          id: `order-${Date.now()}`,
          userId: isAuthenticated ? user?.id || "guest" : `guest-${Date.now()}`,
          items: [{
            id: `taxi-${Date.now()}`,
            type: "taxi",
            itemId: taxiReservation.vehicleId,
            quantity: 1,
            price: taxiReservation.totalPrice,
            details: {
              serviceName: taxiReservation.serviceName,
              vehicleName: taxiReservation.vehicleName,
              pickupCity: taxiReservation.pickupCity,
              dropoffCity: taxiReservation.dropoffCity,
              distance: taxiReservation.distance,
              scheduledDate: taxiReservation.scheduledDate,
              isRoundTrip: taxiReservation.isRoundTrip,
            }
          }],
          totalPrice: calculateTotal(),
          status: "paid",
          paymentMethod: "credit_card",
          invoiceNumber: `INV-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const orders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
        orders.push(order)
        localStorage.setItem("petfendy_orders", JSON.stringify(orders))

        const booking = {
          id: `booking-${Date.now()}`,
          userId: isAuthenticated ? user?.id || null : null,
          guestInfo: !isAuthenticated ? guestInfo : null,
          type: "taxi" as const,
          serviceName: taxiReservation.serviceName,
          vehicleId: taxiReservation.vehicleId,
          vehicleName: taxiReservation.vehicleName,
          pickupCity: taxiReservation.pickupCity,
          dropoffCity: taxiReservation.dropoffCity,
          distance: taxiReservation.distance,
          scheduledDate: taxiReservation.scheduledDate,
          isRoundTrip: taxiReservation.isRoundTrip,
          totalPrice: taxiReservation.totalPrice,
          status: "confirmed" as const,
          createdAt: new Date(),
        }

        const existingBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
        localStorage.setItem("petfendy_bookings", JSON.stringify([...existingBookings, booking]))

        if (customerEmail && customerName) {
          await emailService.sendBookingConfirmationEmail({
            customerEmail,
            customerName,
            bookingType: "taxi",
            bookingDetails: `${taxiReservation.vehicleName} - ${taxiReservation.pickupCity} → ${taxiReservation.dropoffCity} (${taxiReservation.distance} km)`,
            bookingDate: new Date(),
            totalAmount: calculateTotal()
          })
        }

        clearTempTaxiReservation()
      }

      if (!isAuthenticated) {
        const guestOrders = JSON.parse(localStorage.getItem("petfendy_guest_orders") || "[]")
        guestOrders.push({
          type: reservationType,
          guestInfo,
          totalPrice: calculateTotal(),
          createdAt: new Date(),
        })
        localStorage.setItem("petfendy_guest_orders", JSON.stringify(guestOrders))
      }

      setShowPaymentModal(false)
      router.push('/tr/checkout/success')
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "❌ Hata",
        description: "Sipariş işlenirken bir hata oluştu.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUserEmail = () => {
    if (isAuthenticated && user?.email) {
      return user.email
    }
    if (checkoutStep === "payment" && guestInfo.email) {
      return guestInfo.email
    }
    return ""
  }

  useEffect(() => {
    if (isAuthenticated && checkoutStep === "select") {
      setCheckoutStep("payment")
      setShowPaymentModal(true)
    }
  }, [isAuthenticated, checkoutStep])

  if (!reservationType) {
    return null
  }

  const getCartItems = () => {
    if (reservationType === "hotel" && hotelReservation) {
      return [{
        id: `hotel-${Date.now()}`,
        type: "hotel" as const,
        itemId: hotelReservation.roomId,
        quantity: hotelReservation.nights,
        price: hotelReservation.totalPrice,
        details: {
          roomName: hotelReservation.roomName,
          checkInDate: hotelReservation.checkInDate,
          checkOutDate: hotelReservation.checkOutDate,
        }
      }]
    }
    if (reservationType === "taxi" && taxiReservation) {
      return [{
        id: `taxi-${Date.now()}`,
        type: "taxi" as const,
        itemId: taxiReservation.vehicleId,
        quantity: 1,
        price: taxiReservation.totalPrice,
        details: {
          vehicleName: taxiReservation.vehicleName,
          pickupCity: taxiReservation.pickupCity,
          dropoffCity: taxiReservation.dropoffCity,
        }
      }]
    }
    return []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-16 h-12">
              <Image
                src="/petfendy-logo.svg"
                alt="Petfendy Logo"
                width={64}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xl font-bold text-primary">PETFENDY</h1>
              <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                Rezervasyon ve Ödeme
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={() => router.push('/tr/home')}>
            Geri Dön
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${checkoutStep === "select" ? "text-primary" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === "select" ? "bg-primary text-white" : "bg-gray-200"}`}>
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">Giriş Seçimi</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${checkoutStep === "guest-info" ? "text-primary" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === "guest-info" ? "bg-primary text-white" : "bg-gray-200"}`}>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">Bilgiler</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center gap-2 ${checkoutStep === "payment" ? "text-primary" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === "payment" ? "bg-primary text-white" : "bg-gray-200"}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-medium">Ödeme</span>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {reservationType === "hotel" ? <Hotel className="w-5 h-5" /> : <Car className="w-5 h-5" />}
              {reservationType === "hotel" ? "Otel Rezervasyonu" : "Taksi Rezervasyonu"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              {reservationType === "hotel" && hotelReservation && (
                <>
                  <div>
                    <p className="font-semibold text-lg">{hotelReservation.roomName}</p>
                    <p className="text-sm text-muted-foreground">
                      {hotelReservation.checkInDate} - {hotelReservation.checkOutDate} ({hotelReservation.nights} gece)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hotelReservation.petCount} hayvan
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Oda Ücreti:</span>
                      <span className="font-medium">₺{hotelReservation.basePrice.toFixed(2)}</span>
                    </div>
                    {hotelReservation.additionalServices && hotelReservation.additionalServices.length > 0 && (
                      <>
                        <div className="text-sm font-medium pt-2">Ek Hizmetler:</div>
                        {hotelReservation.additionalServices.map((service: { id: string; name: string; price: number }) => (
                          <div key={service.id} className="flex justify-between text-sm pl-4">
                            <span className="text-muted-foreground">{service.name}</span>
                            <span>₺{service.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}

              {reservationType === "taxi" && taxiReservation && (
                <>
                  <div>
                    <p className="font-semibold text-lg">{taxiReservation.vehicleName}</p>
                    <Badge variant="secondary" className="mb-2">
                      {taxiReservation.vehicleType === "vip" ? "VIP Taksi" : "Paylaşımlı Taksi"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {taxiReservation.pickupCity} → {taxiReservation.dropoffCity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {taxiReservation.distance} km {taxiReservation.isRoundTrip && "(Gidiş-Dönüş)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tarih: {new Date(taxiReservation.scheduledDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Başlangıç Ücreti:</span>
                      <span className="font-medium">₺{taxiReservation.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Mesafe Ücreti ({taxiReservation.distance} km):</span>
                      <span className="font-medium">₺{(taxiReservation.pricePerKm * taxiReservation.distance).toFixed(2)}</span>
                    </div>
                    {taxiReservation.isRoundTrip && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Gidiş-Dönüş:</span>
                        <span className="font-medium">x2</span>
                      </div>
                    )}
                    {taxiReservation.additionalFee > 0 && (
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>Ek Ücret:</span>
                        <span className="font-medium">₺{taxiReservation.additionalFee.toFixed(2)}</span>
                      </div>
                    )}
                    {taxiReservation.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>İndirim ({taxiReservation.discount}%):</span>
                        <span className="font-medium">-₺{((taxiReservation.totalPrice / (1 - taxiReservation.discount / 100)) * taxiReservation.discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-center text-xl font-bold">
              <span>Toplam:</span>
              <span className="text-primary">₺{calculateTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Step: Select Login Method */}
        {checkoutStep === "select" && (
          <div className="space-y-6">
            <Card className="border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer" onClick={handleMemberLogin}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Üye Olarak Devam Et
                </CardTitle>
                <CardDescription>
                  Hesabınıza giriş yaparak rezervasyonlarınızı takip edin ve özel avantajlardan yararlanın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Giriş Yap / Üye Ol
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            <Card className="border-2 border-gray-200 hover:border-primary/50 transition-colors cursor-pointer" onClick={handleGuestCheckout}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Misafir Olarak Devam Et
                </CardTitle>
                <CardDescription>
                  Üye olmadan hızlıca rezervasyon yapın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  Misafir Olarak Devam Et
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step: Guest Information */}
        {checkoutStep === "guest-info" && (
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileriniz</CardTitle>
              <CardDescription>
                Rezervasyon detaylarını göndermek için bilgilerinize ihtiyacımız var
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad *</Label>
                <Input
                  id="name"
                  placeholder="Ad Soyad"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                />
              </div>

              <Alert>
                <AlertDescription>
                  Rezervasyon onayı ve fatura bu e-posta adresine gönderilecektir.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCheckoutStep("select")}
                >
                  Geri
                </Button>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGuestInfoSubmit}
                >
                  Ödemeye Geç
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            if (!isAuthenticated) {
              setCheckoutStep("guest-info")
            }
          }}
          onSuccess={handlePaymentSuccess}
          cartItems={getCartItems()}
          totalAmount={calculateTotal()}
          userEmail={getUserEmail()}
        />
      </div>
    </div>
  )
}
