"use client"

import { useState, useEffect } from "react"
import { AdminDashboardMobile } from "./admin-dashboard-mobile"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import type { Order, HotelRoom, TaxiService, TaxiVehicle, RoomPricing, AboutPage, PaymentGateway, IyzicoConfig } from "@/lib/types"
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
  Clock,
  Users,
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
  const isMobile = useIsMobile()

  // Mobile cihazlarda mobil versiyonu göster
  if (isMobile) {
    return <AdminDashboardMobile />
  }
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<HotelRoom[]>([])
  const [services, setServices] = useState<TaxiService[]>([])
  const [taxiVehicles, setTaxiVehicles] = useState<TaxiVehicle[]>([])
  const [roomPricings, setRoomPricings] = useState<RoomPricing[]>([])
  const [additionalServices, setAdditionalServices] = useState<any[]>([])
  const [aboutPage, setAboutPage] = useState<AboutPage | null>(null)
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])
  const [pages, setPages] = useState<any[]>([])
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
  const [showAddAdditionalService, setShowAddAdditionalService] = useState(false)
  const [editingAdditionalService, setEditingAdditionalService] = useState<any>(null)
  const [showAddPage, setShowAddPage] = useState(false)
  const [editingPage, setEditingPage] = useState<any>(null)
  
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
    amenities: [] as string[],
    description: "",
    features: [] as string[],
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
    features: [] as string[],
  })

  const [newRoomPricing, setNewRoomPricing] = useState({
    roomId: "",
    date: "",
    pricePerNight: 0,
  })

  const [newAdditionalService, setNewAdditionalService] = useState({
    name: "",
    type: "grooming" as const,
    description: "",
    pricingType: "weight" as "fixed" | "weight" | "room", // Sabit fiyat, kg göre veya oda göre
    basePrice: 0, // Sabit fiyat için
    pricePerKg: 0, // Kg başına fiyat
    minWeight: 0, // Minimum ağırlık
    maxWeight: 50, // Maksimum ağırlık
    roomPrices: { // Oda bazlı fiyatlar
      standard: 0,
      deluxe: 0,
      suite: 0,
    },
    duration: "",
    icon: "✂️",
  })

  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    heroImage: "",
    published: false,
    showInMenu: false,
    menuOrder: 0,
    parentSlug: "",
    pageType: "page",
    customFields: {}
  })

  // Taksi km fiyat ayarları
  const [taxiPrices, setTaxiPrices] = useState({
    vipPricePerKm: 0,
    sharedPricePerKm: 0
  })

  // Paylaşımlı taksi sefer takvimi
  const [sharedTaxiSchedules, setSharedTaxiSchedules] = useState<any[]>([])
  const [newSharedTaxiSchedule, setNewSharedTaxiSchedule] = useState({
    route: '',
    date: '',
    time: '',
    customTime: '',
    capacity: 4,
    price: 0
  })

  // Paylaşımlı taksi sabit fiyat listesi
  const sharedTaxiPrices = {
    'ankara-istanbul': 4500,
    'ankara-izmir': 5500,
    'ankara-antalya': 5000,
    'ankara-bodrum': 6500,
    'ankara-bursa': 3500,
    'ankara-konya': 2500,
    'ankara-samsun': 3000,
    'ankara-trabzon': 4000,
    'ankara-adana': 4000,
    'ankara-gaziantep': 4500,
    'istanbul-izmir': 3500,
    'istanbul-antalya': 4000,
    'izmir-antalya': 3000,
    'custom': 0
  }

  const [newGateway, setNewGateway] = useState<{
    provider: "iyzico"
    name: string
    testMode: boolean
    apiKey: string
    secretKey: string
    currency: string
  }>({
    provider: "iyzico",
    name: "",
    testMode: true,
    apiKey: "",
    secretKey: "",
    currency: "TRY"
  })

  // API Functions for Pages
  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages?includeUnpublished=true')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      } else {
        console.error('Failed to fetch pages:', response.statusText)
        setPages([])
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error)
      setPages([])
    }
  }

  const createPageAPI = async (pageData: any): Promise<any | null> => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(pageData)
      })
      if (response.ok) {
        return await response.json()
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create page')
    } catch (error) {
      console.error('Failed to create page:', error)
      throw error
    }
  }

  const updatePageAPI = async (slug: string, pageData: any): Promise<any | null> => {
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(pageData)
      })
      if (response.ok) {
        return await response.json()
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update page')
    } catch (error) {
      console.error('Failed to update page:', error)
      throw error
    }
  }

  const deletePageAPI = async (slug: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/pages/${slug}`, { method: 'DELETE' })
      if (response.ok) {
        return true
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete page')
    } catch (error) {
      console.error('Failed to delete page:', error)
      throw error
    }
  }

  // API Functions for Rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
          const data = await response.json()
                  setRooms(Array.isArray(data) ? data : [])
                            return
                                    }
                                          } catch (error) {
                                                  console.error('Failed to fetch rooms:', error)
                                                        }
                                                              setRooms([])
                                                                  }
  }

  const createRoomAPI = async (roomData: any): Promise<HotelRoom | null> => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
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
    
    // Fetch pages from API
    fetchPages()

    // Load other data from localStorage (will be migrated later)
    const storedOrders = JSON.parse(localStorage.getItem("petfendy_orders") || "[]")
    const storedBookings = JSON.parse(localStorage.getItem("petfendy_bookings") || "[]")
    const storedServices = JSON.parse(localStorage.getItem("petfendy_services") || JSON.stringify(mockTaxiServices))
    const storedVehicles = JSON.parse(localStorage.getItem("petfendy_taxi_vehicles") || "[]")
    const storedRoomPricings = JSON.parse(localStorage.getItem("petfendy_room_pricings") || "[]")
    const storedAdditionalServices = JSON.parse(localStorage.getItem("petfendy_additional_services") || "[]")
    const storedAbout = localStorage.getItem("petfendy_about")
    const storedGateways = JSON.parse(localStorage.getItem("petfendy_payment_gateways") || "[]")

    setOrders(storedOrders)
    setBookings(storedBookings)
    setServices(storedServices)
    setTaxiVehicles(storedVehicles)
    setRoomPricings(storedRoomPricings)
    setAdditionalServices(storedAdditionalServices.length > 0 ? storedAdditionalServices : [
      { id: "grooming-1", name: "Traş ve Bakım", type: "grooming", pricingType: "weight", pricePerKg: 15, minWeight: 1, maxWeight: 50, description: "Profesyonel tıraş ve bakım hizmeti", duration: "1-2 saat", icon: "✂️" },
      { id: "training-1", name: "Eğitim", type: "training", pricingType: "fixed", basePrice: 150, description: "Temel itaat eğitimi", duration: "1 saat", icon: "🎓" },
      { id: "vet-1", name: "Veteriner Kontrolü", type: "vet", pricingType: "room", roomPrices: { standard: 150, deluxe: 200, suite: 250 }, description: "Oda tipine göre veteriner kontrolü", duration: "30 dakika", icon: "👨‍⚕️" }
    ])
    setPaymentGateways(storedGateways)

    // Taksi fiyatlarını yükle
    const storedTaxiPrices = localStorage.getItem("petfendy_taxi_prices")
    if (storedTaxiPrices) {
      setTaxiPrices(JSON.parse(storedTaxiPrices))
    }

    // Paylaşımlı taksi seferlerini yükle
    const storedSchedules = localStorage.getItem("petfendy_shared_taxi_schedules")
    if (storedSchedules) {
      setSharedTaxiSchedules(JSON.parse(storedSchedules))
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

  // Paylaşımlı taksi sefer yönetimi
  const saveSharedTaxiSchedules = (schedules: any[]) => {
    localStorage.setItem("petfendy_shared_taxi_schedules", JSON.stringify(schedules))
    setSharedTaxiSchedules(schedules)
    
    // Trigger custom event for same-page updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sharedTaxiSchedulesUpdated'))
    }
  }

  const handleAddSharedTaxiSchedule = () => {
    const finalTime = newSharedTaxiSchedule.time === 'custom' ? newSharedTaxiSchedule.customTime : newSharedTaxiSchedule.time
    
    if (!newSharedTaxiSchedule.route || !newSharedTaxiSchedule.date || !finalTime) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive"
      })
      return
    }

    if (!newSharedTaxiSchedule.price || newSharedTaxiSchedule.price <= 0) {
      toast({
        title: "Hata", 
        description: "Lütfen geçerli bir fiyat girin",
        variant: "destructive"
      })
      return
    }

    // Aynı tarih ve saatte sefer var mı kontrol et
    const existingSchedule = sharedTaxiSchedules.find(s => 
      s.route === newSharedTaxiSchedule.route && 
      s.date === newSharedTaxiSchedule.date && 
      s.time === finalTime
    )

    if (existingSchedule) {
      toast({
        title: "Hata",
        description: "Bu tarih ve saatte zaten bir sefer planlanmış",
        variant: "destructive"
      })
      return
    }

    const schedule = {
      id: `schedule-${Date.now()}`,
      route: newSharedTaxiSchedule.route,
      routeDisplay: newSharedTaxiSchedule.route.replace('-', ' → ').toUpperCase(),
      date: newSharedTaxiSchedule.date,
      time: finalTime,
      capacity: newSharedTaxiSchedule.capacity,
      price: newSharedTaxiSchedule.price,
      bookedSeats: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    saveSharedTaxiSchedules([...sharedTaxiSchedules, schedule])
    setNewSharedTaxiSchedule({route: '', date: '', time: '', customTime: '', capacity: 4, price: 0})

    toast({
      title: "✅ Sefer Eklendi",
      description: `${schedule.routeDisplay} - ${new Date(schedule.date).toLocaleDateString('tr-TR')} ${schedule.time} (₺${schedule.price})`,
    })
  }

  const handleToggleScheduleStatus = (scheduleId: string) => {
    const updatedSchedules = sharedTaxiSchedules.map(s =>
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    )
    saveSharedTaxiSchedules(updatedSchedules)

    const schedule = sharedTaxiSchedules.find(s => s.id === scheduleId)
    toast({
      title: "✅ Durum Güncellendi",
      description: `${schedule?.route} seferi ${schedule?.isActive ? 'pasif' : 'aktif'} yapıldı`,
    })
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = sharedTaxiSchedules.find(s => s.id === scheduleId)
    
    if (schedule && schedule.bookedSeats > 0) {
      toast({
        title: "Hata",
        description: "Rezervasyonu olan sefer silinemez",
        variant: "destructive"
      })
      return
    }

    saveSharedTaxiSchedules(sharedTaxiSchedules.filter(s => s.id !== scheduleId))
    
    toast({
      title: "🗑️ Sefer Silindi",
      description: `${schedule?.route} seferi silindi`,
    })
  }

  const saveRoomPricings = (updatedPricings: RoomPricing[]) => {
    localStorage.setItem("petfendy_room_pricings", JSON.stringify(updatedPricings))
    setRoomPricings(updatedPricings)
  }

  const saveAdditionalServices = (updatedServices: any[]) => {
    localStorage.setItem("petfendy_additional_services", JSON.stringify(updatedServices))
    setAdditionalServices(updatedServices)
    
    // Trigger custom event for same-page updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('additionalServicesUpdated'))
    }
  }

  // Page management
  const handleAddPage = async () => {
    if (!newPage.title || !newPage.content) {
      toast({
        title: "Hata",
        description: "Başlık ve içerik zorunludur",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Generate slug if not provided
      const slug = newPage.slug || generateSlugFromTitle(newPage.title)
      
      const pageData = {
        ...newPage,
        slug,
        menuOrder: parseInt(newPage.menuOrder.toString()) || 0
      }

      const result = await createPageAPI(pageData)
      if (result) {
        await fetchPages() // Refresh pages list

        setNewPage({
          title: "",
          slug: "",
          content: "",
          excerpt: "",
          metaTitle: "",
          metaDescription: "",
          heroImage: "",
          published: false,
          showInMenu: false,
          menuOrder: 0,
          parentSlug: "",
          pageType: "page",
          customFields: {}
        })
        setShowAddPage(false)

        toast({
          title: "✅ Başarılı",
          description: `${pageData.title} sayfası eklendi`,
        })
      }
    } catch (error: any) {
      console.error('Page creation error:', error)
      toast({
        title: "Hata",
        description: error.message || "Sayfa eklenirken hata oluştu. Database bağlantısını kontrol edin.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePage = async (updatedPage: any) => {
    setIsLoading(true)

    try {
      await updatePageAPI(editingPage.slug, updatedPage)
      await fetchPages() // Refresh pages list
      setEditingPage(null)

      toast({
        title: "✅ Güncellendi",
        description: `${updatedPage.title} sayfası güncellendi`,
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sayfa güncellenirken hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePage = async (slug: string) => {
    const page = pages.find(p => p.slug === slug)
    
    if (!confirm(`"${page?.title}" sayfasını silmek istediğinizden emin misiniz?`)) {
      return
    }

    setIsLoading(true)

    try {
      await deletePageAPI(slug)
      await fetchPages() // Refresh pages list

      toast({
        title: "🗑️ Silindi",
        description: `${page?.title} sayfası silindi`,
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sayfa silinirken hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlugFromTitle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 100) // Limit length
  }

  // Room management
  const handleAddRoom = async () => {
    if (!newRoom.name) {
      toast({
        title: "Hata",
        description: "Lütfen oda adını girin",
        variant: "destructive"
      })
      return
    }

    if (newRoom.pricePerNight < 0) {
      toast({
        title: "Hata",
        description: "Fiyat 0 veya daha büyük olmalıdır",
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
      amenities: newRoom.amenities.filter(a => a.trim()),
      features: newRoom.features.filter(f => f.trim()),
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

    setNewRoom({ name: "", type: "standard", capacity: 1, pricePerNight: 0, amenities: [], description: "", features: [] })
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
    if (!newService.name || newService.basePrice < 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun ve fiyat 0 veya pozitif olmalıdır",
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
    if (!newVehicle.name || newVehicle.pricePerKm < 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun ve fiyat 0 veya pozitif olmalıdır",
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
      features: newVehicle.features.filter(f => f.trim()),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    saveTaxiVehicles([...taxiVehicles, vehicle])
    setNewVehicle({ name: "", type: "vip", pricePerKm: 0, capacity: 1, description: "", features: [] })
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

  // Additional Services Management
  const handleAddAdditionalService = () => {
    if (!newAdditionalService.name) {
      toast({
        title: "Hata",
        description: "Hizmet adı zorunludur",
        variant: "destructive",
      })
      return
    }

    if (newAdditionalService.pricingType === "fixed" && newAdditionalService.basePrice < 0) {
      toast({
        title: "Hata", 
        description: "Sabit fiyat 0 veya pozitif olmalıdır",
        variant: "destructive",
      })
      return
    }

    if (newAdditionalService.pricingType === "weight" && newAdditionalService.pricePerKg < 0) {
      toast({
        title: "Hata",
        description: "Kg başına fiyat 0 veya pozitif olmalıdır", 
        variant: "destructive",
      })
      return
    }

    if (newAdditionalService.pricingType === "room") {
      const roomPrices = newAdditionalService.roomPrices
      if (!roomPrices.standard || !roomPrices.deluxe || !roomPrices.suite) {
        toast({
          title: "Hata",
          description: "Tüm oda tipleri için fiyat girilmelidir",
          variant: "destructive",
        })
        return
      }
    }

    const service = {
      id: `service-${Date.now()}`,
      ...newAdditionalService,
    }

    saveAdditionalServices([...additionalServices, service])
    setNewAdditionalService({
      name: "",
      type: "grooming",
      description: "",
      pricingType: "weight",
      basePrice: 0,
      pricePerKg: 0,
      minWeight: 0,
      maxWeight: 50,
      roomPrices: {
        standard: 0,
        deluxe: 0,
        suite: 0,
      },
      duration: "",
      icon: "✂️",
    })
    setShowAddAdditionalService(false)
    
    toast({
      title: "Başarılı",
      description: "Ek hizmet eklendi",
    })
  }

  const handleUpdateAdditionalService = () => {
    if (!editingAdditionalService) return

    const updatedServices = additionalServices.map(service =>
      service.id === editingAdditionalService.id ? editingAdditionalService : service
    )
    
    saveAdditionalServices(updatedServices)
    setEditingAdditionalService(null)
    
    toast({
      title: "Başarılı", 
      description: "Ek hizmet güncellendi",
    })
  }

  const handleDeleteAdditionalService = (serviceId: string) => {
    saveAdditionalServices(additionalServices.filter(s => s.id !== serviceId))
    toast({
      title: "Başarılı",
      description: "Ek hizmet silindi",
    })
  }

  // Payment Gateway Management
  const savePaymentGateways = (gateways: PaymentGateway[]) => {
    localStorage.setItem("petfendy_payment_gateways", JSON.stringify(gateways))
    setPaymentGateways(gateways)
  }

  const handleAddPaymentGateway = () => {
    // Validation
    if (!newGateway.name || newGateway.name.length < 3) {
      toast({
        title: "Hata",
        description: "Pos adı minimum 3 karakter olmalıdır",
        variant: "destructive"
      })
      return
    }

    if (!newGateway.apiKey || newGateway.apiKey.length < 10) {
      toast({
        title: "Hata",
        description: "İyzico API Key gereklidir",
        variant: "destructive"
      })
      return
    }

    if (!newGateway.secretKey || newGateway.secretKey.length < 10) {
      toast({
        title: "Hata",
        description: "İyzico Secret Key gereklidir",
        variant: "destructive"
      })
      return
    }

    // If this is the first gateway, make it default
    const isFirstGateway = paymentGateways.length === 0

    const config: IyzicoConfig = {
      apiKey: newGateway.apiKey,
      secretKey: newGateway.secretKey,
      testMode: newGateway.testMode,
      currency: newGateway.currency as "TRY"
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
      provider: "iyzico",
      name: "",
      testMode: true,
      apiKey: "",
      secretKey: "",
      currency: "TRY"
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
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Yönetim Paneli
        </h2>
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-sm">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Günlük</SelectItem>
            <SelectItem value="weekly">Haftalık</SelectItem>
            <SelectItem value="monthly">Aylık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Cards - Mobile: 2 columns, Desktop: 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-muted-foreground">Sipariş</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">{totalStats.count}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {dateFilter === "daily" ? "Bugün" : dateFilter === "weekly" ? "Bu Hafta" : "Bu Ay"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">Ciro</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400">₺{totalStats.revenue.toFixed(0)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {dateFilter === "daily" ? "Bugün" : dateFilter === "weekly" ? "Bu Hafta" : "Bu Ay"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Hotel className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs text-muted-foreground">Otel</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-400">₺{hotelStats.revenue.toFixed(0)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{hotelStats.count} rezervasyon</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Car className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-muted-foreground">Taksi</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-400">₺{taxiStats.revenue.toFixed(0)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{taxiStats.count} rezervasyon</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Mobile First Design */}
      <Tabs defaultValue="orders" className="w-full">
        {/* Mobile: Horizontal scroll tabs, Desktop: Grid */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="flex overflow-x-auto gap-1 p-1 h-auto bg-muted/50 rounded-xl md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">
            <TabsTrigger value="orders" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="w-4 h-4" />
              <span>Siparişler</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Hotel className="w-4 h-4" />
              <span>Odalar</span>
            </TabsTrigger>
            <TabsTrigger value="additional-services" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plus className="w-4 h-4" />
              <span>Ek Hizmetler</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Car className="w-4 h-4" />
              <span>Pet Taksi</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Fiyatlandırma</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-4 h-4" />
              <span>Ödeme</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              <span>Sayfa Yönetimi</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              <span>Hakkımızda</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-shrink-0 gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Raporlar</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
                <div>
                  <CardTitle>Otel Odaları Yönetimi</CardTitle>
                  <CardDescription className="mt-2">
                    Otel odalarınızı buradan yönetebilirsiniz. Oda bilgileri, fiyatları, resimleri ve müsaitlik durumunu güncelleyebilirsiniz.
                    Değişiklikler anında rezervasyon sayfalarına yansır.
                  </CardDescription>
                </div>
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
                        value={newRoom.amenities.join(", ")}
                        onChange={(e) => setNewRoom({ 
                          ...newRoom, 
                          amenities: e.target.value.split(",").map((a) => a.trim()).filter(a => a)
                        })}
                        placeholder="Yatak, Klima, Oyuncak, Kamera, 7/24 Bakım"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Özellikler (virgülle ayırın)</label>
                      <Input
                        value={newRoom.features.join(", ")}
                        onChange={(e) => setNewRoom({ 
                          ...newRoom, 
                          features: e.target.value.split(",").map((f) => f.trim()).filter(f => f)
                        })}
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
                      <Button onClick={handleAddRoom} className="flex-1" disabled={isLoading}>
                        {isLoading ? "Ekleniyor..." : "Oda Ekle"}
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

        {/* Additional Services Tab */}
        <TabsContent value="additional-services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ek Hizmetler Yönetimi</CardTitle>
                  <CardDescription className="mt-2">
                    Otel rezervasyonlarında sunulan ek hizmetleri yönetin. Traş bakım hizmeti için kg göre fiyatlandırma yapabilirsiniz.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddAdditionalService(!showAddAdditionalService)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Hizmet Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddAdditionalService && (
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Ek Hizmet Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hizmet Adı *</label>
                        <Input
                          value={newAdditionalService.name}
                          onChange={(e) => setNewAdditionalService({ ...newAdditionalService, name: e.target.value })}
                          placeholder="Örn: Traş ve Bakım"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hizmet Tipi *</label>
                        <Select
                          value={newAdditionalService.type}
                          onValueChange={(v) => setNewAdditionalService({ ...newAdditionalService, type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grooming">Traş ve Bakım</SelectItem>
                            <SelectItem value="training">Eğitim</SelectItem>
                            <SelectItem value="vet">Veteriner</SelectItem>
                            <SelectItem value="daycare">Günlük Bakım</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fiyatlandırma Tipi *</label>
                        <Select
                          value={newAdditionalService.pricingType}
                          onValueChange={(v) => setNewAdditionalService({ ...newAdditionalService, pricingType: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Sabit Fiyat</SelectItem>
                            <SelectItem value="weight">Kg Göre Fiyat</SelectItem>
                            <SelectItem value="room">Oda Tipine Göre Fiyat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">İkon</label>
                        <Input
                          value={newAdditionalService.icon}
                          onChange={(e) => setNewAdditionalService({ ...newAdditionalService, icon: e.target.value })}
                          placeholder="✂️"
                        />
                      </div>
                    </div>
                    
                    {newAdditionalService.pricingType === "fixed" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sabit Fiyat (₺) *</label>
                        <Input
                          type="number"
                          value={newAdditionalService.basePrice}
                          onChange={(e) => setNewAdditionalService({ ...newAdditionalService, basePrice: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : newAdditionalService.pricingType === "weight" ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Kg Başına Fiyat (₺) *</label>
                          <Input
                            type="number"
                            value={newAdditionalService.pricePerKg}
                            onChange={(e) => setNewAdditionalService({ ...newAdditionalService, pricePerKg: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Min Ağırlık (kg)</label>
                          <Input
                            type="number"
                            value={newAdditionalService.minWeight}
                            onChange={(e) => setNewAdditionalService({ ...newAdditionalService, minWeight: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Max Ağırlık (kg)</label>
                          <Input
                            type="number"
                            value={newAdditionalService.maxWeight}
                            onChange={(e) => setNewAdditionalService({ ...newAdditionalService, maxWeight: parseFloat(e.target.value) || 50 })}
                            min="0"
                            step="0.1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-sm font-medium">Oda Tipine Göre Fiyatlar (₺) *</label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Standart Oda</label>
                            <Input
                              type="number"
                              value={newAdditionalService.roomPrices.standard}
                              onChange={(e) => setNewAdditionalService({ 
                                ...newAdditionalService, 
                                roomPrices: { 
                                  ...newAdditionalService.roomPrices, 
                                  standard: parseFloat(e.target.value) || 0 
                                }
                              })}
                              min="0"
                              step="0.01"
                              placeholder="Standart fiyat"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Deluxe Oda</label>
                            <Input
                              type="number"
                              value={newAdditionalService.roomPrices.deluxe}
                              onChange={(e) => setNewAdditionalService({ 
                                ...newAdditionalService, 
                                roomPrices: { 
                                  ...newAdditionalService.roomPrices, 
                                  deluxe: parseFloat(e.target.value) || 0 
                                }
                              })}
                              min="0"
                              step="0.01"
                              placeholder="Deluxe fiyat"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Suite Oda</label>
                            <Input
                              type="number"
                              value={newAdditionalService.roomPrices.suite}
                              onChange={(e) => setNewAdditionalService({ 
                                ...newAdditionalService, 
                                roomPrices: { 
                                  ...newAdditionalService.roomPrices, 
                                  suite: parseFloat(e.target.value) || 0 
                                }
                              })}
                              min="0"
                              step="0.01"
                              placeholder="Suite fiyat"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Süre</label>
                        <Input
                          value={newAdditionalService.duration}
                          onChange={(e) => setNewAdditionalService({ ...newAdditionalService, duration: e.target.value })}
                          placeholder="Örn: 1-2 saat"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Açıklama</label>
                      <Textarea
                        value={newAdditionalService.description}
                        onChange={(e) => setNewAdditionalService({ ...newAdditionalService, description: e.target.value })}
                        placeholder="Hizmet hakkında detaylı açıklama"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleAddAdditionalService} className="flex-1">
                        Hizmet Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddAdditionalService(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalServices.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <CardDescription>{service.type}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={service.pricingType === "weight" ? "default" : service.pricingType === "room" ? "destructive" : "secondary"}>
                          {service.pricingType === "weight" ? "Kg Göre" : service.pricingType === "room" ? "Oda Göre" : "Sabit Fiyat"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {service.pricingType === "fixed" ? (
                          <div>
                            <p className="text-muted-foreground">Fiyat</p>
                            <p className="font-bold text-primary">₺{service.basePrice}</p>
                          </div>
                        ) : service.pricingType === "weight" ? (
                          <div>
                            <p className="text-muted-foreground">Kg Başına</p>
                            <p className="font-bold text-primary">₺{service.pricePerKg}/kg</p>
                          </div>
                        ) : (
                          <div className="col-span-2">
                            <p className="text-muted-foreground mb-2">Oda Fiyatları</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center">
                                <p className="text-muted-foreground">Standart</p>
                                <p className="font-bold text-primary">₺{service.roomPrices?.standard || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Deluxe</p>
                                <p className="font-bold text-primary">₺{service.roomPrices?.deluxe || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Suite</p>
                                <p className="font-bold text-primary">₺{service.roomPrices?.suite || 0}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {service.duration && (
                          <div>
                            <p className="text-muted-foreground">Süre</p>
                            <p className="font-semibold">{service.duration}</p>
                          </div>
                        )}
                      </div>
                      
                      {service.pricingType === "weight" && (
                        <div className="text-xs text-muted-foreground">
                          Ağırlık aralığı: {service.minWeight}kg - {service.maxWeight}kg
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingAdditionalService(service)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdditionalService(service.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit Additional Service Modal */}
        {editingAdditionalService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Ek Hizmet Düzenle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Hizmet Adı</label>
                    <Input
                      value={editingAdditionalService.name}
                      onChange={(e) => setEditingAdditionalService({
                        ...editingAdditionalService,
                        name: e.target.value
                      })}
                      placeholder="Hizmet adı"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hizmet Türü</label>
                    <select
                      value={editingAdditionalService.type}
                      onChange={(e) => setEditingAdditionalService({
                        ...editingAdditionalService,
                        type: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="grooming">Traş ve Bakım</option>
                      <option value="training">Eğitim</option>
                      <option value="veterinary">Veteriner</option>
                      <option value="transport">Ulaşım</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fiyatlandırma Türü</label>
                    <select
                      value={editingAdditionalService.pricingType}
                      onChange={(e) => setEditingAdditionalService({
                        ...editingAdditionalService,
                        pricingType: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="fixed">Sabit Fiyat</option>
                      <option value="weight">Ağırlık Bazlı (kg)</option>
                      <option value="hourly">Saatlik</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {editingAdditionalService.pricingType === 'weight' ? 'KG Başına Fiyat (₺)' : 
                       editingAdditionalService.pricingType === 'hourly' ? 'Saatlik Fiyat (₺)' : 
                       'Sabit Fiyat (₺)'}
                    </label>
                    <Input
                      type="number"
                      value={editingAdditionalService.pricingType === 'weight' ? 
                             editingAdditionalService.pricePerKg : 
                             editingAdditionalService.pricingType === 'hourly' ?
                             editingAdditionalService.pricePerHour :
                             editingAdditionalService.basePrice}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (editingAdditionalService.pricingType === 'weight') {
                          setEditingAdditionalService({
                            ...editingAdditionalService,
                            pricePerKg: value
                          })
                        } else if (editingAdditionalService.pricingType === 'hourly') {
                          setEditingAdditionalService({
                            ...editingAdditionalService,
                            pricePerHour: value
                          })
                        } else {
                          setEditingAdditionalService({
                            ...editingAdditionalService,
                            basePrice: value
                          })
                        }
                      }}
                      placeholder="Fiyat"
                    />
                  </div>
                </div>

                {editingAdditionalService.pricingType === 'weight' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Min Ağırlık (kg)</label>
                      <Input
                        type="number"
                        value={editingAdditionalService.minWeight || 1}
                        onChange={(e) => setEditingAdditionalService({
                          ...editingAdditionalService,
                          minWeight: parseFloat(e.target.value) || 1
                        })}
                        placeholder="Min kg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Ağırlık (kg)</label>
                      <Input
                        type="number"
                        value={editingAdditionalService.maxWeight || 50}
                        onChange={(e) => setEditingAdditionalService({
                          ...editingAdditionalService,
                          maxWeight: parseFloat(e.target.value) || 50
                        })}
                        placeholder="Max kg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Açıklama</label>
                  <textarea
                    value={editingAdditionalService.description}
                    onChange={(e) => setEditingAdditionalService({
                      ...editingAdditionalService,
                      description: e.target.value
                    })}
                    placeholder="Hizmet açıklaması"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Süre</label>
                    <Input
                      value={editingAdditionalService.duration}
                      onChange={(e) => setEditingAdditionalService({
                        ...editingAdditionalService,
                        duration: e.target.value
                      })}
                      placeholder="Örn: 1-2 saat"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">İkon (Emoji)</label>
                    <Input
                      value={editingAdditionalService.icon}
                      onChange={(e) => setEditingAdditionalService({
                        ...editingAdditionalService,
                        icon: e.target.value
                      })}
                      placeholder="Örn: ✂️"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateAdditionalService} className="flex-1">
                    Güncelle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAdditionalService(null)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pet Taksi Tab (Vehicles) */}
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
              <Button type="button" onClick={() => saveTaxiPrices()} className="mt-4 w-full">
                Fiyatları Kaydet
              </Button>
            </CardContent>
          </Card>

          {/* Paylaşımlı Taksi Sefer Takvimi */}
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Paylaşımlı Taksi Sefer Takvimi
              </CardTitle>
              <CardDescription>
                Paylaşımlı taksi seferleri için belirli tarih ve saatleri ayarlayın. Müşteriler sadece bu tarihleri seçebilir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sefer Ekleme Formu */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Güzergah</label>
                    <Select value={newSharedTaxiSchedule.route} onValueChange={(value) => {
                      const suggestedPrice = sharedTaxiPrices[value as keyof typeof sharedTaxiPrices] || 0
                      setNewSharedTaxiSchedule({
                        ...newSharedTaxiSchedule, 
                        route: value,
                        price: suggestedPrice
                      })
                    }}>
                      <SelectTrigger className="border-blue-300 focus:border-blue-500">
                        <SelectValue placeholder="Güzergah seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ankara-istanbul">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → İstanbul</span>
                            <span className="text-green-600 font-semibold ml-4">₺4,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-izmir">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → İzmir</span>
                            <span className="text-green-600 font-semibold ml-4">₺5,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-antalya">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Antalya</span>
                            <span className="text-green-600 font-semibold ml-4">₺5,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-bodrum">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Bodrum</span>
                            <span className="text-green-600 font-semibold ml-4">₺6,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-bursa">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Bursa</span>
                            <span className="text-green-600 font-semibold ml-4">₺3,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-konya">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Konya</span>
                            <span className="text-green-600 font-semibold ml-4">₺2,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-samsun">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Samsun</span>
                            <span className="text-green-600 font-semibold ml-4">₺3,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-trabzon">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Trabzon</span>
                            <span className="text-green-600 font-semibold ml-4">₺4,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-adana">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Adana</span>
                            <span className="text-green-600 font-semibold ml-4">₺4,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ankara-gaziantep">
                          <div className="flex justify-between items-center w-full">
                            <span>Ankara → Gaziantep</span>
                            <span className="text-green-600 font-semibold ml-4">₺4,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="istanbul-izmir">
                          <div className="flex justify-between items-center w-full">
                            <span>İstanbul → İzmir</span>
                            <span className="text-green-600 font-semibold ml-4">₺3,500</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="istanbul-antalya">
                          <div className="flex justify-between items-center w-full">
                            <span>İstanbul → Antalya</span>
                            <span className="text-green-600 font-semibold ml-4">₺4,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="izmir-antalya">
                          <div className="flex justify-between items-center w-full">
                            <span>İzmir → Antalya</span>
                            <span className="text-green-600 font-semibold ml-4">₺3,000</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="custom">
                          <div className="flex justify-between items-center w-full">
                            <span>Özel Güzergah</span>
                            <span className="text-gray-500 font-semibold ml-4">Manuel</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Tarih</label>
                    <Input 
                      type="date" 
                      value={newSharedTaxiSchedule.date}
                      onChange={(e) => setNewSharedTaxiSchedule({...newSharedTaxiSchedule, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Saat</label>
                    <Select value={newSharedTaxiSchedule.time} onValueChange={(value) => setNewSharedTaxiSchedule({...newSharedTaxiSchedule, time: value})}>
                      <SelectTrigger className="border-blue-300 focus:border-blue-500">
                        <SelectValue placeholder="Saat seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">06:00</SelectItem>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                        <SelectItem value="20:00">20:00</SelectItem>
                        <SelectItem value="custom">Özel Saat</SelectItem>
                      </SelectContent>
                    </Select>
                    {newSharedTaxiSchedule.time === 'custom' && (
                      <Input 
                        type="time" 
                        value={newSharedTaxiSchedule.customTime || ''}
                        onChange={(e) => setNewSharedTaxiSchedule({...newSharedTaxiSchedule, customTime: e.target.value})}
                        className="border-blue-300 focus:border-blue-500 mt-2"
                        placeholder="Özel saat girin"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Kapasite</label>
                    <Select value={newSharedTaxiSchedule.capacity.toString()} onValueChange={(value) => setNewSharedTaxiSchedule({...newSharedTaxiSchedule, capacity: parseInt(value)})}>
                      <SelectTrigger className="border-blue-300 focus:border-blue-500">
                        <SelectValue placeholder="Kapasite" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Hayvan</SelectItem>
                        <SelectItem value="3">3 Hayvan</SelectItem>
                        <SelectItem value="4">4 Hayvan</SelectItem>
                        <SelectItem value="5">5 Hayvan</SelectItem>
                        <SelectItem value="6">6 Hayvan</SelectItem>
                        <SelectItem value="8">8 Hayvan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-800">Fiyat (₺)</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={newSharedTaxiSchedule.price || ''}
                        onChange={(e) => setNewSharedTaxiSchedule({...newSharedTaxiSchedule, price: parseFloat(e.target.value) || 0})}
                        placeholder="Kişi başı fiyat"
                        min="0"
                        step="100"
                        className="border-blue-300 focus:border-blue-500"
                      />
                      {newSharedTaxiSchedule.route && newSharedTaxiSchedule.route !== 'custom' && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Badge variant="outline" className="text-xs text-green-600">
                            Önerilen: ₺{sharedTaxiPrices[newSharedTaxiSchedule.route as keyof typeof sharedTaxiPrices]}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {newSharedTaxiSchedule.route === 'custom' && (
                      <p className="text-xs text-gray-500">Özel güzergah için manuel fiyat belirleyin</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddSharedTaxiSchedule} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Sefer Ekle
                  </Button>
                  <Button variant="outline" onClick={() => setNewSharedTaxiSchedule({route: '', date: '', time: '', customTime: '', capacity: 4, price: 0})}>
                    Temizle
                  </Button>
                </div>

                {/* Fiyat Referans Tablosu */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Paylaşımlı Taksi Sabit Fiyat Listesi
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">İstanbul</span>
                      <span className="text-green-600 font-bold">₺4,500</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">İzmir</span>
                      <span className="text-green-600 font-bold">₺5,500</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Antalya</span>
                      <span className="text-green-600 font-bold">₺5,000</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Bodrum</span>
                      <span className="text-green-600 font-bold">₺6,500</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Bursa</span>
                      <span className="text-green-600 font-bold">₺3,500</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Konya</span>
                      <span className="text-green-600 font-bold">₺2,500</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Samsun</span>
                      <span className="text-green-600 font-bold">₺3,000</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border">
                      <span className="font-medium">Trabzon</span>
                      <span className="text-green-600 font-bold">₺4,000</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-3 text-center">
                    * Fiyatlar kişi başı olup, güzergah seçildiğinde otomatik olarak önerilir
                  </p>
                </div>

                {/* Mevcut Seferler */}
                <div className="space-y-2">
                  <h4 className="font-medium">Planlanan Seferler</h4>
                  {sharedTaxiSchedules.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Henüz sefer planlanmamış</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {sharedTaxiSchedules
                        .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                        .map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-lg text-blue-800">
                                {schedule.routeDisplay || schedule.route.replace('-', ' → ').toUpperCase()}
                              </div>
                              <Badge variant={schedule.isActive ? "default" : "secondary"} className="text-xs">
                                {schedule.isActive ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(schedule.date).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {schedule.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {schedule.bookedSeats}/{schedule.capacity} Kişi
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₺{schedule.price || 0} / Kişi
                              </div>
                            </div>
                            {schedule.bookedSeats > 0 && (
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                {schedule.bookedSeats} rezervasyon var
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant={schedule.isActive ? "destructive" : "default"}
                              onClick={() => handleToggleScheduleStatus(schedule.id)}
                              className="text-xs"
                            >
                              {schedule.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-xs"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                    value={newVehicle.features.join(", ")}
                    onChange={(e) => setNewVehicle({ 
                      ...newVehicle, 
                      features: e.target.value.split(",").map(f => f.trim()).filter(f => f)
                    })}
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
                      setNewVehicle({ name: "", type: "vip", pricePerKm: 0, capacity: 1, description: "", features: [] })
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
                    İyzico sanal pos ayarlarınızı yönetin
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
                          onValueChange={(v) => setNewGateway({ ...newGateway, provider: v as "iyzico" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="iyzico">İyzico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pos Adı *</label>
                        <Input
                          placeholder="Örn: Ana İyzico Pos"
                          value={newGateway.name}
                          onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        İyzico API Key *
                      </label>
                      <Input
                        placeholder="İyzico API Key"
                        value={newGateway.apiKey}
                        onChange={(e) => setNewGateway({ ...newGateway, apiKey: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        İyzico Secret Key *
                      </label>
                      <Input
                        type="password"
                        placeholder="İyzico Secret Key"
                        value={newGateway.secretKey}
                        onChange={(e) => setNewGateway({ ...newGateway, secretKey: e.target.value })}
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Secret Key * (Şifreli saklanır)
                      </label>
                      <Input
                        type="password"
                        placeholder="İyzico Secret Key"
                        value={newGateway.secretKey}
                        onChange={(e) => setNewGateway({ ...newGateway, secretKey: e.target.value })}
                      />
                    </div>

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
                              <SelectItem value="TRY">TRY (Türk Lirası)</SelectItem>
                              <SelectItem value="USD">USD (Dolar)</SelectItem>
                              <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                              İyzico
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sayfa Yönetimi</CardTitle>
                  <CardDescription>
                    Sitenizin tüm sayfalarını buradan yönetebilirsiniz. Yeni sayfa ekleyebilir, mevcut sayfaları düzenleyebilir veya silebilirsiniz.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddPage(!showAddPage)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Sayfa Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddPage && (
                <Card className="bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Sayfa Ekle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sayfa Başlığı *</label>
                        <Input
                          value={newPage.title}
                          onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                          placeholder="Örn: Hizmetlerimiz"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">URL Slug</label>
                        <Input
                          value={newPage.slug}
                          onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                          placeholder="Otomatik oluşturulur"
                        />
                        <p className="text-xs text-muted-foreground">
                          Boş bırakılırsa başlıktan otomatik oluşturulur
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sayfa İçeriği *</label>
                      <Textarea
                        value={newPage.content}
                        onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                        placeholder="Sayfa içeriğini buraya yazın..."
                        rows={8}
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kısa Açıklama</label>
                      <Textarea
                        value={newPage.excerpt}
                        onChange={(e) => setNewPage({ ...newPage, excerpt: e.target.value })}
                        placeholder="Sayfa hakkında kısa açıklama (SEO için önemli)"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">SEO Başlığı</label>
                        <Input
                          value={newPage.metaTitle}
                          onChange={(e) => setNewPage({ ...newPage, metaTitle: e.target.value })}
                          placeholder="Google'da görünecek başlık"
                          maxLength={60}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">SEO Açıklaması</label>
                        <Input
                          value={newPage.metaDescription}
                          onChange={(e) => setNewPage({ ...newPage, metaDescription: e.target.value })}
                          placeholder="Google'da görünecek açıklama"
                          maxLength={160}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ana Görsel URL</label>
                      <Input
                        value={newPage.heroImage}
                        onChange={(e) => setNewPage({ ...newPage, heroImage: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sayfa Tipi</label>
                        <Select
                          value={newPage.pageType}
                          onValueChange={(v) => setNewPage({ ...newPage, pageType: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="page">Sayfa</SelectItem>
                            <SelectItem value="service">Hizmet</SelectItem>
                            <SelectItem value="blog">Blog</SelectItem>
                            <SelectItem value="legal">Yasal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Menü Sırası</label>
                        <Input
                          type="number"
                          value={newPage.menuOrder}
                          onChange={(e) => setNewPage({ ...newPage, menuOrder: parseInt(e.target.value) || 0 })}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Üst Sayfa</label>
                        <Select
                          value={newPage.parentSlug}
                          onValueChange={(v) => setNewPage({ ...newPage, parentSlug: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Üst sayfa seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Ana Sayfa</SelectItem>
                            {pages.filter(p => !p.parentSlug).map(page => (
                              <SelectItem key={page.slug} value={page.slug}>
                                {page.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="published"
                          checked={newPage.published}
                          onChange={(e) => setNewPage({ ...newPage, published: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                          Yayınla
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="showInMenu"
                          checked={newPage.showInMenu}
                          onChange={(e) => setNewPage({ ...newPage, showInMenu: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="showInMenu" className="text-sm font-medium cursor-pointer">
                          Menüde Göster
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddPage} className="flex-1" disabled={isLoading}>
                        {isLoading ? "Ekleniyor..." : "Sayfa Ekle"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddPage(false)} className="flex-1">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pages List */}
              <div className="space-y-3">
                {pages.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Henüz sayfa eklenmemiş</p>
                    <Button onClick={() => setShowAddPage(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Sayfayı Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pages.map((page) => (
                      <Card key={page.id} className={page.published ? "" : "border-dashed border-2"}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{page.title}</h3>
                                <Badge variant={page.published ? "default" : "secondary"}>
                                  {page.published ? "Yayında" : "Taslak"}
                                </Badge>
                                {page.showInMenu && (
                                  <Badge variant="outline">Menüde</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {page.pageType}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                /{page.slug}
                              </p>
                              
                              {page.excerpt && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {page.excerpt}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Oluşturulma: {new Date(page.createdAt).toLocaleDateString('tr-TR')}</span>
                                <span>Güncelleme: {new Date(page.updatedAt).toLocaleDateString('tr-TR')}</span>
                                {page.menuOrder > 0 && (
                                  <span>Sıra: {page.menuOrder}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingPage(page)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePage(page.slug)}
                                disabled={['home', 'hakkimda', 'iletisim', 'hizmetler'].includes(page.slug)}
                              >
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Page Tab */}
        <TabsContent value="about" className="space-y-4">
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
