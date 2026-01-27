/**
 * Booking API Tests
 * 
 * Tests for /api/bookings endpoint
 * - GET: List bookings with authentication and filtering
 * - POST: Create new bookings (authenticated and guest)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/bookings/route'

// Mock dependencies
vi.mock('@/lib/auth-middleware', () => ({
  requireAuth: vi.fn((handler) => handler),
  optionalAuth: vi.fn(),
  validateInput: vi.fn(),
  sanitizeInputData: vi.fn((data) => data),
  logSecurityEvent: vi.fn()
}))

vi.mock('@/lib/booking-service', () => ({
  createBookingWithValidation: vi.fn(),
  validateBooking: vi.fn()
}))

vi.mock('@/lib/security', () => ({
  sanitizeInput: vi.fn((input) => input)
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    booking: {
      count: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

describe('Bookings API', () => {
  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user'
  }

  const mockAdminUser = {
    userId: 'admin-123',
    email: 'admin@example.com',
    role: 'admin'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/bookings', () => {
    it('should return user bookings for regular user', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      // Mock auth to return user
      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      // Mock database responses
      vi.mocked(prisma.booking.count).mockResolvedValue(2)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([
        {
          id: 'booking-1',
          type: 'HOTEL',
          status: 'CONFIRMED',
          userId: 'user-123',
          createdAt: new Date(),
          room: { id: 'room-1', name: 'Standard Room', type: 'STANDARD', pricePerNight: 100 },
          vehicle: null,
          pet: { id: 'pet-1', name: 'Buddy', type: 'DOG', weight: 15 },
          user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
          additionalServices: []
        },
        {
          id: 'booking-2',
          type: 'TAXI',
          status: 'PENDING',
          userId: 'user-123',
          createdAt: new Date(),
          room: null,
          vehicle: { id: 'vehicle-1', name: 'Pet Taxi', type: 'STANDARD', pricePerKm: 5 },
          pet: { id: 'pet-1', name: 'Buddy', type: 'DOG', weight: 15 },
          user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
          additionalServices: []
        }
      ])

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request, mockUser)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.bookings).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        totalCount: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      })

      // Verify user filter was applied
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123'
          })
        })
      )
    })

    it('should return all bookings for admin user', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      vi.mocked(prisma.booking.count).mockResolvedValue(5)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request, mockAdminUser)

      expect(response.status).toBe(200)
      
      // Verify no user filter for admin
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            userId: expect.anything()
          })
        })
      )
    })

    it('should filter bookings by status', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      vi.mocked(prisma.booking.count).mockResolvedValue(1)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/bookings?status=CONFIRMED')
      const response = await GET(request, mockUser)

      expect(response.status).toBe(200)
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CONFIRMED',
            userId: 'user-123'
          })
        })
      )
    })

    it('should filter bookings by type', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      vi.mocked(prisma.booking.count).mockResolvedValue(1)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/bookings?type=HOTEL')
      const response = await GET(request, mockUser)

      expect(response.status).toBe(200)
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'HOTEL',
            userId: 'user-123'
          })
        })
      )
    })

    it('should handle pagination correctly', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      vi.mocked(prisma.booking.count).mockResolvedValue(25)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/bookings?page=2&limit=10')
      const response = await GET(request, mockUser)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        totalCount: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      })

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * limit
          take: 10
        })
      )
    })

    it('should limit maximum items per page', async () => {
      const { requireAuth } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      vi.mocked(prisma.booking.count).mockResolvedValue(200)
      vi.mocked(prisma.booking.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/bookings?limit=500')
      const response = await GET(request, mockUser)

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100 // Max limit enforced
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      const { requireAuth, logSecurityEvent } = await import('@/lib/auth-middleware')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAuth).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockUser)
      )

      vi.mocked(prisma.booking.count).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request, mockUser)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Rezervasyonlar yüklenirken hata oluştu')
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'API_ERROR',
        userId: 'user-123',
        details: { error: 'Database connection failed', endpoint: 'GET /api/bookings' }
      })
    })
  })

  describe('POST /api/bookings', () => {
    const validBookingData = {
      type: 'HOTEL',
      roomId: 'room-123',
      startDate: '2025-02-01T10:00:00Z',
      endDate: '2025-02-05T10:00:00Z',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '+905551234567',
      specialRequests: 'Extra blanket for pet'
    }

    it('should create booking for authenticated user', async () => {
      const { optionalAuth, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(validBookingData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: validBookingData,
        errors: []
      })

      const mockBooking = {
        id: 'booking-123',
        type: 'HOTEL',
        totalPrice: 400,
        status: 'PENDING'
      }

      vi.mocked(createBookingWithValidation).mockResolvedValue({
        success: true,
        booking: mockBooking,
        warnings: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.booking).toEqual(mockBooking)
      expect(createBookingWithValidation).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validBookingData,
          userId: 'user-123',
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        })
      )
    })

    it('should create booking for guest user', async () => {
      const { optionalAuth, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      vi.mocked(optionalAuth).mockResolvedValue(null) // No authenticated user
      vi.mocked(sanitizeInputData).mockReturnValue(validBookingData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: validBookingData,
        errors: []
      })

      const mockBooking = {
        id: 'booking-123',
        type: 'HOTEL',
        totalPrice: 400,
        status: 'PENDING'
      }

      vi.mocked(createBookingWithValidation).mockResolvedValue({
        success: true,
        booking: mockBooking,
        warnings: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(createBookingWithValidation).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validBookingData,
          userId: undefined, // Guest booking
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        })
      )
    })

    it('should validate required fields', async () => {
      const { optionalAuth, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue({})
      vi.mocked(validateInput).mockReturnValue({
        valid: false,
        data: null,
        errors: ['type is required', 'startDate is required', 'endDate is required']
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz rezervasyon verisi')
      expect(data.details).toEqual(['type is required', 'startDate is required', 'endDate is required'])
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'INVALID_BOOKING_DATA',
        userId: 'user-123',
        details: { errors: ['type is required', 'startDate is required', 'endDate is required'] }
      })
    })

    it('should validate booking type', async () => {
      const { optionalAuth, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')

      const invalidData = { ...validBookingData, type: 'INVALID_TYPE' }
      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(invalidData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: invalidData,
        errors: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz rezervasyon tipi')
    })

    it('should validate date format', async () => {
      const { optionalAuth, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')

      const invalidData = { ...validBookingData, startDate: 'invalid-date' }
      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(invalidData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: invalidData,
        errors: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz tarih formatı')
    })

    it('should handle booking validation failure', async () => {
      const { optionalAuth, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(validBookingData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: validBookingData,
        errors: []
      })

      vi.mocked(createBookingWithValidation).mockResolvedValue({
        success: false,
        booking: null,
        errors: ['Room not available for selected dates'],
        warnings: ['Peak season rates apply']
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Rezervasyon oluşturulamadı')
      expect(data.details).toEqual(['Room not available for selected dates'])
      expect(data.warnings).toEqual(['Peak season rates apply'])
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'BOOKING_VALIDATION_FAILED',
        userId: 'user-123',
        details: { errors: ['Room not available for selected dates'], bookingType: 'HOTEL' }
      })
    })

    it('should sanitize input data', async () => {
      const { optionalAuth, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      const dataWithXSS = {
        ...validBookingData,
        guestName: '<script>alert("xss")</script>John Doe',
        specialRequests: '<img src=x onerror=alert(1)>Extra blanket'
      }

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(dataWithXSS)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: dataWithXSS,
        errors: []
      })

      // Mock sanitizeInput to actually remove XSS
      vi.mocked(sanitizeInput).mockImplementation((input) => {
        if (input === '<script>alert("xss")</script>John Doe') return 'John Doe'
        if (input === '<img src=x onerror=alert(1)>Extra blanket') return 'Extra blanket'
        return input.replace(/<[^>]*>/g, '') // Simple HTML tag removal
      })

      vi.mocked(createBookingWithValidation).mockResolvedValue({
        success: true,
        booking: { id: 'booking-123', type: 'HOTEL', totalPrice: 400, status: 'PENDING' },
        warnings: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(dataWithXSS)
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(sanitizeInput).toHaveBeenCalledWith('<script>alert("xss")</script>John Doe')
      expect(sanitizeInput).toHaveBeenCalledWith('<img src=x onerror=alert(1)>Extra blanket')
      expect(createBookingWithValidation).toHaveBeenCalledWith(
        expect.objectContaining({
          guestName: 'John Doe', // XSS removed
          specialRequests: 'Extra blanket' // XSS removed
        })
      )
    })

    it('should handle system errors gracefully', async () => {
      const { optionalAuth, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(validBookingData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: validBookingData,
        errors: []
      })

      vi.mocked(createBookingWithValidation).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Rezervasyon oluşturulurken hata oluştu')
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'API_ERROR',
        userId: 'user-123',
        details: { error: 'Database connection failed', endpoint: 'POST /api/bookings' }
      })
    })

    it('should log successful booking creation', async () => {
      const { optionalAuth, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')
      const { createBookingWithValidation } = await import('@/lib/booking-service')

      vi.mocked(optionalAuth).mockResolvedValue(mockUser)
      vi.mocked(sanitizeInputData).mockReturnValue(validBookingData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: validBookingData,
        errors: []
      })

      const mockBooking = {
        id: 'booking-123',
        type: 'HOTEL',
        totalPrice: 400,
        status: 'PENDING'
      }

      vi.mocked(createBookingWithValidation).mockResolvedValue({
        success: true,
        booking: mockBooking,
        warnings: []
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'BOOKING_CREATED',
        userId: 'user-123',
        details: {
          bookingId: 'booking-123',
          bookingType: 'HOTEL',
          isGuest: false,
          totalPrice: 400
        }
      })
    })
  })
})