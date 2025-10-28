// Mock data for development
import type { User, HotelRoom, TaxiService, Pet, CityPricing, RoomPricing } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "Ahmet Yılmaz",
    phone: "+905551234567",
    passwordHash: "hashed_password_123",
    role: "user",
    emailVerified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "admin-1",
    email: "admin@petfendy.com",
    name: "Admin User",
    phone: "+905559876543",
    passwordHash: "hashed_admin_password",
    role: "admin",
    emailVerified: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockHotelRooms: HotelRoom[] = [
  {
    id: "room-1",
    name: "Standart Oda",
    type: "standard",
    capacity: 1,
    pricePerNight: 150,
    available: true,
    amenities: ["Yatak", "Su Kasesi", "Oyuncaklar"],
  },
  {
    id: "room-2",
    name: "Deluxe Oda",
    type: "deluxe",
    capacity: 2,
    pricePerNight: 250,
    available: true,
    amenities: ["Yatak", "Oyun Alanı", "Kamera Gözetimi", "Klima"],
  },
  {
    id: "room-3",
    name: "Suite Oda",
    type: "suite",
    capacity: 3,
    pricePerNight: 400,
    available: true,
    amenities: ["Geniş Yatak", "Özel Oyun Alanı", "24/7 Kamera", "Klima", "Isıtma"],
  },
]

export const mockTaxiServices: TaxiService[] = [
  {
    id: "taxi-1",
    name: "Pet Taxi",
    description: "Güvenli ve ekonomik evcil hayvan taşıma servisi",
    basePrice: 50,
    pricePerKm: 15,
    maxPetWeight: 10,
    capacity: 2,
    features: ["Güvenli taşıma", "Klima", "Temizlik", "Deneyimli şoför"],
    available: true,
  },
  {
    id: "taxi-2",
    name: "Luxury Pet Transport",
    description: "Premium araçlarla lüks evcil hayvan taşıma hizmeti",
    basePrice: 75,
    pricePerKm: 25,
    maxPetWeight: 20,
    capacity: 4,
    features: ["Premium araç", "Veteriner refakat", "GPS takip", "Özel bakım"],
    available: true,
  },
  {
    id: "taxi-3",
    name: "Express Pet Service",
    description: "Hızlı ve acil durum evcil hayvan taşıma servisi",
    basePrice: 100,
    pricePerKm: 20,
    maxPetWeight: 30,
    capacity: 1,
    features: ["Hızlı servis", "Özel bakım", "Acil durum desteği", "7/24 hizmet"],
    available: true,
  },
]

export const mockPets: Pet[] = [
  {
    id: "pet-1",
    userId: "1",
    name: "Boncuk",
    type: "dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 25,
    specialNeeds: "Hiçbiri",
  },
  {
    id: "pet-2",
    userId: "1",
    name: "Misi",
    type: "cat",
    breed: "Siamese",
    age: 2,
    weight: 4,
    specialNeeds: "Diyetli mama",
  },
]

// City-based pricing for taxi service
export const mockCityPricings: CityPricing[] = [
  {
    id: "city-1",
    fromCity: "İstanbul",
    toCity: "Ankara",
    additionalFee: 100,
    discount: 0,
    distanceKm: 450,
  },
  {
    id: "city-2",
    fromCity: "İstanbul",
    toCity: "İzmir",
    additionalFee: 150,
    discount: 10,
    distanceKm: 470,
  },
  {
    id: "city-3",
    fromCity: "Ankara",
    toCity: "İzmir",
    additionalFee: 80,
    discount: 0,
    distanceKm: 590,
  },
]

// Room pricing for dynamic date-based pricing
export const mockRoomPricings: RoomPricing[] = [
  {
    id: "price-1",
    roomId: "room-1",
    date: new Date("2025-12-31"),
    pricePerNight: 250,
    available: true,
  },
  {
    id: "price-2",
    roomId: "room-2",
    date: new Date("2025-12-31"),
    pricePerNight: 400,
    available: true,
  },
]

// Turkish cities for taxi service
export const mockTurkishCities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Şanlıurfa",
  "Kocaeli",
  "Mersin",
  "Diyarbakır",
  "Hatay",
  "Manisa",
  "Kayseri",
]
