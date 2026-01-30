"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from 'next-intl';
import { Calendar, MapPin, CreditCard, Hotel, Car } from "lucide-react"

interface Booking {
  id: string
  userId: string | null
  type: "hotel" | "taxi"
  totalPrice: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date | string
  roomName?: string
  checkInDate?: string
  checkOutDate?: string
  serviceName?: string
  pickupLocation?: string
  dropoffLocation?: string
  distance?: number
}

export function UserProfile() {
  const { user } = useAuth()
  const t = useTranslations('profile');
  const [isEditing, setIsEditing] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  })
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Load user bookings
    const allBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
    const userBookings = allBookings.filter((b: Booking) => b.userId === user?.id)
    setBookings(userBookings)
  }, [user?.id])

  const handleSave = () => {
    setSuccess("Profil güncellendi")
    setTimeout(() => setSuccess(""), 3000)
    setIsEditing(false)
  }

  const handleCancelBooking = (bookingId: string) => {
    const allBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
    const updatedBookings = allBookings.map((b: Booking) => 
      b.id === bookingId ? { ...b, status: "cancelled" } : b
    )
    localStorage.setItem("petfendy_bookings", JSON.stringify(updatedBookings))
    setBookings(updatedBookings.filter((b: Booking) => b.userId === user?.id))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {t(`statusTypes.${status}`)}
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">{t('personalInfo')}</TabsTrigger>
          <TabsTrigger value="reservations">{t('myReservations')}</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('personalInfo')}</CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad Soyad</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-posta</label>
                <Input value={formData.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+90 555 123 45 67"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  İptal
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ad Soyad</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Düzenle
              </Button>
            </>
          )}
        </CardContent>
      </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hesap Güvenliği</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent">
                Şifreyi Değiştir
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                İki Faktörlü Kimlik Doğrulama
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">{t('noReservations')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {booking.type === "hotel" ? (
                          <Hotel className="w-5 h-5 text-primary" />
                        ) : (
                          <Car className="w-5 h-5 text-primary" />
                        )}
                        <div>
                          <CardTitle className="text-lg">
                            {booking.type === "hotel" ? t('hotelReservation') : t('taxiReservation')}
                          </CardTitle>
                          <CardDescription>
                            {booking.type === "hotel" ? booking.roomName : booking.serviceName}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {booking.type === "hotel" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('reservationDetails.checkIn')}</p>
                              <p className="text-sm font-medium">
                                {booking.checkInDate ? formatDate(booking.checkInDate) : "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('reservationDetails.checkOut')}</p>
                              <p className="text-sm font-medium">
                                {booking.checkOutDate ? formatDate(booking.checkOutDate) : "-"}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('reservationDetails.pickupLocation')}</p>
                              <p className="text-sm font-medium">{booking.pickupLocation || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">{t('reservationDetails.dropoffLocation')}</p>
                              <p className="text-sm font-medium">{booking.dropoffLocation || "-"}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t('totalPrice')}</p>
                          <p className="text-lg font-bold text-primary">₺{booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          {t('cancelReservation')}
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {t('createdAt')}: {formatDate(booking.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
