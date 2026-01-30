"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { CartItem, Order } from "@/lib/types"
import { getCart, removeFromCart, clearCart } from "@/lib/storage"
import { useAuth } from "./auth-context"
import { PaymentModal } from "./payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { useTranslations } from 'next-intl';
import { emailService } from "@/lib/email-service"
import { toast } from "@/components/ui/use-toast"

export function Cart() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const t = useTranslations('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isGuestCheckout, setIsGuestCheckout] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    setCartItems(getCart())
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartItems(getCart())
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdate)
      
      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate)
      }
    }
  }, [])

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId)
    setCartItems(getCart())
  }

  const calculateTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + item.price, 0)
  }

  const handleCheckout = () => {
    // If user is not authenticated, redirect to login page
    if (!isAuthenticated) {
      toast({
        title: "Giriş Gerekli",
        description: "Siparişi tamamlamak için giriş yapmanız gerekiyor.",
        duration: 3000,
      })
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/tr') // Will redirect to auth page
      }, 1500)
      return
    }

    // Validate guest information if guest checkout (this should not happen now)
    if (!isAuthenticated && isGuestCheckout) {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
        alert("Lütfen tüm bilgileri doldurun")
        return
      }
    }

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    setIsLoading(true)
    try {
      const order: Order = {
        id: `order-${Date.now()}`,
        userId: isAuthenticated ? user?.id || "guest" : `guest-${Date.now()}`,
        items: cartItems,
        totalPrice: calculateTotal(),
        status: "paid",
        paymentMethod: "credit_card",
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Store order in localStorage
      const orders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
      orders.push(order)
      localStorage.setItem("petfendy_orders", JSON.stringify(orders))

      // Create bookings from cart items
      const bookings = cartItems.map(item => ({
        id: `booking-${Date.now()}-${Math.random()}`,
        userId: isAuthenticated ? user?.id || null : null,
        type: item.type,
        totalPrice: item.price,
        status: "confirmed" as const,
        createdAt: new Date(),
        ...item.details
      }))

      // Store bookings
      const existingBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
      localStorage.setItem("petfendy_bookings", JSON.stringify([...existingBookings, ...bookings]))

      // Store guest info if guest checkout
      if (!isAuthenticated && isGuestCheckout) {
        const guestOrders = JSON.parse(localStorage.getItem("petfendy_guest_orders") || "[]")
        guestOrders.push({
          order,
          guestInfo,
        })
        localStorage.setItem("petfendy_guest_orders", JSON.stringify(guestOrders))
      }

      // Send confirmation email and invoice
      const customerEmail = isAuthenticated ? user?.email || "" : guestInfo.email
      const customerName = isAuthenticated ? user?.name || "" : guestInfo.name

      if (customerEmail && customerName) {
        // Send booking confirmation email
        await emailService.sendBookingConfirmationEmail({
          customerEmail,
          customerName,
          bookingType: cartItems[0].type,
          bookingDetails: cartItems.map(i => 
            i.type === "hotel" ? `${i.details.roomName} (${i.quantity} gece)` : 
            `${i.details.serviceName} (${i.details.distance} km)`
          ).join(", "),
          bookingDate: new Date(),
          totalAmount: calculateTotal()
        })

        // Send invoice email
        await emailService.sendInvoiceEmail({
          customerName,
          customerEmail,
          invoiceNumber: order.invoiceNumber,
          totalAmount: calculateTotal(),
          items: cartItems.map(item => ({
            name: item.type === "hotel" ? item.details.roomName : item.details.serviceName,
            quantity: item.quantity,
            price: item.price
          }))
        })

        // Show success toast
        toast({
          title: "✅ Sipariş Başarılı!",
          description: `Rezervasyonunuz oluşturuldu. Fatura ${customerEmail} adresine gönderildi.`,
          duration: 5000,
        })
      }

      clearCart()
      setCartItems([])
      setPaymentSuccess(true)
      setIsGuestCheckout(false)
      setGuestInfo({ name: "", email: "", phone: "" })
      setShowPaymentModal(false)

      setTimeout(() => setPaymentSuccess(false), 5000)
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
    if (isGuestCheckout && guestInfo.email) {
      return guestInfo.email
    }
    return ""
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{t('empty')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        cartItems={cartItems}
        totalAmount={calculateTotal()}
        userEmail={getUserEmail()}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('title')} ({cartItems.length} ürün)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentSuccess && (
            <Alert>
              <AlertDescription className="text-green-600">Ödeme başarılı! Siparişiniz alındı.</AlertDescription>
            </Alert>
          )}

        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="font-semibold">
                  {item.type === "hotel" ? item.details.roomName : item.details.serviceName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.type === "hotel" ? `${item.quantity} gece` : `${item.details.distance} km`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold">₺{item.price.toFixed(2)}</p>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between text-lg font-bold">
            <span>{t('total')}:</span>
            <span className="text-primary">₺{calculateTotal().toFixed(2)}</span>
          </div>

          {!isAuthenticated && !isGuestCheckout && (
            <Button onClick={() => setIsGuestCheckout(true)} variant="outline" className="w-full">
              {t('continueAsGuest')}
            </Button>
          )}

          {!isAuthenticated && isGuestCheckout && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium">Misafir Bilgileri</p>
                <Input
                  placeholder="Ad Soyad"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="E-posta"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                />
                <Input
                  type="tel"
                  placeholder="Telefon"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                />
                <Button variant="ghost" size="sm" onClick={() => setIsGuestCheckout(false)} className="w-full">
                  İptal
                </Button>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            disabled={isLoading || (!isAuthenticated && !isGuestCheckout)}
          >
            {isLoading ? "İşleniyor..." : t('checkout')}
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  )
}
