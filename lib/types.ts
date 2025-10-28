// Type definitions for Petfendy platform

export interface User {
  id: string
  email: string
  name: string
  phone: string
  passwordHash: string
  role: "user" | "admin"
  emailVerified: boolean
  verificationCode?: string
  verificationCodeExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Pet {
  id: string
  userId: string
  name: string
  type: "dog" | "cat" | "bird" | "rabbit" | "other"
  breed: string
  age: number
  weight: number
  specialNeeds: string
}

export interface HotelRoom {
  id: string
  name: string
  type: "standard" | "deluxe" | "suite"
  capacity: number
  pricePerNight: number
  available: boolean
  amenities: string[]
}

// Booking represents both hotel and taxi reservations
export interface Booking {
  id: string
  userId: string | null // null for guest purchases
  roomId: string | null // null for taxi bookings
  petId: string | null
  startDate: Date | null
  endDate: Date | null
  totalPrice: number
  type: "hotel" | "taxi"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
  specialRequests?: string
}

export interface HotelReservation extends Booking {
  type: "hotel"
  roomId: string
  petId: string
  startDate: Date
  endDate: Date
  specialRequests: string
}

export interface TaxiService {
  id: string
  name: string
  description: string
  basePrice: number
  pricePerKm: number
  maxPetWeight: number
  capacity: number
  features: string[]
  available: boolean
}

// TaxiRequest from ERD - separate from TaxiBooking for better structure
export interface TaxiRequest {
  id: string
  userId: string | null // null for guest purchases
  fromCity: string
  toCity: string
  distanceKm: number
  kmPrice: number
  totalPrice: number
  date: Date
  isRoundTrip?: boolean
  createdAt: Date
}

export interface TaxiBooking extends Booking {
  type: "taxi"
  pickupLocation: string
  dropoffLocation: string
  distance: number
  scheduledDate: Date
  isRoundTrip?: boolean
}

// City-based pricing for taxi service
export interface CityPricing {
  id: string
  fromCity: string
  toCity: string
  additionalFee: number
  discount: number
  distanceKm: number
}

// Room pricing - for dynamic date-based pricing
export interface RoomPricing {
  id: string
  roomId: string
  date: Date
  pricePerNight: number
  available: boolean
}

export interface CartItem {
  id: string
  type: "hotel" | "taxi"
  itemId: string
  quantity: number
  price: number
  details: Record<string, any>
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
  status: "pending" | "paid" | "completed" | "cancelled"
  paymentMethod: "credit_card" | "bank_transfer" | "wallet"
  invoiceNumber: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  orderId: string
  invoiceNumber: string
  userId: string
  totalAmount: number
  taxAmount: number
  items: CartItem[]
  issueDate: Date
  dueDate: Date
  status: "draft" | "sent" | "paid" | "overdue"
}
