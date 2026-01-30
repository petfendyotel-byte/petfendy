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
  images: string[] // URLs of room images
  videos: Array<{ type: 'upload' | 'youtube', url: string }> // Video URLs (uploaded or YouTube)
  description: string // Detailed room description
  features: string[] // Additional features
}

export interface TaxiVehicle {
  id: string
  name: string
  type: "vip" | "shared" // VIP (özel) veya Paylaşımlı
  pricePerKm: number
  capacity: number // Kaç hayvan taşıyabilir
  isAvailable: boolean // Müsait mi?
  description?: string
  features?: string[]
  createdAt: Date
  updatedAt: Date
}

// Booking represents both hotel and taxi reservations
export interface Booking {
  id: string
  userId: string | null // null for guest purchases
  roomId: string | null // null for taxi bookings
  vehicleId?: string | null // for taxi bookings
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

// Hotel reservation data for checkout
export interface HotelReservationData {
  roomId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  petCount: number
  specialRequests: string
  additionalServices: Array<{
    id: string
    name: string
    price: number
    duration?: string
  }>
  basePrice: number
  servicesTotal: number
  totalPrice: number
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
  vehicleId?: string | null // selected taxi vehicle
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
  vehicleId?: string | null // selected taxi vehicle
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

export interface AboutPage {
  id: string
  title: string
  content: string
  image: string
  updatedAt: Date
}

export type PaymentProvider = "iyzico"

export interface PaymentGateway {
  id: string
  provider: PaymentProvider
  name: string
  isActive: boolean
  isDefault: boolean
  config: IyzicoConfig
  createdAt: Date
  updatedAt: Date
}

export interface IyzicoConfig {
  apiKey: string
  secretKey: string // Encrypted
  testMode: boolean
  currency: "TRY"
}

// CMS Page Management
export interface Page {
  id: string
  slug: string // 'about', 'services', 'blog', 'gallery', 'contact', 'faq'
  title: string
  subtitle?: string
  content: string // Rich HTML content
  heroImage?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // Rich HTML
  coverImage?: string
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface GalleryImage {
  id: string
  url: string
  title?: string
  description?: string
  category?: string
  uploadedAt: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  order: number
  published: boolean
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'read' | 'replied'
  createdAt: Date
}

// ==================== ÖDEME VE İŞLEM TİPLERİ ====================

export type PaymentProvider = "paytr" | "paratika" | "ziraat" | "payten"
export type TransactionStatus = "pending" | "processing" | "success" | "failed" | "refunded" | "partially_refunded" | "cancelled" | "chargeback"
export type PaymentType = "3d" | "non3d" | "preauth" | "capture" | "void"
export type Currency = "TRY" | "USD" | "EUR"

export interface Transaction {
  id: string
  orderId: string
  userId: string | null
  transactionId: string // POS'tan gelen transaction ID
  amount: number
  currency: Currency
  status: TransactionStatus
  paymentType: PaymentType
  paymentProvider: PaymentProvider
  cardToken?: string // Tokenize edilmiş kart
  maskedCard?: string // Son 4 hane gösterimi
  installmentCount?: number
  is3DSecure: boolean
  idempotencyKey: string
  metadata?: Record<string, any>
  errorCode?: string
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface RefundTransaction {
  id: string
  originalTransactionId: string
  refundTransactionId: string
  amount: number
  isPartial: boolean
  reason: string
  status: "pending" | "success" | "failed"
  createdAt: Date
  completedAt?: Date
}

export interface ChargebackTransaction {
  id: string
  transactionId: string
  chargebackId: string
  amount: number
  reason: string
  status: "received" | "under_review" | "won" | "lost" | "withdrawn"
  receivedAt: Date
  resolvedAt?: Date
  createdAt: Date
}

// ==================== POS YAPILANDIRMA ====================

export interface ZiraatPOSConfig {
  merchantId: string
  terminalId: string
  apiKey: string // Encrypted
  apiSecret: string // Encrypted
  testMode: boolean
  successUrl: string
  failUrl: string
  timeoutLimit: number // seconds
  maxInstallment: number
  currency: Currency
  enable3DSecure: boolean
  enableNon3DFallback: boolean
}

export interface PaytenPOSConfig {
  merchantId: string
  apiKey: string // Encrypted
  apiSecret: string // Encrypted
  testMode: boolean
  successUrl: string
  failUrl: string
  timeoutLimit: number
  maxInstallment: number
  currency: Currency
  enable3DSecure: boolean
  enableNon3DFallback: boolean
  tokenizationEnabled: boolean
}

export interface POSGateway {
  id: string
  provider: PaymentProvider
  name: string
  isActive: boolean
  isDefault: boolean
  priority: number // Failover için öncelik sırası
  config: ZiraatPOSConfig | PaytenPOSConfig | PayTRConfig | ParatikaConfig
  createdAt: Date
  updatedAt: Date
}

// ==================== TAKSİT VE ÖN PROVİZYON KURALLARI ====================

export interface InstallmentRule {
  id: string
  provider: PaymentProvider
  minAmount: number
  maxAmount: number
  allowedInstallments: number[]
  installmentRates: Record<number, number> // Taksit sayısı -> faiz oranı
  allowedBINs?: string[] // BIN listesi (opsiyonel)
  blockedBINs?: string[] // Engellenmiş BIN'ler
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PreauthConfig {
  enabled: boolean
  captureWindowDays: number // Kaç gün içinde capture edilmeli
  autoCapture: boolean
  autoCaptureDelayHours: number
}

// ==================== 3D SECURE VE RİSK YÖNETİMİ ====================

export interface RiskAssessment {
  score: number // 0-100, yüksek = riskli
  factors: RiskFactor[]
  recommendation: "allow" | "require_3d" | "block"
}

export interface RiskFactor {
  type: "amount" | "bin" | "device" | "velocity" | "country" | "card_history"
  severity: "low" | "medium" | "high"
  message: string
}

export interface Non3DFallbackRule {
  enabled: boolean
  maxAmount: number
  allowedBINs: string[]
  requireDeviceFingerprint: boolean
  requirePreviousSuccess: boolean
  velocityCheckWindowMinutes: number
  maxAttemptsPerWindow: number
}

// ==================== KART TOKENIZATION ====================

export interface CardToken {
  id: string
  userId: string
  token: string // Payten/POS'tan gelen token
  maskedCard: string
  cardType?: string // visa, mastercard vb.
  expiryMonth?: number
  expiryYear?: number
  cardHolder?: string
  isDefault: boolean
  createdAt: Date
  lastUsedAt?: Date
}

export interface CardTokenRequest {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cardHolder: string
  userId: string
  userConsent: boolean // Kullanıcı onayı
}

// ==================== IDEMPOTENCY ====================

export interface IdempotencyRecord {
  key: string
  requestHash: string
  response?: any
  status: "pending" | "completed" | "failed"
  expiresAt: Date
  createdAt: Date
}

// ==================== BİLDİRİMLER ====================

export type NotificationType = "payment_success" | "payment_failed" | "payment_refund" | "payment_chargeback" | "payment_preauth" | "payment_capture" | "payment_void" | "order_created" | "order_cancelled"
export type NotificationChannel = "email" | "sms" | "push" | "admin_panel"
export type NotificationStatus = "pending" | "sent" | "failed" | "delivered"

export interface Notification {
  id: string
  userId?: string
  type: NotificationType
  channel: NotificationChannel
  recipient: string // email, phone number, user ID
  subject?: string
  message: string
  status: NotificationStatus
  metadata?: Record<string, any>
  retryCount: number
  maxRetries: number
  sentAt?: Date
  deliveredAt?: Date
  failedAt?: Date
  errorMessage?: string
  createdAt: Date
}

export interface NotificationTemplate {
  id: string
  type: NotificationType
  channel: NotificationChannel
  language: "tr" | "en"
  subject?: string
  body: string
  variables: string[] // {{variableName}} formatında
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ==================== SMS SERVİSİ ====================

export interface SMSServiceConfig {
  provider: "twilio" | "turcell" | "sinch" | "netgsm" | "iletimerkezi"
  primaryApiKey: string // Encrypted
  primaryApiSecret: string // Encrypted
  primaryFromNumber: string
  fallbackProvider?: "twilio" | "turcell" | "sinch" | "netgsm" | "iletimerkezi"
  fallbackApiKey?: string // Encrypted
  fallbackApiSecret?: string // Encrypted
  fallbackFromNumber?: string
  enabled: boolean
}

export interface SMSMessage {
  id: string
  to: string
  message: string
  status: NotificationStatus
  provider: string
  messageId?: string
  sentAt?: Date
  deliveredAt?: Date
  errorMessage?: string
  createdAt: Date
}

// ==================== E-POSTA SERVİSİ ====================

export interface EmailServiceConfig {
  provider: "sendgrid" | "mailgun" | "resend" | "ses"
  primaryApiKey: string // Encrypted
  primaryFromEmail: string
  primaryFromName: string
  fallbackProvider?: "sendgrid" | "mailgun" | "resend" | "ses"
  fallbackApiKey?: string // Encrypted
  fallbackFromEmail?: string
  fallbackFromName?: string
  enabled: boolean
}

export interface EmailMessage {
  id: string
  to: string
  subject: string
  html: string
  text?: string
  status: NotificationStatus
  provider: string
  messageId?: string
  sentAt?: Date
  deliveredAt?: Date
  errorMessage?: string
  createdAt: Date
}

// ==================== ADMIN PANEL BİLDİRİMLERİ ====================

export interface AdminNotification {
  id: string
  type: NotificationType
  severity: "info" | "warning" | "error" | "success"
  title: string
  message: string
  metadata: Record<string, any>
  read: boolean
  readAt?: Date
  readBy?: string
  createdAt: Date
}

// ==================== AUDIT LOG ====================

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entityType: string
  entityId: string
  changes?: Record<string, { old: any; new: any }>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// ==================== RETRY VE FAILOVER ====================

export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: string[]
}

export interface FailoverConfig {
  enabled: boolean
  primaryProvider: PaymentProvider
  fallbackProviders: PaymentProvider[]
  failoverConditions: string[] // Hangi hatalarda failover yapılsın
}

// ==================== PII MASKELEME ====================

export interface MaskedData {
  original: string
  masked: string
  pattern: "card" | "tc" | "phone" | "email"
}

// ==================== ŞİFRE POLİTİKASI ====================

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventCommonPasswords: boolean
  preventRepeatedChars: boolean
  maxAgeDays?: number // Şifre değiştirme zorunluluğu
}

// ==================== MFA (Multi-Factor Authentication) ====================

export interface MFASettings {
  enabled: boolean
  requiredForAdmins: boolean
  requiredForHighRisk: boolean
  methods: ("sms" | "totp" | "email")[]
  backupCodes?: string[] // Hashed
}

export interface MFAVerification {
  userId: string
  method: "sms" | "totp" | "email"
  code: string
  expiresAt: Date
  verified: boolean
  createdAt: Date
}

// ==================== RATE LIMITING ====================

export interface RateLimitConfig {
  login: { maxAttempts: number; windowMs: number }
  mfaRequest: { maxAttempts: number; windowMs: number }
  paymentRequest: { maxAttempts: number; windowMs: number }
  passwordReset: { maxAttempts: number; windowMs: number }
  api: { maxAttempts: number; windowMs: number }
}
