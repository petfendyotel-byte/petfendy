"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Phone,
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
    { id: "dashboard", label: "Ana Sayfa", icon: Home, color: "bg-blue-500" },
    { id: "orders", label: "Siparişler", icon: ShoppingBag, color: "bg-green-500", badge: totalOrders },
    { id: "rooms", label: "Odalar", icon: Hotel, color: "bg-purple-500", badge: rooms.length },
    { id: "vehicles", label: "Pet Taksi", icon: Car, color: "bg-orange-500" },
    { id: "pricing", label: "Fiyatlandırma", icon: DollarSign, color: "bg-emerald-500" },
    { id: "reports", label: "Raporlar", icon: BarChart3, color: "bg-indigo-500" },
    { id: "settings", label: "Ayarlar", icon: Settings, color: "bg-gray-500" },
  ]

  const handleMenuClick = (itemId: string) => {
    setActiveTab(itemId)
    setShowMobileMenu(false)
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Menu Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Yönetim Paneli</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowMobileMenu(false)}
                        className="text-white hover:bg-white/20 p-1"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-white/90 text-sm">Petfendy Admin</p>
                  </div>

                  {/* Menu Items */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {menuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuClick(item.id)}
                          className={`w-full flex items-center gap-4 px-4 py-4 text-left rounded-2xl transition-all duration-200 ${
                            activeTab === item.id
                              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg" 
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${
                            activeTab === item.id
                              ? "bg-white/20" 
                              : `${item.color} text-white`
                          }`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-base">{item.label}</span>
                            {item.badge && (
                              <p className={`text-sm ${activeTab === item.id ? 'text-white/80' : 'text-gray-500'}`}>
                                {item.badge} adet
                              </p>
                            )}
                          </div>
                          <ChevronRight className={`w-5 h-5 ${
                            activeTab === item.id ? 'text-white/80' : 'text-gray-400'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.label || "Yönetim Paneli"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Siparişler</p>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                      <p className="text-blue-100 text-xs">Bugün</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Ciro</p>
                      <p className="text-2xl font-bold">₺{totalRevenue}</p>
                      <p className="text-green-100 text-xs">Bugün</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Otel</p>
                      <p className="text-2xl font-bold">{hotelBookings}</p>
                      <p className="text-orange-100 text-xs">{hotelBookings} rezervasyon</p>
                    </div>
                    <Hotel className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Taksi</p>
                      <p className="text-2xl font-bold">{taxiBookings}</p>
                      <p className="text-purple-100 text-xs">{taxiBookings} rezervasyon</p>
                    </div>
                    <Car className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="h-16 flex-col gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    onClick={() => handleMenuClick("orders")}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Sipariş Ekle</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2"
                    onClick={() => handleMenuClick("rooms")}
                  >
                    <Hotel className="w-5 h-5" />
                    <span className="text-sm">Odalar</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2"
                    onClick={() => handleMenuClick("vehicles")}
                  >
                    <Car className="w-5 h-5" />
                    <span className="text-sm">Pet Taksi</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex-col gap-2"
                    onClick={() => handleMenuClick("reports")}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm">Raporlar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Son Siparişler</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Henüz sipariş bulunmuyor</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Sipariş #{index + 1}</p>
                          <p className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="secondary">Yeni</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab !== "dashboard" && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {activeTab === "orders" && <ShoppingBag className="w-8 h-8 text-gray-400" />}
                {activeTab === "rooms" && <Hotel className="w-8 h-8 text-gray-400" />}
                {activeTab === "vehicles" && <Car className="w-8 h-8 text-gray-400" />}
                {activeTab === "pricing" && <DollarSign className="w-8 h-8 text-gray-400" />}
                {activeTab === "reports" && <BarChart3 className="w-8 h-8 text-gray-400" />}
                {activeTab === "settings" && <Settings className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500">Bu bölüm yakında eklenecek</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-0 ${
                activeTab === item.id
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.badge}</span>
                </div>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-gray-500 hover:text-gray-700 min-w-0"
          >
            <MoreVertical className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">Menü</span>
          </button>
        </div>
      </div>
    </div>
  )
}