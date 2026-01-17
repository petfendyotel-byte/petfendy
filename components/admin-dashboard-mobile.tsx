"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { 
  Menu,
  Plus, 
  Trash2, 
  Edit, 
  Hotel,
  Car,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Filter,
  Download,
  CreditCard,
  FileText,
  Settings,
  MoreVertical,
  Eye,
  X
} from "lucide-react"

interface MobileAdminProps {
  className?: string
}

export function AdminDashboardMobile({ className }: MobileAdminProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  // Load data from localStorage
  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    const storedRooms = JSON.parse(localStorage.getItem("petfendy_rooms") || "[]")
    const storedBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
    
    setOrders(storedOrders)
    setRooms(storedRooms)
    setBookings(storedBookings)
  }, [])

  // Calculate stats
  const totalOrders = orders.length
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const hotelBookings = bookings.filter(b => b.type === "hotel").length
  const taxiBookings = bookings.filter(b => b.type === "taxi").length

  const menuItems = [
    { id: "dashboard", label: "Özet", icon: TrendingUp },
    { id: "orders", label: "Siparişler", icon: ShoppingBag },
    { id: "rooms", label: "Odalar", icon: Hotel },
    { id: "vehicles", label: "Taksi", icon: Car },
    { id: "pricing", label: "Fiyatlar", icon: DollarSign },
    { id: "payment", label: "Ödeme", icon: CreditCard },
    { id: "reports", label: "Raporlar", icon: FileText },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ]

  const MobileMenuItem = ({ item, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-xl transition-all duration-200 ${
        isActive 
          ? "bg-primary text-primary-foreground shadow-md scale-[0.98]" 
          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground hover:scale-[0.99]"
      }`}
    >
      <div className={`p-2 rounded-lg ${
        isActive 
          ? "bg-primary-foreground/20" 
          : "bg-muted"
      }`}>
        <item.icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <span className="font-medium text-sm">{item.label}</span>
        {item.id === "orders" && totalOrders > 0 && (
          <p className="text-xs opacity-75">{totalOrders} sipariş</p>
        )}
        {item.id === "rooms" && rooms.length > 0 && (
          <p className="text-xs opacity-75">{rooms.length} oda</p>
        )}
      </div>
      {isActive && (
        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
      )}
    </button>
  )

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-primary/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b bg-primary/5">
                  <SheetTitle className="text-left">🐾 Petfendy Yönetim</SheetTitle>
                  <p className="text-sm text-muted-foreground text-left">
                    Hoş geldiniz, Admin
                  </p>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-1">
                    {menuItems.map((item) => (
                      <MobileMenuItem
                        key={item.id}
                        item={item}
                        isActive={activeTab === item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          setShowMobileMenu(false)
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Footer in menu */}
                  <div className="p-4 border-t mt-4">
                    <div className="text-center text-xs text-muted-foreground">
                      <p>Petfendy v1.0.0</p>
                      <p>© 2024 Tüm hakları saklıdır</p>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-bold">
                {menuItems.find(item => item.id === activeTab)?.label || "Yönetim"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeTab === "dashboard" && "Genel bakış"}
                {activeTab === "orders" && `${totalOrders} sipariş`}
                {activeTab === "rooms" && `${rooms.length} oda`}
                {activeTab === "vehicles" && "Araç yönetimi"}
                {activeTab === "pricing" && "Fiyat ayarları"}
                {activeTab === "payment" && "Ödeme sistemi"}
                {activeTab === "reports" && "Analiz ve raporlar"}
                {activeTab === "settings" && "Sistem ayarları"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification badge */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{totalOrders}</span>
                </div>
              </Button>
              {totalOrders > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Sipariş</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Toplam</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-500/10 rounded-md">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Ciro</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">₺{totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Toplam</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-500/10 rounded-md">
                      <Hotel className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Otel</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{hotelBookings}</p>
                  <p className="text-xs text-muted-foreground">Rezervasyon</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-md">
                      <Car className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-xs text-muted-foreground">Taksi</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{taxiBookings}</p>
                  <p className="text-xs text-muted-foreground">Rezervasyon</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  ⚡ Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors"
                    onClick={() => setActiveTab("rooms")}
                  >
                    <Plus className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium">Oda Ekle</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors"
                    onClick={() => setActiveTab("vehicles")}
                  >
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium">Araç Ekle</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium">Siparişler</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2 hover:bg-primary/5 hover:border-primary/20 transition-colors"
                    onClick={() => setActiveTab("reports")}
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium">Rapor Al</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Son Siparişler</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                  >
                    Tümü
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 3).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Henüz sipariş yok</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">#{order.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₺{order.totalPrice?.toFixed(2) || "0.00"}</p>
                          <Badge variant="outline" className="text-xs">
                            {order.status === "pending" ? "Beklemede" : 
                             order.status === "paid" ? "Ödendi" : 
                             order.status === "completed" ? "Tamamlandı" : "İptal"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Henüz sipariş yok</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">#{order.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {order.status === "pending" ? "Beklemede" : 
                           order.status === "paid" ? "Ödendi" : 
                           order.status === "completed" ? "Tamamlandı" : "İptal"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {item.type === "hotel" ? (
                              <Hotel className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Car className="w-4 h-4 text-green-500" />
                            )}
                            <span>
                              {item.type === "hotel" 
                                ? `${item.details?.roomName} (${item.quantity}g)` 
                                : `${item.details?.serviceName} (${item.details?.distance}km)`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">₺{order.totalPrice?.toFixed(2) || "0.00"}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === "rooms" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Otel Odaları</h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Oda Ekle
              </Button>
            </div>

            {rooms.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Hotel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Henüz oda eklenmemiş</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Odayı Ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium">{room.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                          <p className="text-sm text-muted-foreground">Kapasite: {room.capacity} hayvan</p>
                        </div>
                        <Badge variant={room.available ? "default" : "secondary"}>
                          {room.available ? "Müsait" : "Dolu"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">₺{room.pricePerNight}/gece</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pet Taksi Araçları</h2>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Araç Ekle
              </Button>
            </div>
            
            {/* Taksi Fiyat Ayarları */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  KM Fiyatları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">VIP (₺/km)</label>
                    <Input type="number" placeholder="15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Paylaşımlı (₺/km)</label>
                    <Input type="number" placeholder="8" className="mt-1" />
                  </div>
                </div>
                <Button size="sm" className="w-full">Kaydet</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-8">
                <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz araç eklenmemiş</p>
                <Button className="mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Aracı Ekle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Fiyatlandırma</h2>
            
            {/* Oda Fiyatları */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Oda Fiyatları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Standart Oda</span>
                    <span className="font-medium">₺150/gece</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Deluxe Oda</span>
                    <span className="font-medium">₺250/gece</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Suite Oda</span>
                    <span className="font-medium">₺400/gece</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">Fiyatları Düzenle</Button>
              </CardContent>
            </Card>

            {/* Ek Hizmet Fiyatları */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ek Hizmetler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Traş ve Bakım</span>
                      <p className="text-xs text-muted-foreground">₺15/kg</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Veteriner Kontrolü</span>
                      <p className="text-xs text-muted-foreground">Oda tipine göre</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Hizmet Ekle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ödeme Ayarları</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ödeme Yöntemleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">PayTR</span>
                    </div>
                    <Badge variant="default">Aktif</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">Paratika</span>
                    </div>
                    <Badge variant="secondary">Pasif</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ödeme Yöntemi Ekle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Modu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Test ödemeleri aktif</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Test modunda gerçek ödeme alınmaz
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Raporlar</h2>
            
            {/* Hızlı Raporlar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hızlı Raporlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Günlük Satış Raporu
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Haftalık Özet
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Aylık Gelir Raporu
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Müşteri Listesi
                </Button>
              </CardContent>
            </Card>

            {/* Rapor Filtreleri */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Özel Rapor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Başlangıç Tarihi</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Bitiş Tarihi</label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Rapor Tipi</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Satış Raporu</SelectItem>
                      <SelectItem value="bookings">Rezervasyon Raporu</SelectItem>
                      <SelectItem value="revenue">Gelir Raporu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Rapor Oluştur
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ayarlar</h2>
            
            {/* Genel Ayarlar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Genel Ayarlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">İşletme Adı</label>
                  <Input defaultValue="Petfendy" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">İletişim E-postası</label>
                  <Input defaultValue="petfendyotel@gmail.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefon</label>
                  <Input placeholder="+90 XXX XXX XX XX" className="mt-1" />
                </div>
                <Button className="w-full">Kaydet</Button>
              </CardContent>
            </Card>

            {/* Bildirim Ayarları */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bildirimler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Yeni sipariş bildirimi</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">E-posta bildirimleri</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS bildirimleri</span>
                  <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistem Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Versiyon</span>
                  <span>v1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Son Güncelleme</span>
                  <span>{new Date().toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durum</span>
                  <Badge variant="default">Çevrimiçi</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}