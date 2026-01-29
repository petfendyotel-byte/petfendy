"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail, Calendar, Download, Home } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // Get the latest order from localStorage
    const orders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    if (orders.length > 0) {
      const latestOrder = orders[orders.length - 1]
      setOrderDetails(latestOrder)
    }
  }, [])

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                Rezervasyon Başarılı
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/tr/home')}
          >
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfa
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Rezervasyonunuz Tamamlandı!</h1>
          <p className="text-lg text-muted-foreground">
            Ödemeniz başarıyla alındı ve rezervasyonunuz oluşturuldu.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sipariş Detayları</CardTitle>
            <CardDescription>Sipariş No: {orderDetails.invoiceNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {item.type === "hotel" ? item.details.roomName : item.details.serviceName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.type === "hotel"
                        ? `${item.details.checkInDate} - ${item.details.checkOutDate} (${item.quantity} gece)`
                        : `${item.details.pickupCity}/${item.details.pickupDistrict} → ${item.details.dropoffCity}/${item.details.dropoffDistrict} (${item.details.distance} km)`
                      }
                    </p>
                  </div>
                  <p className="font-bold">₺{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Toplam Ödenen:</span>
                <span className="text-primary">₺{orderDetails.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5" />
                E-posta Onayı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rezervasyon detayları ve faturanız e-posta adresinize gönderildi.
                Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Sonraki Adımlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rezervasyon tarihinden önce size e-posta ve SMS ile hatırlatma göndereceğiz.
                Sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1"
            size="lg"
            onClick={() => router.push('/tr/home')}
          >
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4 mr-2" />
            Faturayı Yazdır
          </Button>
        </div>

        {/* Contact Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-gray-700 mb-2">
              <strong>Sorularınız mı var?</strong>
            </p>
            <p className="text-center text-sm text-gray-600">
              Tel: +90 532 307 3264 | Email: petfendyotel@gmail.com
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Pazartesi - Pazar: 08:00 - 20:00
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
