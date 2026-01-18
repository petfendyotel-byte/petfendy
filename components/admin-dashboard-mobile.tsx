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
  Home,
  BarChart3,
  Users,
  Bell,
  Search,
  ChevronRight,
  Star,
  Phone
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
    { id: "dashboard", label: "Ana Sayfa", icon: Home, color: "bg-blue-500" },
    { id: "orders", label: "Siparişler", icon: ShoppingBag, color: "bg-green-500", badge: totalOrders },
    { id: "rooms", label: "Odalar", icon: Hotel, color: "bg-purple-500", badge: rooms.length },
    { id: "vehicles", label: "Taksi", icon: Car, color: "bg-orange-500" },
    { id: "pricing", label: "Fiyatlar", icon: DollarSign, color: "bg-emerald-500" },
    { id: "reports", label: "Raporlar", icon: BarChart3, color: "bg-indigo-500" },
    { id: "settings", label: "Ayarlar", icon: Settings, color: "bg-gray-500" },
  ]

  const MobileMenuItem = ({ item, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 text-left rounded-2xl transition-all duration-300 ${
        isActive 
          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg transform scale-[0.98]" 
          : "hover:bg-gray-50 text-gray-700 hover:scale-[0.99] active:scale-[0.97]"
      }`}
    >
      <div className={`p-3 rounded-xl ${
        isActive 
          ? "bg-white/20" 
          : `${item.color} text-white`
      }`}>
        <item.icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <span className="font-semibold text-base">{item.label}</span>
        {item.badge && (
          <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
            {item.badge} adet
          </p>
        )}
      </div>
      {item.badge && (
        <Badge variant={isActive ? "secondary" : "default"} className="text-xs">
          {item.badge}
        </Badge>
      )}
      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/60' : 'text-gray-400'}`} />
    </button>
  )

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Modern Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2.5 hover:bg-primary/10 rounded-xl">
                  <Menu className="w-6 h-6 text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white">
                <SheetHeader className="p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🐾</span>
                    </div>
                    <div>
                      <SheetTitle className="text-left text-white text-xl font-bold">
                        Petfendy
                      </SheetTitle>
                      <p className="text-white/80 text-sm text-left">
                        Yönetim Paneli
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
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
                  <div className="p-6 border-t border-gray-100 mt-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                        <span className="text-2xl">🐾</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Petfendy v1.0.0</p>
                      <p className="text-xs text-gray-500">© 2024 Tüm hakları saklıdır</p>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || "Yönetim"}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === "dashboard" && "Genel bakış ve istatistikler"}
                {activeTab === "orders" && `${totalOrders} aktif sipariş`}
                {activeTab === "rooms" && `${rooms.length} oda kayıtlı`}
                {activeTab === "vehicles" && "Araç ve taksi yönetimi"}
                {activeTab === "pricing" && "Fiyat ayarları"}
                {activeTab === "reports" && "Analiz ve raporlar"}
                {activeTab === "settings" && "Sistem ayarları"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="p-2.5 rounded-xl">
              <Search className="w-5 h-5 text-gray-600" />
            </Button>
            {/* Notification with badge */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2.5 rounded-xl">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
              {totalOrders > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{totalOrders}</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="p-2.5 rounded-xl">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Hoş Geldiniz! 👋</h2>
                    <p className="text-white/80">
                      Bugün {new Date().toLocaleDateString("tr-TR", { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">🐾</div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-500 rounded-xl">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Siparişler</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-800 mb-1">{totalOrders}</p>
                  <p className="text-xs text-blue-600">Toplam sipariş</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-green-500 rounded-xl">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Ciro</span>
                  </div>
                  <p className="text-3xl font-bold text-green-800 mb-1">₺{totalRevenue.toFixed(0)}</p>
                  <p className="text-xs text-green-600">Toplam gelir</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-purple-500 rounded-xl">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-700">Otel</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-800 mb-1">{hotelBookings}</p>
                  <p className="text-xs text-purple-600">Rezervasyon</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-orange-500 rounded-xl">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-700">Taksi</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-800 mb-1">{taxiBookings}</p>
                  <p className="text-xs text-orange-600">Rezervasyon</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  ⚡ Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-3 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    onClick={() => setActiveTab("rooms")}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold">Oda Ekle</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-3 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                    onClick={() => setActiveTab("vehicles")}
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Car className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold">Araç Ekle</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    onClick={() => setActiveTab("orders")}
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold">Siparişler</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-3 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                    onClick={() => setActiveTab("reports")}
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold">Rapor Al</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Son Siparişler</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="text-primary hover:bg-primary/10"
                  >
                    Tümünü Gör
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Henüz sipariş yok</p>
                    <p className="text-sm text-gray-400">İlk siparişiniz geldiğinde burada görünecek</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{order.invoiceNumber?.slice(-2)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">#{order.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₺{order.totalPrice?.toFixed(2) || "0.00"}</p>
                          <Badge variant={
                            order.status === "paid" ? "default" : 
                            order.status === "completed" ? "secondary" : "outline"
                          } className="text-xs">
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
            <div className="flex items-center gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="flex-1 rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="p-3 rounded-xl">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {orders.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz sipariş yok</h3>
                  <p className="text-gray-500 mb-6">İlk siparişiniz geldiğinde burada görünecek</p>
                  <Button className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Sipariş Ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{order.invoiceNumber?.slice(-2)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-base">#{order.invoiceNumber}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          order.status === "paid" ? "default" : 
                          order.status === "completed" ? "secondary" : "outline"
                        } className="rounded-full px-3 py-1">
                          {order.status === "pending" ? "Beklemede" : 
                           order.status === "paid" ? "Ödendi" : 
                           order.status === "completed" ? "Tamamlandı" : "İptal"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className={`p-2 rounded-lg ${
                              item.type === "hotel" ? "bg-blue-100" : "bg-green-100"
                            }`}>
                              {item.type === "hotel" ? (
                                <Hotel className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Car className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.type === "hotel" 
                                  ? item.details?.roomName || "Otel Rezervasyonu"
                                  : item.details?.serviceName || "Taksi Hizmeti"
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.type === "hotel" 
                                  ? `${item.quantity} gece` 
                                  : `${item.details?.distance || 0}km`
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Toplam Tutar</p>
                          <p className="text-xl font-bold text-primary">₺{order.totalPrice?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl">
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Otel Odaları</h2>
                <p className="text-sm text-gray-500">{rooms.length} oda kayıtlı</p>
              </div>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Oda Ekle
              </Button>
            </div>

            {rooms.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <Hotel className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz oda eklenmemiş</h3>
                  <p className="text-gray-500 mb-6">İlk odanızı ekleyerek başlayın</p>
                  <Button className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Odayı Ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Hotel className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-gray-900">{room.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{room.type} Oda</p>
                          </div>
                        </div>
                        <Badge variant={room.available ? "default" : "secondary"} className="rounded-full">
                          {room.available ? "Müsait" : "Dolu"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Kapasite</p>
                          <p className="font-semibold">{room.capacity} hayvan</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Fiyat</p>
                          <p className="font-semibold">₺{room.pricePerNight}/gece</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                          <Eye className="w-4 h-4 mr-2" />
                          Görüntüle
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </Button>
                        <Button variant="destructive" size="sm" className="rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pet Taksi</h2>
                <p className="text-sm text-gray-500">Araç ve fiyat yönetimi</p>
              </div>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Araç Ekle
              </Button>
            </div>
            
            {/* Taksi Fiyat Ayarları */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  KM Başı Fiyatlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Star className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">VIP Hizmet</p>
                          <p className="text-sm text-gray-500">Özel araç</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">₺15</p>
                        <p className="text-xs text-gray-500">per km</p>
                      </div>
                    </div>
                    <Input type="number" placeholder="15" className="rounded-xl" />
                  </div>
                  
                  <div className="p-4 bg-white rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Paylaşımlı</p>
                          <p className="text-sm text-gray-500">Ekonomik seçenek</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">₺8</p>
                        <p className="text-xs text-gray-500">per km</p>
                      </div>
                    </div>
                    <Input type="number" placeholder="8" className="rounded-xl" />
                  </div>
                </div>
                <Button className="w-full rounded-xl">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Fiyatları Kaydet
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <Car className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz araç eklenmemiş</h3>
                <p className="text-gray-500 mb-6">İlk aracınızı ekleyerek taksi hizmetini başlatın</p>
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Aracı Ekle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fiyatlandırma</h2>
              <p className="text-sm text-gray-500">Oda ve hizmet fiyatlarını yönetin</p>
            </div>
            
            {/* Oda Fiyatları */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Hotel className="w-5 h-5 text-white" />
                  </div>
                  Oda Fiyatları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Hotel className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Standart Oda</span>
                        <p className="text-sm text-gray-500">Temel konfor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">₺150</span>
                      <p className="text-xs text-gray-500">/gece</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Deluxe Oda</span>
                        <p className="text-sm text-gray-500">Premium konfor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-600">₺250</span>
                      <p className="text-xs text-gray-500">/gece</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Suite Oda</span>
                        <p className="text-sm text-gray-500">Lüks deneyim</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-amber-600">₺400</span>
                      <p className="text-xs text-gray-500">/gece</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full rounded-xl">
                  <Edit className="w-4 h-4 mr-2" />
                  Fiyatları Düzenle
                </Button>
              </CardContent>
            </Card>

            {/* Ek Hizmet Fiyatları */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Ek Hizmetler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg">✂️</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Traş ve Bakım</span>
                        <p className="text-sm text-gray-500">Profesyonel bakım</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">₺15/kg</span>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg">🏥</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Veteriner Kontrolü</span>
                        <p className="text-sm text-gray-500">Sağlık kontrolü</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Oda tipine göre</span>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Hizmet Ekle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Raporlar</h2>
              <p className="text-sm text-gray-500">Analiz ve raporlarınızı görüntüleyin</p>
            </div>
            
            {/* Hızlı Raporlar */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-indigo-500 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Hızlı Raporlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-2 hover:border-indigo-300 hover:bg-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Günlük Satış Raporu</p>
                      <p className="text-sm text-gray-500">Bugünün özeti</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
                <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-2 hover:border-green-300 hover:bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Haftalık Özet</p>
                      <p className="text-sm text-gray-500">7 günlük analiz</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
                <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-2 hover:border-blue-300 hover:bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Aylık Gelir Raporu</p>
                      <p className="text-sm text-gray-500">Detaylı gelir analizi</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
                <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-2 hover:border-purple-300 hover:bg-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Müşteri Listesi</p>
                      <p className="text-sm text-gray-500">Tüm müşteriler</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
              </CardContent>
            </Card>

            {/* Özel Rapor */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Özel Rapor Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Başlangıç Tarihi</label>
                  <Input type="date" className="rounded-xl border-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Bitiş Tarihi</label>
                  <Input type="date" className="rounded-xl border-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Rapor Tipi</label>
                  <Select>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder="Rapor tipini seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Satış Raporu</SelectItem>
                      <SelectItem value="bookings">Rezervasyon Raporu</SelectItem>
                      <SelectItem value="revenue">Gelir Raporu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full rounded-xl h-12">
                  <Download className="w-4 h-4 mr-2" />
                  Rapor Oluştur ve İndir
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ayarlar</h2>
              <p className="text-sm text-gray-500">Sistem ve işletme ayarları</p>
            </div>
            
            {/* Genel Ayarlar */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-gray-500 rounded-xl">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Genel Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">İşletme Adı</label>
                  <Input defaultValue="Petfendy" className="rounded-xl border-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">İletişim E-postası</label>
                  <Input defaultValue="petfendyotel@gmail.com" className="rounded-xl border-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Telefon Numarası</label>
                  <Input placeholder="+90 XXX XXX XX XX" className="rounded-xl border-2" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Adres</label>
                  <Input placeholder="İşletme adresiniz" className="rounded-xl border-2" />
                </div>
                <Button className="w-full rounded-xl">
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarları Kaydet
                </Button>
              </CardContent>
            </Card>

            {/* Bildirim Ayarları */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  Bildirim Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Yeni sipariş bildirimi</p>
                      <p className="text-sm text-gray-500">Anında bildirim al</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold">E-posta bildirimleri</p>
                      <p className="text-sm text-gray-500">Günlük özet e-postası</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold">SMS bildirimleri</p>
                      <p className="text-sm text-gray-500">Acil durumlar için</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistem Bilgileri */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-indigo-500 rounded-xl">
                    <span className="text-white text-lg">ℹ️</span>
                  </div>
                  Sistem Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Uygulama Versiyonu</span>
                  <Badge variant="secondary" className="rounded-full">v1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Son Güncelleme</span>
                  <span className="text-sm font-semibold">{new Date().toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Sistem Durumu</span>
                  <Badge variant="default" className="rounded-full bg-green-500">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    Çevrimiçi
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
                <div>
      </div>
    </div>
  )
}