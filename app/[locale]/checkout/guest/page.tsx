"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getTempReservation, clearTempReservation, getTempTaxiReservation, clearTempTaxiReservation } from "@/lib/storage"
import { PaymentModal } from "@/components/payment-modal"
import { toast } from "@/components/ui/use-toast"
import { emailService } from "@/lib/email-service"
import type { Order } from "@/lib/types"
import { Hotel, Car, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react"

export default function GuestCheckoutPage() {
  const router = useRouter()
  const [reservationType, setReservationType] = useState<"hotel" | "taxi" | null>(null)
  const [reservation, setReservation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const hotelRes = getTempReservation()
    const taxiRes = getTempTaxiReservation()
    
    if (hotelRes) {
      setReservation(hotelRes)
      setReservationType("hotel")
    } else if (taxiRes) {
      setReservation(taxiRes)
      setReservationType("taxi")
    } else {
      router.push('/tr/home')
    }
  }, [router])

  const handlePayment = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    if (!reservation) return
    
    setIsLoading(true)
    try {
      const guestInfo = reservation.guestInfo || {
        name: "Misafir",
        email: "",
        phone: ""
      }

      const order: Order = {
        id: `order-${Date.now()}`,
        userId: `guest-${Date.now()}`,
        items: [{
          id: `${reservationType}-${Date.now()}`,
          type: reservationType!,
          itemId: reservationType === "hotel" ? reservation.roomId : reservation.vehicleId,
          quantity: reservationType === "hotel" ? reservation.nights : 1,
          price: reservation.totalPrice,
          details: reservation
        }],
        totalPrice: reservation.totalPrice,
        status: "paid",
        paymentMethod: "credit_card",
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Store order
      const orders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
      orders.push(order)
      localStorage.setItem("petfendy_orders", JSON.stringify(orders))

      // Store booking
      const booking = {
        id: `booking-${Date.now()}`,
        userId: null,
        guestInfo,
        type: reservationType,
        ...reservation,
        status: "confirmed",
        createdAt: new Date(),
      }

      const existingBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
      localStorage.setItem("petfendy_bookings", JSON.stringify([...existingBookings, booking]))

      // Store guest order
      const guestOrders = JSON.parse(localStorage.getItem("petfendy_guest_orders") || "[]")
      guestOrders.push({ order, guestInfo, booking })
      localStorage.setItem("petfendy_guest_orders", JSON.stringify(guestOrders))

      // Send confirmation email
      if (guestInfo.email) {
        try {
          await emailService.sendBookingConfirmationEmail({
            customerEmail: guestInfo.email,
            customerName: guestInfo.name,
            bookingType: reservationType!,
            bookingDetails: reservationType === "hotel" 
              ? `${reservation.roomName} (${reservation.nights} gece)`
              : `${reservation.vehicleName} - ${reservation.pickupProvince}/${reservation.pickupDistrict} → ${reservation.dropoffProvince}/${reservation.dropoffDistrict}`,
            bookingDate: new Date(),
            totalAmount: reservation.totalPrice
          })
        } catch (e) {
          console.error("Email error:", e)
        }
      }

      // Clear temp data
      if (reservationType === "hotel") {
        clearTempReservation()
      } else {
        clearTempTaxiReservation()
      }

      setShowPaymentModal(false)
      router.push('/tr/checkout/success')
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "❌ Hata",
        description: "Sipariş işlenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!reservation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-12 h-10">
              <Image
                src="/petfendy-logo.svg"
                alt="Petfendy Logo"
                width={48}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-primary">PETFENDY</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-medium">Bilgiler</span>
          </div>
          <div className="w-12 h-0.5 bg-primary"></div>
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-medium">Ödeme</span>
          </div>
        </div>

        {/* Reservation Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {reservationType === "hotel" ? <Hotel className="w-5 h-5" /> : <Car className="w-5 h-5" />}
              Rezervasyon Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reservationType === "hotel" && (
              <>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="font-semibold text-lg">{reservation.roomName}</p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.checkInDate} - {reservation.checkOutDate} ({reservation.nights} gece)
                  </p>
                  {reservation.petInfo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      🐾 {reservation.petInfo.name} ({reservation.petInfo.breed})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Oda Ücreti ({reservation.nights} gece):</span>
                    <span className="font-medium">₺{reservation.basePrice?.toFixed(2)}</span>
                  </div>
                  
                  {reservation.additionalServices?.length > 0 && (
                    <>
                      <Separator />
                      <p className="text-sm font-medium">Ek Hizmetler:</p>
                      {reservation.additionalServices.map((service: any) => (
                        <div key={service.id} className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground">{service.name}</span>
                          <span>₺{service.price?.toFixed(2)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}

            {reservationType === "taxi" && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-lg">{reservation.vehicleName}</p>
                  <Badge variant="secondary" className="mb-2">
                    {reservation.vehicleType === "vip" ? "VIP Taksi" : "Paylaşımlı Taksi"}
                  </Badge>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📍 Kalkış: {reservation.pickupProvince}/{reservation.pickupDistrict}</p>
                    {reservation.pickupAddress && <p className="pl-5 text-xs">{reservation.pickupAddress}</p>}
                    <p>🎯 Varış: {reservation.dropoffProvince}/{reservation.dropoffDistrict}</p>
                    {reservation.dropoffAddress && <p className="pl-5 text-xs">{reservation.dropoffAddress}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    🚗 {reservation.distance} km
                  </p>
                  {reservation.petInfo && (
                    <p className="text-sm text-muted-foreground mt-1">
                      🐾 {reservation.petInfo.name} ({reservation.petInfo.breed})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mesafe:</span>
                    <span className="font-medium">{reservation.distance} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Km Başı Ücret:</span>
                    <span className="font-medium">₺{reservation.pricePerKm}/km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Toplam Mesafe Ücreti:</span>
                    <span className="font-medium">₺{(reservation.pricePerKm * reservation.distance).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Guest Info */}
            {reservation.guestInfo && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium mb-1">İletişim Bilgileri:</p>
                <p>👤 {reservation.guestInfo.name}</p>
                <p>📧 {reservation.guestInfo.email}</p>
                <p>📱 {reservation.guestInfo.phone}</p>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold pt-2">
              <span>Toplam:</span>
              <span className="text-primary">₺{reservation.totalPrice?.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Button 
          className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "İşleniyor..." : "💳 Ödemeyi Tamamla"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Ödeme işlemi güvenli SSL bağlantısı ile gerçekleştirilmektedir.
        </p>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        cartItems={[{
          id: `${reservationType}-${Date.now()}`,
          type: reservationType!,
          itemId: reservationType === "hotel" ? reservation.roomId : reservation.vehicleId,
          quantity: 1,
          price: reservation.totalPrice,
          details: reservation
        }]}
        totalAmount={reservation.totalPrice}
        userEmail={reservation.guestInfo?.email || ""}
      />
    </div>
  )
}
