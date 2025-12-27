"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Order, HotelRoom, TaxiService, TaxiVehicle, RoomPricing, AboutPage, PaymentGateway, PayTRConfig, ParatikaConfig } from "@/lib/types"
import { mockHotelRooms, mockTaxiServices } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import { VideoUpload } from "@/components/video-upload"
import { RoomEditModal } from "./room-edit-modal"
import { sanitizeInput } from "@/lib/security"
import { encryptPaymentCredential, decryptPaymentCredential, maskCredential, validatePaymentCredentials, sanitizePaymentUrl } from "@/lib/encryption"
import { 
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  FileText,
  FileDown,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
}

export function AdminDashboard() {
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<HotelRoom[]>([])
  const [services, setServices] = useState<TaxiService[]>([])
  const [taxiVehicles, setTaxiVehicles] = useState<TaxiVehicle[]>([])
  const [roomPricings, setRoomPricings] = useState<RoomPricing[]>([])
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null)
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])
  const [showAddGateway, setShowAddGateway] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  // UI State
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null)
  const [showRoomEditModal, setShowRoomEditModal] = useState(false)
  const [editingService, setEditingService] = useState<TaxiService | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<TaxiVehicle | null>(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showAddRoomPricing, setShowAddRoomPricing] = useState(false)
  
  // Filter states
  const [orderFilter, setOrderFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<"daily" | "weekly" | "monthly">("daily")
  const [revenueType, setRevenueType] = useState<"hotel" | "taxi" | "all">("all")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  
  // Form states
  const [newRoom, setNewRoom] = useState({
    name: "",
    type: "standard" as const,
    capacity: 1,
    pricePerNight: 0,
    amenities: "",
    description: "",
    features: "",
  })
  const [newRoomImages, setNewRoomImages] = useState<string[]>([])
  const [newRoomVideos, setNewRoomVideos] = useState<Array<{ type: 'upload' | 'youtube', url: string }>>([])

  const [newService, setNewService] = useState({
    name: "",
    basePrice: 0,
    pricePerKm: 0,
    maxPetWeight: 50,
  })

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "vip" as "vip" | "shared",
    pricePerKm: 0,
    capacity: 1,
    description: "",
    features: "",
  })

  const [newRoomPricing, setNewRoomPricing] = useState({
    roomId: "",
    date: "",
    pricePerNight: 0,
  })

  // Taksi km fiyat ayarları
  const [taxiPrices, setTaxiPrices] = useState({
    vipPricePerKm: 15,
    sharedPricePerKm: 8
  })

  const [newGateway, setNewGateway] = useState<{
    provider: "paytr" | "paratika"
    name: string
    testMode: boolean
    merchantId: string
    merchantKey: string
    merchantSalt: string
    apiKey: string
    successUrl: string
    failUrl: string
    timeoutLimit: number
    maxInstallment: number
    currency: string
  }>({
    provider: "paytr",
    name: "",
    testMode: true,
    merchantId: "",
    merchantKey: "",
    merchantSalt: "",
    apiKey: "",
    successUrl: "",
    failUrl: "",
    timeoutLimit: 30,
    maxInstallment: 12,
    currency: "TL"
  })

  // API Functions for Rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
        // Also update localStorage for offline/fallback
        localStorage.setItem("petfendy_rooms", JSON.stringify(data))
      } else {
        // Fallback to localStorage
        const storedRooms = JSON.parse(localStorage.getItem("petfendy_rooms") || JSON.stringify(mockHotelRooms))
        setRooms(storedRooms)
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
      // Fallback to localStorage
      const storedRooms = JSON.parse(localStorage.getItem("petfendy_rooms") || JSON.stringify(mockHotelRooms))
      setRooms(storedRooms)
    }
  }

  const createRoomAPI = async (roomData: any): Promise<HotelRoom | null> => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      })
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Failed to create room:', error)
      return null
    }
  }

  const updateRoomAPI = async (id: string, roomData: any): Promise<HotelRoom | null> => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      })
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Failed to update room:', error)
      return null
    }
  }

  const deleteRoomAPI = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      return response.ok
    } catch (error) {
      console.error('Failed to delete room:', error)
      return false
    }
  }

  // Load data
  useEffect(() => {
    // Fetch rooms from API
    fetchRooms()

    // Load other data from localStorage (will be migrated later)
    const storedOrders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    const storedBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
    const storedServices = JSON.parse(localStorage.getItem("petfendy_services") || JSON.stringify(mockTaxiServices))
    const storedVehicles = JSON.parse(localStorage.getItem("petfendy_taxi_vehicles") || "[]")
    const storedRoomPricings = JSON.parse(localStorage.getItem("petfendy_room_pricings") || "[]")
    const storedAbout = localStorage.getItem("petfendy_about")
    const storedGateways = JSON.parse(localStorage.getItem("petfendy_payment_gateways") || "[]")

    setOrders(storedOrders)
    setBookings(storedBookings)
    setServices(storedServices)
    setTaxiVehicles(storedVehicles)
    setRoomPricings(storedRoomPricings)
    setPaymentGateways(storedGateways)

    // Taksi fiyatlarını yükle
    const storedTaxiPrices = localStorage.getItem("petfendy_taxi_prices")
    if (storedTaxiPrices) {
      setTaxiPrices(JSON.parse(storedTaxiPrices))
    }

    if (storedAbout) {
      setAboutPage(JSON.parse(storedAbout))
    } else {
      // Default content
      const defaultAbout: AboutPage = {
        id: "about-1",
        title: "Hakkımızda",
        content: "Petfendy olarak, evcil hayvan dostlarımıza en iyi hizmeti sunmak için kurulduk.",
        image: "",
        updatedAt: new Date()
      }
      setAboutPage(defaultAbout)
    }
  }, [])

  // Save to localStorage (and API for rooms)
  const saveRooms = (updatedRooms: HotelRoom[]) => {
    localStorage.setItem("petfendy_rooms", JSON.stringify(updatedRooms))
    setRooms(updatedRooms)

    // Trigger custom event for same-page updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('roomsUpdated'))
    }
  }

  const saveServices = (updatedServices: TaxiService[]) => {
    localStorage.setItem("petfendy_services", JSON.stringify(updatedServices))
    setServices(updatedServices)
  }

  const saveTaxiVehicles = (updatedVehicles: TaxiVehicle[]) => {
    localStorage.setItem("petfendy_taxi_vehicles", JSON.stringify(updatedVehicles))
    setTaxiVehicles(updatedVehicles)

    // Trigger custom event for same-page updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('taxiVehiclesUpdated'))
    }
  }

  // Taksi km fiyatlarını kaydet
  const saveTaxiPrices = () => {
    localStorage.setItem("petfendy_taxi_prices", JSON.stringify(taxiPrices))
    toast({
      title: "✅ Fiyatlar Güncellendi",
      description: `VIP: ₺${taxiPrices.vipPricePerKm}/km, Paylaşımlı: ₺${taxiPrices.sharedPricePerKm}/km`,
    })
  }

  const saveRoomPricings = (updatedPricings: RoomPricing[]) => {
    localStorage.setItem("petfendy_room_pricings", JSON.stringify(updatedPricings))
    setRoomPricings(updatedPricings)
  }

  // Room management
  const handleAddRoom = async () => {
    if (!newRoom.name || newRoom.pricePerNight <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      })
      return
    }

    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(newRoom.name)
    const sanitizedDescription = sanitizeInput(newRoom.description)

    if (sanitizedName.length < 2) {
      toast({
        title: "Hata",
        description: "Oda adı en az 2 karakter olmalıdır",
        variant: "destructive"
      })
      return
    }

    if (newRoom.capacity < 1 || newRoom.capacity > 10) {
      toast({
        title: "Hata",
        description: "Kapasite 1-10 arasında olmalıdır",
        variant: "destructive"
      })
      return
    }

    if (newRoom.pricePerNight < 0 || newRoom.pricePerNight > 10000) {
      toast({
        title: "Hata",
        description: "Fiyat 0-10000 TL arasında olmalıdır",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    const roomData = {
      name: sanitizedName,
      type: newRoom.type,
      capacity: Math.floor(newRoom.capacity),
      pricePerNight: Math.round(newRoom.pricePerNight * 100) / 100,
      description: sanitizedDescription,
      amenities: newRoom.amenities.split(",").map((a) => sanitizeInput(a)).filter(a => a),
      features: newRoom.features.split(",").map((f) => sanitizeInput(f)).filter(f => f),
      images: newRoomImages || [],
      videos: newRoomVideos || [],
    }

    // Try API first
    const createdRoom = await createRoomAPI(roomData)
    
    if (createdRoom) {
      // API success - refresh rooms from API
      await fetchRooms()
    } else {
      // Fallback to localStorage
      const room: HotelRoom = {
        id: `room-${Date.now()}`,
        ...roomData,
        available: true,
      }
      saveRooms([...rooms, room])
    }

    setNewRoom({ name: "", type: "standard", capacity: 1, pricePerNight: 0, amenities: "", description: "", features: "" })
    setNewRoomImages([])
    setNewRoomVideos([])
    setShowAddRoom(false)
    setIsLoading(false)

    toast({
      title: "✅ Başarılı",
      description: `${sanitizedName} eklendi`,
    })
  }

  const handleUpdateRoom = async (updatedRoom: HotelRoom) => {
    setIsLoading(true)

    // Try API first
    const result = await updateRoomAPI(updatedRoom.id, {
      name: updatedRoom.name,
      type: updatedRoom.type,
      capacity: updatedRoom.capacity,
      pricePerNight: updatedRoom.pricePerNight,
      available: updatedRoom.available,
      description: updatedRoom.description,
      amenities: updatedRoom.amenities,
      features: updatedRoom.features,
      images: updatedRoom.images || [],
      videos: updatedRoom.videos || [],
    })

    if (result) {
      // API success - refresh rooms from API
      await fetchRooms()
    } else {
      // Fallback to localStorage
      saveRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)))
    }

    setEditingRoom(null)
    setIsLoading(false)
    
    toast({
      title: "✅ Güncellendi",
      description: `${updatedRoom.name} güncellendi`,
    })
  }

  const handleDeleteRoom = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    setIsLoading(true)

    // Try API first
    const success = await deleteRoomAPI(roomId)

    if (success) {
      // API success - refresh rooms from API
      await fetchRooms()
    } else {
      // Fallback to localStorage
      saveRooms(rooms.filter((r) => r.id !== roomId))
    }

    setIsLoading(false)
    
    toast({
      title: "🗑️ Silindi",
      description: `${room?.name} silindi`,
    })
  }

  // Service management
  const handleAddService = () => {
    if (!newService.name || newService.basePrice <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      })
      return
    }

    const service: TaxiService = {
      id: `service-${Date.now()}`,
      name: newService.name,
      description: `${newService.name} taksi servisi`,
      basePrice: newService.basePrice,
      pricePerKm: newService.pricePerKm,
      capacity: 2,
      maxPetWeight: newService.maxPetWeight,
      available: true,
      features: ["Klimalı araç", "Evcil hayvan güvenliği", "Profesyonel sürücü"]
    }

    saveServices([...services, service])
    setNewService({ name: "", basePrice: 0, pricePerKm: 0, maxPetWeight: 50 })
    setShowAddService(false)
    
    toast({
      title: "✅ Başarılı",
      description: `${service.name} eklendi`,
    })
  }

  const handleUpdateService = (updatedService: TaxiService) => {
    saveServices(services.map((s) => (s.id === updatedService.id ? updatedService : s)))
    setEditingService(null)
    
    toast({
      title: "✅ Güncellendi",
      description: `${updatedService.name} güncellendi`,
    })
  }

  const handleDeleteService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    saveServices(services.filter((s) => s.id !== serviceId))

    toast({
      title: "🗑️ Silindi",
      description: `${service?.name} silindi`,
    })
  }

  // Taxi vehicle management
  const handleAddVehicle = () => {
    if (!newVehicle.name || newVehicle.pricePerKm <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      })
      return
    }

    const vehicle: TaxiVehicle = {
      id: `vehicle-${Date.now()}`,
      name: sanitizeInput(newVehicle.name),
      type: newVehicle.type,
      pricePerKm: newVehicle.pricePerKm,
      capacity: newVehicle.capacity,
      isAvailable: true,
      description: sanitizeInput(newVehicle.description),
      features: newVehicle.features ? newVehicle.features.split(',').map(f => sanitizeInput(f.trim())) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    saveTaxiVehicles([...taxiVehicles, vehicle])
    setNewVehicle({ name: "", type: "vip", pricePerKm: 0, capacity: 1, description: "", features: "" })
    setShowAddVehicle(false)

    toast({
      title: "✅ Başarılı",
      description: `${vehicle.name} eklendi`,
    })
  }

  const handleUpdateVehicle = (updatedVehicle: TaxiVehicle) => {
    const vehicle = {
      ...updatedVehicle,
      updatedAt: new Date()
    }
    saveTaxiVehicles(taxiVehicles.map((v) => (v.id === vehicle.id ? vehicle : v)))
    setEditingVehicle(null)

    toast({
      title: "✅ Güncellendi",
      description: `${vehicle.name} güncellendi`,
    })
  }

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = taxiVehicles.find(v => v.id === vehicleId)
    saveTaxiVehicles(taxiVehicles.filter((v) => v.id !== vehicleId))

    toast({
      title: "🗑️ Silindi",
      description: `${vehicle?.name} silindi`,
    })
  }

  // Room pricing management
  const handleAddRoomPricing = () => {
    if (!newRoomPricing.roomId || !newRoomPricing.date || newRoomPricing.pricePerNight <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      })
      return
    }

    const pricing: RoomPricing = {
      id: `pricing-${Date.now()}`,
      roomId: newRoomPricing.roomId,
      date: new Date(newRoomPricing.date),
      pricePerNight: newRoomPricing.pricePerNight,
      available: true,
    }

    saveRoomPricings([...roomPricings, pricing])
    setNewRoomPricing({ roomId: "", date: "", pricePerNight: 0 })
    setShowAddRoomPricing(false)
    
    toast({
      title: "✅ Başarılı",
      description: "Tarih bazlı fiyat eklendi",
    })
  }

  const handleDeleteRoomPricing = (pricingId: string) => {
    saveRoomPricings(roomPricings.filter((p) => p.id !== pricingId))
    toast({
      title: "🗑️ Silindi",
      description: "Fiyat silindi",
    })
  }

  // Payment Gateway Management
  const savePaymentGateways = (gateways: PaymentGateway[]) => {
    localStorage.setItem("petfendy_payment_gateways", JSON.stringify(gateways))
    setPaymentGateways(gateways)
  }

  const handleAddPaymentGateway = () => {
    // Validation
    const credentials = {
      merchantId: newGateway.merchantId,
      merchantKey: newGateway.merchantKey,
      merchantSalt: newGateway.merchantSalt,
      apiKey: newGateway.apiKey
    }

    const validation = validatePaymentCredentials(newGateway.provider, credentials)

    if (!validation.valid) {
      toast({
        title: "Hata",
        description: validation.errors.join(', '),
        variant: "destructive"
      })
      return
    }

    if (!newGateway.name || newGateway.name.length < 3) {
      toast({
        title: "Hata",
        description: "Pos adı minimum 3 karakter olmalıdır",
        variant: "destructive"
      })
      return
    }

    // Sanitize URLs
    const successUrl = sanitizePaymentUrl(newGateway.successUrl)
    const failUrl = sanitizePaymentUrl(newGateway.failUrl)

    if (!successUrl || !failUrl) {
      toast({
        title: "Hata",
        description: "Geçerli URL adresleri giriniz",
        variant: "destructive"
      })
      return
    }

    // Encrypt sensitive data
    const encryptedMerchantKey = encryptPaymentCredential(newGateway.merchantKey)
    const encryptedMerchantSalt = encryptPaymentCredential(newGateway.merchantSalt)
    const encryptedApiKey = encryptPaymentCredential(newGateway.apiKey)

    // If this is the first gateway, make it default
    const isFirstGateway = paymentGateways.length === 0

    let config: PayTRConfig | ParatikaConfig

    if (newGateway.provider === "paytr") {
      config = {
        merchantId: newGateway.merchantId,
        merchantKey: encryptedMerchantKey,
        merchantSalt: encryptedMerchantSalt,
        testMode: newGateway.testMode,
        successUrl,
        failUrl,
        timeoutLimit: newGateway.timeoutLimit,
        maxInstallment: newGateway.maxInstallment,
        currency: newGateway.currency as "TL" | "USD" | "EUR"
      }
    } else {
      config = {
        merchantId: newGateway.merchantId,
        merchantKey: encryptedMerchantKey,
        apiKey: encryptedApiKey,
        testMode: newGateway.testMode,
        successUrl,
        failUrl,
        currency: newGateway.currency === "TL" ? "TRY" : newGateway.currency as "USD" | "EUR"
      }
    }

    const gateway: PaymentGateway = {
      id: `gateway-${Date.now()}`,
      provider: newGateway.provider,
      name: sanitizeInput(newGateway.name),
      isActive: true,
      isDefault: isFirstGateway,
      config,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    savePaymentGateways([...paymentGateways, gateway])
    setNewGateway({
      provider: "paytr",
      name: "",
      testMode: true,
      merchantId: "",
      merchantKey: "",
      merchantSalt: "",
      apiKey: "",
      successUrl: "",
      failUrl: "",
      timeoutLimit: 30,
      maxInstallment: 12,
      currency: "TL"
    })
    setShowAddGateway(false)

    toast({
      title: "✅ Başarılı",
      description: `${gateway.name} eklendi`,
    })
  }

  const handleSetDefaultGateway = (gatewayId: string) => {
    const updated = paymentGateways.map(g => ({
      ...g,
      isDefault: g.id === gatewayId
    }))
    savePaymentGateways(updated)

    toast({
      title: "✅ Güncellendi",
      description: "Varsayılan ödeme yöntemi değiştirildi",
    })
  }

  const handleToggleGatewayStatus = (gatewayId: string) => {
    const updated = paymentGateways.map(g =>
      g.id === gatewayId ? { ...g, isActive: !g.isActive } : g
    )
    savePaymentGateways(updated)

    toast({
      title: "✅ Güncellendi",
      description: "Durum değiştirildi",
    })
  }

  const handleDeleteGateway = (gatewayId: string) => {
    const gateway = paymentGateways.find(g => g.id === gatewayId)

    if (gateway?.isDefault && paymentGateways.length > 1) {
      toast({
        title: "Hata",
        description: "Varsayılan ödeme yöntemini silmeden önce başka birini varsayılan yapın",
        variant: "destructive"
      })
      return
    }

    savePaymentGateways(paymentGateways.filter(g => g.id !== gatewayId))

    toast({
      title: "🗑️ Silindi",
      description: `${gateway?.name} silindi`,
    })
  }

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o
    )
    localStorage.setItem("petfendy_orders", JSON.stringify(updatedOrders))
    setOrders(updatedOrders)
    
    toast({
      title: "✅ Güncellendi",
      description: `Sipariş durumu: ${newStatus}`,
    })
  }

  // Revenue calculations
  const calculateRevenue = (
    type: "hotel" | "taxi" | "all",
    period: "daily" | "weekly" | "monthly"
  ) => {
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case "daily":
        startDate.setHours(0, 0, 0, 0)
        break
      case "weekly":
        startDate.setDate(now.getDate() - 7)
        break
      case "monthly":
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const filteredBookings = bookings.filter(b => {
      const bookingDate = new Date(b.createdAt)
      const matchesDate = bookingDate >= startDate
      const matchesType = type === "all" || b.type === type
      const isCompleted = b.status === "confirmed" || b.status === "completed"
      
      return matchesDate && matchesType && isCompleted
    })

    const revenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const count = filteredBookings.length
    
    return { revenue, count }
  }

  // Filtered orders
  const getFilteredOrders = () => {
    let filtered = [...orders]
    
    if (orderFilter !== "all") {
      filtered = filtered.filter(o => o.status === orderFilter)
    }
    
    // Sort by last action (newest first) - using createdAt as last action time
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    
    return filtered
  }

  // Paginated orders
  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(getFilteredOrders().length / itemsPerPage)
  const totalOrders = getFilteredOrders().length

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [orderFilter, itemsPerPage])

  // Export functions
  const exportToExcel = () => {
    const filteredOrders = getFilteredOrders()
    const data = filteredOrders.map(order => ({
      'Fatura No': order.invoiceNumber,
      'Tarih': new Date(order.createdAt).toLocaleString("tr-TR"),
      'Müşteri ID': order.userId,
      'Ürün Sayısı': order.items.length,
      'Toplam Tutar': order.totalPrice,
      'Durum': order.status === 'pending' ? 'Beklemede' : 
               order.status === 'paid' ? 'Ödendi' : 
               order.status === 'completed' ? 'Tamamlandı' : 'İptal',
      'Ürünler': order.items.map(item => 
        item.type === 'hotel' 
          ? `${item.details.roomName} (${item.quantity} gece)` 
          : `${item.details.serviceName} (${item.details.distance}km)`
      ).join('; ')
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Siparişler')
    
    const fileName = `siparisler_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    toast({
      title: "Excel Export",
      description: `${filteredOrders.length} sipariş Excel dosyasına aktarıldı`,
    })
  }

  const exportToCSV = () => {
    const filteredOrders = getFilteredOrders()
    const headers = ['Fatura No', 'Tarih', 'Müşteri ID', 'Ürün Sayısı', 'Toplam Tutar', 'Durum', 'Ürünler']
    
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.invoiceNumber,
        `"${new Date(order.createdAt).toLocaleString("tr-TR")}"`,
        order.userId,
        order.items.length,
        order.totalPrice,
        order.status === 'pending' ? 'Beklemede' : 
        order.status === 'paid' ? 'Ödendi' : 
        order.status === 'completed' ? 'Tamamlandı' : 'İptal',
        `"${order.items.map(item => 
          item.type === 'hotel' 
            ? `${item.details.roomName} (${item.quantity} gece)` 
            : `${item.details.serviceName} (${item.details.distance}km)`
        ).join('; ')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `siparisler_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "CSV Export",
      description: `${filteredOrders.length} sipariş CSV dosyasına aktarıldı`,
    })
  }

  const exportToPDF = () => {
    const filteredOrders = getFilteredOrders()
    const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation
    
    // Title
    doc.setFontSize(20)
    doc.text('Petfendy - Sipariş Raporu', 14, 22)
    
    // Date and summary
    doc.setFontSize(12)
    doc.text(`Rapor Tarihi: ${new Date().toLocaleString("tr-TR")}`, 14, 30)
    doc.text(`Toplam Sipariş: ${filteredOrders.length}`, 14, 36)
    
    // Table data
    const tableData = filteredOrders.map(order => [
      order.invoiceNumber,
      new Date(order.createdAt).toLocaleDateString("tr-TR"),
      order.userId.substring(0, 8) + '...',
      order.items.length.toString(),
      `₺${order.totalPrice.toFixed(2)}`,
      order.status === 'pending' ? 'Beklemede' : 
      order.status === 'paid' ? 'Ödendi' : 
      order.status === 'completed' ? 'Tamamlandı' : 'İptal'
    ])

    // Auto table
    ;(doc as any).autoTable({
      head: [['Fatura No', 'Tarih', 'Müşteri', 'Ürün', 'Tutar', 'Durum']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    })
    
    const fileName = `siparisler_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
    toast({
      title: "PDF Export",
      description: `${filteredOrders.length} sipariş PDF dosyasına aktarıldı`,
    })
  }

  // Statistics
  const hotelStats = calculateRevenue("hotel", dateFilter)
  const taxiStats = calculateRevenue("taxi", dateFilter)
  const totalStats = calculateRevenue("all", dateFilter)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      paid: "default",
      completed: "secondary",
      cancelled: "destructive",
    }
    const labels: Record<string, string> = {
      pending: "Beklemede",
      paid: "Ödendi",
      completed: "Tamamlandı",
      cancelled: "İptal Edildi",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Yönetim Paneli</h2>
        <div className="flex gap-2 items-center">
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="monthly">Aylık</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Toplam Sipariş
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStats.count}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFilter === "daily" ? "Bugün" : dateFilter === "weekly" ? "Bu Hafta" : "Bu Ay"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Toplam Ciro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">₺{totalStats.revenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFilter === "daily" ? "Bugün" : dateFilter === "weekly" ? "Bu Hafta" : "Bu Ay"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Otel Cirosu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">₺{hotelStats.revenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hotelStats.count} rezervasyon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Pet Taksi Cirosu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">₺{taxiStats.revenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {taxiStats.count} rezervasyon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="orders">Siparişler</TabsTrigger>
          <TabsTrigger value="rooms">Odalar</TabsTrigger>
          <TabsTrigger value="services">Pet Taksi</TabsTrigger>
          <TabsTrigger value="vehicles">Taksiler</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="payment">Ödeme</TabsTrigger>
          <TabsTrigger value="pages">Sayfalar</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Tüm Siparişler</CardTitle>
                  <CardDescription>
                    Toplam {totalOrders} sipariş • Sayfa {currentPage} / {totalPages || 1}
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 kayıt</SelectItem>
                      <SelectItem value="50">50 kayıt</SelectItem>
                      <SelectItem value="100">100 kayıt</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="paid">Ödendi</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="cancelled">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Export Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                      className="h-9 px-3"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      className="h-9 px-3"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToPDF}
                      className="h-9 px-3"
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredOrders().length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Sipariş bulunamadı</p>
                </div>
              ) : (
                <>
                  {/* Orders Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[140px]">Fatura No</TableHead>
                          <TableHead className="w-[180px]">Tarih</TableHead>
                          <TableHead>Müşteri</TableHead>
                          <TableHead>Ürünler</TableHead>
                          <TableHead className="text-right w-[120px]">Tutar</TableHead>
                          <TableHead className="text-center w-[140px]">Durum</TableHead>
                          <TableHead className="text-center w-[180px]">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getPaginatedOrders().map((order) => (
                          <TableRow key={order.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              #{order.invoiceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(order.createdAt).toLocaleDateString("tr-TR")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                        </div>
                        </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">ID: {order.userId.substring(0, 10)}...</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.items.length} ürün
                      </div>
                    </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    {item.type === "hotel" ? (
                                      <Hotel className="w-3 h-3 text-blue-500" />
                                    ) : (
                                      <Car className="w-3 h-3 text-green-500" />
                                    )}
                                    <span className="text-xs">
                                      {item.type === "hotel" 
                                        ? `${item.details.roomName} (${item.quantity}g)` 
                                        : `${item.details.serviceName} (${item.details.distance}km)`
                                      }
                                    </span>
              </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-primary">
                                ₺{order.totalPrice.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={order.status} 
                                onValueChange={(v) => handleUpdateOrderStatus(order.id, v as any)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Beklemede</SelectItem>
                                  <SelectItem value="paid">Ödendi</SelectItem>
                                  <SelectItem value="completed">Tamamlandı</SelectItem>
                                  <SelectItem value="cancelled">İptal</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground">
                        Gösterilen: {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalOrders)} / {totalOrders}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-9"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Otel Odaları Yönetimi</CardTitle>
                <Button onClick={() => setShowAddRoom(!showAddRoom)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Oda Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddRoom && (
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Oda Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Oda Adı *</label>
                        <Input
                          value={newRoom.name}
                          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                          placeholder="Örn: VIP Suit Oda"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Oda Tipi *</label>
                        <Select
                          value={newRoom.type}
                          onValueChange={(v) => setNewRoom({ ...newRoom, type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standart</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kapasite (evcil hayvan) *</label>
                        <Input
                          type="number"
                          value={newRoom.capacity}
                          onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Günlük Fiyat (₺) *</label>
                        <Input
                          type="number"
                          value={newRoom.pricePerNight}
                          onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Açıklama</label>
                      <Textarea
                        value={newRoom.description}
                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                        placeholder="Oda hakkında detaylı açıklama"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Olanaklar (virgülle ayırın)</label>
                      <Input
                        value={newRoom.amenities}
                        onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                        placeholder="Yatak, Klima, Oyuncak, Kamera, 7/24 Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Özellikler (virgülle ayırın)</label>
                      <Input
                        value={newRoom.features}
                        onChange={(e) => setNewRoom({ ...newRoom, features: e.target.value })}
                        placeholder="Günlük temizlik, Doğal ışık, Ses yalıtımı"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oda Resimleri</label>
                      <FileUpload
                        type="image"
                        existingFiles={newRoomImages}
                        onFilesChange={setNewRoomImages}
                        maxFiles={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oda Videoları</label>
                      <VideoUpload
                        existingVideos={newRoomVideos}
                        onVideosChange={setNewRoomVideos}
                        maxVideos={5}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddRoom} className="flex-1">
                        Oda Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddRoom(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                  <Card key={room.id} className={!room.available ? "opacity-60" : ""}>
                    {/* Room Image */}
                    {room.images && room.images.length > 0 && (
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                        {room.images.length > 1 && (
                          <Badge variant="secondary" className="absolute bottom-2 right-2">
                            +{room.images.length - 1} resim
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                          <CardTitle className="text-lg">{room.name}</CardTitle>
                          <CardDescription>{room.type}</CardDescription>
                    </div>
                        <Badge variant={room.available ? "default" : "secondary"}>
                          {room.available ? "Müsait" : "Dolu"}
                        </Badge>
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {room.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Kapasite</p>
                          <p className="font-semibold">{room.capacity} evcil hayvan</p>
                  </div>
                        <div>
                          <p className="text-muted-foreground">Fiyat</p>
                          <p className="font-bold text-primary">₺{room.pricePerNight}/gece</p>
                </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Olanaklar:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                    </div>
                      {room.features && room.features.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Özellikler:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.features.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {room.features.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{room.features.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingRoom(room)
                            setShowRoomEditModal(true)
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                        Düzenle
                      </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
            </CardContent>
          </Card>
                ))}
              </div>

          {editingRoom && (
                <Card className="border-primary">
              <CardHeader>
                    <CardTitle>Oda Düzenle: {editingRoom.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                        <label className="text-sm font-medium">Oda Adı</label>
                        <Input
                          value={editingRoom.name}
                          onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                        />
                      </div>
                <div className="space-y-2">
                        <label className="text-sm font-medium">Günlük Fiyat (₺)</label>
                  <Input
                    type="number"
                    value={editingRoom.pricePerNight}
                          onChange={(e) => setEditingRoom({ ...editingRoom, pricePerNight: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kapasite</label>
                        <Input
                          type="number"
                          value={editingRoom.capacity}
                          onChange={(e) => setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) })}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Durum</label>
                        <Select
                          value={editingRoom.available ? "available" : "unavailable"}
                          onValueChange={(v) => setEditingRoom({ ...editingRoom, available: v === "available" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Müsait</SelectItem>
                            <SelectItem value="unavailable">Dolu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Açıklama</label>
                      <Textarea
                        value={editingRoom.description || ""}
                        onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                        placeholder="Oda hakkında detaylı açıklama"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Olanaklar (virgülle ayırın)</label>
                      <Input
                        value={editingRoom.amenities?.join(", ") || ""}
                        onChange={(e) => setEditingRoom({
                          ...editingRoom,
                          amenities: e.target.value.split(",").map((a) => a.trim()).filter(a => a)
                        })}
                        placeholder="Yatak, Klima, Oyuncak, Kamera, 7/24 Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Özellikler (virgülle ayırın)</label>
                      <Input
                        value={editingRoom.features?.join(", ") || ""}
                        onChange={(e) => setEditingRoom({
                          ...editingRoom,
                          features: e.target.value.split(",").map((f) => f.trim()).filter(f => f)
                        })}
                        placeholder="Günlük temizlik, Doğal ışık, Ses yalıtımı"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oda Resimleri</label>
                      <FileUpload
                        type="image"
                        existingFiles={editingRoom.images || []}
                        onFilesChange={(urls) => setEditingRoom({ ...editingRoom, images: urls })}
                        maxFiles={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oda Videoları</label>
                      <VideoUpload
                        existingVideos={editingRoom.videos || []}
                        onVideosChange={(videos) => setEditingRoom({ ...editingRoom, videos })}
                        maxVideos={5}
                      />
                    </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateRoom(editingRoom)} className="flex-1">
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditingRoom(null)} className="flex-1">
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pet Taksi Hizmetleri Yönetimi</CardTitle>
                <Button onClick={() => setShowAddService(!showAddService)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Hizmet Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddService && (
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Pet Taksi Hizmeti</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hizmet Adı *</label>
                      <Input
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        placeholder="Örn: Premium Pet Taksi"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Başlangıç Ücreti (₺) *</label>
                        <Input
                          type="number"
                          value={newService.basePrice}
                          onChange={(e) => setNewService({ ...newService, basePrice: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">KM Başı Ücret (₺) *</label>
                        <Input
                          type="number"
                          value={newService.pricePerKm}
                          onChange={(e) => setNewService({ ...newService, pricePerKm: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Ağırlık (kg)</label>
                        <Input
                          type="number"
                          value={newService.maxPetWeight}
                          onChange={(e) => setNewService({ ...newService, maxPetWeight: parseFloat(e.target.value) })}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddService} className="flex-1">
                        Hizmet Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddService(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>Max {service.maxPetWeight}kg</CardDescription>
                    </div>
                        <Badge variant={service.available ? "default" : "secondary"}>
                          {service.available ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Başlangıç</p>
                          <p className="font-bold text-primary">₺{service.basePrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">KM Başı</p>
                          <p className="font-bold text-primary">₺{service.pricePerKm}/km</p>
                        </div>
                    </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                      Düzenle
                    </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
            </CardContent>
          </Card>
                ))}
              </div>

          {editingService && (
                <Card className="border-primary">
              <CardHeader>
                    <CardTitle>Hizmet Düzenle: {editingService.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Başlangıç Ücreti (₺)</label>
                  <Input
                    type="number"
                    value={editingService.basePrice}
                          onChange={(e) => setEditingService({ ...editingService, basePrice: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                  />
                </div>
                <div className="space-y-2">
                        <label className="text-sm font-medium">KM Başı Ücret (₺)</label>
                  <Input
                    type="number"
                    value={editingService.pricePerKm}
                          onChange={(e) => setEditingService({ ...editingService, pricePerKm: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Ağırlık (kg)</label>
                        <Input
                          type="number"
                          value={editingService.maxPetWeight}
                          onChange={(e) => setEditingService({ ...editingService, maxPetWeight: parseFloat(e.target.value) })}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Durum</label>
                      <Select 
                        value={editingService.available ? "available" : "unavailable"}
                        onValueChange={(v) => setEditingService({ ...editingService, available: v === "available" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Aktif</SelectItem>
                          <SelectItem value="unavailable">Pasif</SelectItem>
                        </SelectContent>
                      </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateService(editingService)} className="flex-1">
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={() => setEditingService(null)} className="flex-1">
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          {/* Taksi KM Fiyat Ayarları */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Taksi Kilometre Fiyatları
              </CardTitle>
              <CardDescription>
                Tüm taksi rezervasyonlarında kullanılacak km başı fiyatları belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 text-orange-500" />
                    VIP Taksi (₺/km)
                  </label>
                  <Input
                    type="number"
                    value={taxiPrices.vipPricePerKm}
                    onChange={(e) => setTaxiPrices({ ...taxiPrices, vipPricePerKm: parseFloat(e.target.value) || 0 })}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Paylaşımlı Taksi (₺/km)
                  </label>
                  <Input
                    type="number"
                    value={taxiPrices.sharedPricePerKm}
                    onChange={(e) => setTaxiPrices({ ...taxiPrices, sharedPricePerKm: parseFloat(e.target.value) || 0 })}
                    placeholder="8"
                  />
                </div>
              </div>
              <Button onClick={saveTaxiPrices} className="mt-4 w-full">
                Fiyatları Kaydet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Taksi Araçları</CardTitle>
                  <CardDescription>VIP ve Paylaşımlı taksi araçlarını yönetin</CardDescription>
                </div>
                <Button onClick={() => setShowAddVehicle(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Araç Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {taxiVehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                          <Badge variant={vehicle.type === "vip" ? "default" : "secondary"}>
                            {vehicle.type === "vip" ? "VIP" : "Paylaşımlı"}
                          </Badge>
                          <Badge variant={vehicle.isAvailable ? "default" : "secondary"}>
                            {vehicle.isAvailable ? "Müsait" : "Dolu"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Kilometre Fiyatı: ₺{vehicle.pricePerKm.toFixed(2)}/km</div>
                          <div>Kapasite: {vehicle.capacity} hayvan</div>
                        </div>
                        {vehicle.description && (
                          <p className="text-sm text-muted-foreground mt-2">{vehicle.description}</p>
                        )}
                        {vehicle.features && vehicle.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {vehicle.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVehicle(vehicle)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {taxiVehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Henüz taksi aracı eklenmemiş
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Vehicle Form */}
          {showAddVehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Yeni Araç Ekle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Araç Adı *</label>
                    <Input
                      placeholder="Örn: Mercedes Vito VIP"
                      value={newVehicle.name}
                      onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Araç Tipi *</label>
                    <Select
                      value={newVehicle.type}
                      onValueChange={(value: "vip" | "shared") =>
                        setNewVehicle({ ...newVehicle, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP (Özel)</SelectItem>
                        <SelectItem value="shared">Paylaşımlı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Kilometre Fiyatı (₺) *</label>
                    <Input
                      type="number"
                      placeholder="Örn: 15"
                      value={newVehicle.pricePerKm || ""}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, pricePerKm: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kapasite (Hayvan Sayısı) *</label>
                    <Input
                      type="number"
                      placeholder="Örn: 2"
                      value={newVehicle.capacity || ""}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Açıklama</label>
                  <Input
                    placeholder="Araç hakkında kısa açıklama"
                    value={newVehicle.description}
                    onChange={(e) => setNewVehicle({ ...newVehicle, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Özellikler (virgülle ayırın)</label>
                  <Input
                    placeholder="Örn: Klimalı, Hayvan kafesi, Su kabı"
                    value={newVehicle.features}
                    onChange={(e) => setNewVehicle({ ...newVehicle, features: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddVehicle} className="flex-1">
                    Araç Ekle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddVehicle(false)
                      setNewVehicle({ name: "", type: "vip", pricePerKm: 0, capacity: 1, description: "", features: "" })
                    }}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Vehicle Form */}
          {editingVehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Araç Düzenle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Araç Adı *</label>
                    <Input
                      value={editingVehicle.name}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Araç Tipi *</label>
                    <Select
                      value={editingVehicle.type}
                      onValueChange={(value: "vip" | "shared") =>
                        setEditingVehicle({ ...editingVehicle, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP (Özel)</SelectItem>
                        <SelectItem value="shared">Paylaşımlı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Kilometre Fiyatı (₺) *</label>
                    <Input
                      type="number"
                      value={editingVehicle.pricePerKm}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, pricePerKm: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kapasite (Hayvan Sayısı) *</label>
                    <Input
                      type="number"
                      value={editingVehicle.capacity}
                      onChange={(e) =>
                        setEditingVehicle({ ...editingVehicle, capacity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Durum</label>
                  <Select
                    value={editingVehicle.isAvailable ? "available" : "unavailable"}
                    onValueChange={(value) =>
                      setEditingVehicle({ ...editingVehicle, isAvailable: value === "available" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Müsait</SelectItem>
                      <SelectItem value="unavailable">Dolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Açıklama</label>
                  <Input
                    value={editingVehicle.description || ""}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Özellikler (virgülle ayırın)</label>
                  <Input
                    value={editingVehicle.features?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        features: e.target.value.split(',').map(f => f.trim())
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateVehicle(editingVehicle)} className="flex-1">
                    Güncelle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingVehicle(null)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tarih Bazlı Oda Fiyatlandırma</CardTitle>
                <Button onClick={() => setShowAddRoomPricing(!showAddRoomPricing)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Özel Fiyat Ekle
                </Button>
              </div>
              <CardDescription>
                Belirli tarihlerde farklı fiyatlar belirleyin (bayram, hafta sonu vb.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddRoomPricing && (
                <Card className="bg-accent/50">
                  <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                      <label className="text-sm font-medium">Oda Seç *</label>
                      <Select 
                        value={newRoomPricing.roomId} 
                        onValueChange={(v) => setNewRoomPricing({ ...newRoomPricing, roomId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Oda seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name} (Normal: ₺{room.pricePerNight})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tarih *</label>
                        <Input
                          type="date"
                          value={newRoomPricing.date}
                          onChange={(e) => setNewRoomPricing({ ...newRoomPricing, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Özel Fiyat (₺) *</label>
                        <Input
                          type="number"
                          value={newRoomPricing.pricePerNight}
                          onChange={(e) => setNewRoomPricing({ ...newRoomPricing, pricePerNight: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddRoomPricing} className="flex-1">
                        Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddRoomPricing(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {roomPricings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Özel fiyatlandırma yok</p>
                ) : (
                  roomPricings.map((pricing) => {
                    const room = rooms.find(r => r.id === pricing.roomId)
                    return (
                      <div key={pricing.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                            <p className="font-semibold">{room?.name || "Oda bulunamadı"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(pricing.date).toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-lg font-bold text-primary mt-1">₺{pricing.pricePerNight}/gece</p>
                            {room && (
                              <p className="text-xs text-muted-foreground">
                                Normal fiyat: ₺{room.pricePerNight}
                              </p>
                            )}
                      </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRoomPricing(pricing.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateway Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Sanal Pos Yönetimi
                  </CardTitle>
                  <CardDescription>
                    PayTR veya Paratika sanal pos ayarlarınızı yönetin
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddGateway(!showAddGateway)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Pos Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Gateway Form */}
              {showAddGateway && (
                <Card className="bg-accent/50 border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Sanal Pos Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pos Sağlayıcı *</label>
                        <Select
                          value={newGateway.provider}
                          onValueChange={(v) => setNewGateway({ ...newGateway, provider: v as "paytr" | "paratika" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paytr">PayTR</SelectItem>
                            <SelectItem value="paratika">Paratika</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pos Adı *</label>
                        <Input
                          placeholder="Örn: Ana PayTR Pos"
                          value={newGateway.name}
                          onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Merchant ID *
                      </label>
                      <Input
                        placeholder={newGateway.provider === "paytr" ? "PayTR Merchant ID" : "Paratika Merchant ID"}
                        value={newGateway.merchantId}
                        onChange={(e) => setNewGateway({ ...newGateway, merchantId: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Merchant Key * (Şifreli saklanır)
                      </label>
                      <Input
                        type="password"
                        placeholder="Merchant Key"
                        value={newGateway.merchantKey}
                        onChange={(e) => setNewGateway({ ...newGateway, merchantKey: e.target.value })}
                      />
                    </div>

                    {newGateway.provider === "paytr" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Merchant Salt * (Şifreli saklanır)
                        </label>
                        <Input
                          type="password"
                          placeholder="PayTR Merchant Salt"
                          value={newGateway.merchantSalt}
                          onChange={(e) => setNewGateway({ ...newGateway, merchantSalt: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          API Key * (Şifreli saklanır)
                        </label>
                        <Input
                          type="password"
                          placeholder="Paratika API Key"
                          value={newGateway.apiKey}
                          onChange={(e) => setNewGateway({ ...newGateway, apiKey: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Başarılı Dönüş URL *</label>
                        <Input
                          type="url"
                          placeholder="https://petfendy.com/payment/success"
                          value={newGateway.successUrl}
                          onChange={(e) => setNewGateway({ ...newGateway, successUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hatalı Dönüş URL *</label>
                        <Input
                          type="url"
                          placeholder="https://petfendy.com/payment/fail"
                          value={newGateway.failUrl}
                          onChange={(e) => setNewGateway({ ...newGateway, failUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Para Birimi</label>
                        <Select value={newGateway.currency} onValueChange={(v) => setNewGateway({ ...newGateway, currency: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TL">TL (Türk Lirası)</SelectItem>
                            <SelectItem value="USD">USD (Dolar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newGateway.provider === "paytr" && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Max Taksit</label>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={newGateway.maxInstallment}
                              onChange={(e) => setNewGateway({ ...newGateway, maxInstallment: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Timeout (sn)</label>
                            <Input
                              type="number"
                              min="10"
                              max="300"
                              value={newGateway.timeoutLimit}
                              onChange={(e) => setNewGateway({ ...newGateway, timeoutLimit: parseInt(e.target.value) })}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="testMode"
                        checked={newGateway.testMode}
                        onChange={(e) => setNewGateway({ ...newGateway, testMode: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="testMode" className="text-sm font-medium cursor-pointer">
                        Test Modu (Gerçek ödeme yapılmaz)
                      </label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddPaymentGateway} className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Pos Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddGateway(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gateway List */}
              {paymentGateways.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Henüz sanal pos tanımlanmamış</p>
                  <Button onClick={() => setShowAddGateway(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Pos'u Ekle
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentGateways.map((gateway) => (
                    <Card key={gateway.id} className={gateway.isDefault ? "border-2 border-primary" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {gateway.provider === "paytr" ? "PayTR" : "Paratika"}
                              {gateway.isDefault && <Badge variant="default">Varsayılan</Badge>}
                            </CardTitle>
                            <CardDescription>{gateway.name}</CardDescription>
                          </div>
                          <Badge variant={gateway.isActive ? "default" : "secondary"}>
                            {gateway.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Merchant ID</p>
                            <p className="font-mono text-xs">{gateway.config.merchantId}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Para Birimi</p>
                            <p className="font-semibold">{gateway.config.currency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Test Modu</p>
                            <p>{gateway.config.testMode ? "Açık" : "Kapalı"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Durum</p>
                            <div className="flex items-center gap-1">
                              {gateway.isActive ? (
                                <><CheckCircle className="w-3 h-3 text-green-600" /> Aktif</>
                              ) : (
                                <><XCircle className="w-3 h-3 text-red-600" /> Pasif</>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 flex-wrap">
                          {!gateway.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultGateway(gateway.id)}
                            >
                              Varsayılan Yap
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleGatewayStatus(gateway.id)}
                          >
                            {gateway.isActive ? "Pasif Yap" : "Aktif Yap"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteGateway(gateway.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground pt-2">
                          Eklenme: {new Date(gateway.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <Lock className="w-4 h-4" />
                <AlertDescription>
                  <strong>Güvenlik Uyarısı:</strong> Tüm API anahtarları ve gizli bilgiler şifreli olarak saklanır.
                  Asla bu bilgileri üçüncü şahıslarla paylaşmayın.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hakkımızda Sayfası Yönetimi</CardTitle>
              <CardDescription>
                Hakkımızda sayfasının içeriğini ve resmini güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aboutPage && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Başlık</label>
                    <Input
                      value={aboutPage.title}
                      onChange={(e) => setAboutPage({ ...aboutPage, title: e.target.value })}
                      placeholder="Sayfa başlığı"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">İçerik</label>
                    <textarea
                      className="w-full min-h-[300px] p-3 border rounded-md resize-y"
                      value={aboutPage.content}
                      onChange={(e) => setAboutPage({ ...aboutPage, content: e.target.value })}
                      placeholder="Sayfa içeriği... (Paragraflar için boş satır bırakın)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sayfa Resmi</label>
                    <FileUpload
                      type="image"
                      existingFiles={aboutPage.image ? [aboutPage.image] : []}
                      onFilesChange={(urls) => setAboutPage({ ...aboutPage, image: urls[0] || "" })}
                      maxFiles={1}
                    />
                    {aboutPage.image && (
                      <div className="relative h-48 w-full rounded-lg overflow-hidden mt-2">
                        <Image
                          src={aboutPage.image}
                          alt="Hakkımızda görseli"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      const updatedAbout = { ...aboutPage, updatedAt: new Date() }
                      localStorage.setItem("petfendy_about", JSON.stringify(updatedAbout))
                      setAboutPage(updatedAbout)
                      toast({
                        title: "✅ Kaydedildi",
                        description: "Hakkımızda sayfası güncellendi",
                      })
                    }}
                    className="w-full"
                  >
                    Kaydet
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Son güncelleme: {new Date(aboutPage.updatedAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Detaylı Raporlar
              </CardTitle>
              <CardDescription>
                Gelir analizi ve performans metrikleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue by Type */}
              <div>
                <h3 className="font-semibold mb-4">Hizmet Bazında Gelir Dağılımı</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["daily", "weekly", "monthly"].map((period) => (
                    <Card key={period} className="bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium mb-3">
                          {period === "daily" ? "Günlük" : period === "weekly" ? "Haftalık" : "Aylık"}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Hotel className="w-3 h-3" />
                              Otel
                            </span>
                            <span className="font-bold text-blue-600">
                              ₺{calculateRevenue("hotel", period as any).revenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              Pet Taksi
                            </span>
                            <span className="font-bold text-green-600">
                              ₺{calculateRevenue("taxi", period as any).revenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium">Toplam</span>
                            <span className="font-bold text-primary text-lg">
                              ₺{calculateRevenue("all", period as any).revenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Order Statistics */}
              <div>
                <h3 className="font-semibold mb-4">Sipariş İstatistikleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { status: "pending", label: "Beklemede", color: "text-yellow-600" },
                    { status: "paid", label: "Ödendi", color: "text-blue-600" },
                    { status: "completed", label: "Tamamlandı", color: "text-green-600" },
                    { status: "cancelled", label: "İptal", color: "text-red-600" },
                  ].map((stat) => {
                    const count = orders.filter(o => o.status === stat.status).length
                    const revenue = orders
                      .filter(o => o.status === stat.status)
                      .reduce((sum, o) => sum + o.totalPrice, 0)
                    
                    return (
                      <Card key={stat.status}>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{count}</p>
                          <p className="text-xs text-muted-foreground mt-1">₺{revenue.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-4">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Raporu Excel Olarak İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
