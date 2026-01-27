/**
 * Rooms API Tests
 * 
 * Tests for /api/rooms endpoint
 * - GET: List rooms (public endpoint with optional auth)
 * - POST: Create new room (Admin only)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/rooms/route'

// Mock dependencies
vi.mock('@/lib/auth-middleware', () => ({
  requireAdmin: vi.fn((handler) => handler),
  optionalAuth: vi.fn(),
  validateInput: vi.fn(),
  sanitizeInputData: vi.fn((data) => data),
  logSecurityEvent: vi.fn()
}))

vi.mock('@/lib/security', () => ({
  sanitizeInput: vi.fn((input) => input)
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    hotelRoom: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn()
    }
  }
}))

describe('Rooms API', () => {
  const mockAdminUser = {
    userId: 'admin-123',
    email: 'admin@example.com',
    role: 'admin'
  }

  const mockRoomData = {
    name: 'Deluxe Pet Suite',
    type: 'DELUXE',
    capacity: 2,
    pricePerNight: 150.50,
    description: 'Spacious room with premium amenities',
    amenities: ['Air Conditioning', 'Pet Bed', 'Toys'],
    features: ['24/7 Monitoring', 'Play Area'],
    images: ['https://example.com/room1.jpg', 'https://example.com/room2.jpg'],
    videos: [
      { type: 'upload', url: 'https://example.com/room-tour.mp4' },
      { type: 'youtube', url: 'https://youtube.com/watch?v=abc123' }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/rooms', () => {
    const mockDbRooms = [
      {
        id: 'room-1',
        name: 'Standard Room',
        type: 'STANDARD',
        capacity: 1,
        pricePerNight: 100,
        available: true,
        description: 'Basic room for single pet',
        createdAt: new Date(),
        amenities: [{ name: 'Pet Bed' }, { name: 'Water Bowl' }],
        features: [{ name: 'Basic Care' }],
        images: [{ url: 'https://example.com/std1.jpg', order: 0 }],
        videos: [{ type: 'UPLOAD', url: 'https://example.com/std.mp4', order: 0 }]
      },
      {
        id: 'room-2',
        name: 'Deluxe Suite',
        type: 'DELUXE',
        capacity: 2,
        pricePerNight: 200,
        available: false,
        description: 'Premium room for multiple pets',
        createdAt: new Date(),
        amenities: [{ name: 'Premium Bed' }, { name: 'Toys' }],
        features: [{ name: '24/7 Care' }, { name: 'Play Area' }],
        images: [
          { url: 'https://example.com/dlx1.jpg', order: 0 },
          { url: 'https://example.com/dlx2.jpg', order: 1 }
        ],
        videos: [{ type: 'YOUTUBE', url: 'https://youtube.com/watch?v=xyz', order: 0 }]
      }
    ]

    it('should return all rooms when database is available', async () => {
      const prisma = (await import('@/lib/prisma')).default
      vi.mocked(prisma.hotelRoom.findMany).mockResolvedValue(mockDbRooms)

      const request = new NextRequest('http://localhost:3000/api/rooms')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      
      // Check data transformation
      expect(data[0]).toEqual({
        id: 'room-1',
        name: 'Standard Room',
        type: 'standard', // Lowercase transformation
        capacity: 1,
        pricePerNight: 100,
        available: true,
        description: 'Basic room for single pet',
        amenities: ['Pet Bed', 'Water Bowl'],
        features: ['Basic Care'],
        images: ['https://example.com/std1.jpg'],
        videos: [{ type: 'upload', url: 'https://example.com/std.mp4' }] // Lowercase transformation
      })

      expect(data[1]).toEqual({
        id: 'room-2',
        name: 'Deluxe Suite',
        type: 'deluxe',
        capacity: 2,
        pricePerNight: 200,
        available: false,
        description: 'Premium room for multiple pets',
        amenities: ['Premium Bed', 'Toys'],
        features: ['24/7 Care', 'Play Area'],
        images: ['https://example.com/dlx1.jpg', 'https://example.com/dlx2.jpg'],
        videos: [{ type: 'youtube', url: 'https://youtube.com/watch?v=xyz' }]
      })
    })

    it('should filter available rooms only', async () => {
      const prisma = (await import('@/lib/prisma')).default
      vi.mocked(prisma.hotelRoom.findMany).mockResolvedValue([mockDbRooms[0]]) // Only available room

      const request = new NextRequest('http://localhost:3000/api/rooms?available=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].available).toBe(true)

      expect(prisma.hotelRoom.findMany).toHaveBeenCalledWith({
        where: { available: true },
        include: {
          amenities: true,
          features: true,
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should return empty array when database is not available', async () => {
      const prisma = (await import('@/lib/prisma')).default
      vi.mocked(prisma.hotelRoom.findMany).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/rooms')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle general errors', async () => {
      // Mock a non-database error by throwing during import
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Create a request that will trigger the general catch block
      const request = new NextRequest('http://localhost:3000/api/rooms')
      
      // Mock the import to throw an error
      vi.doMock('@/lib/prisma', () => {
        throw new Error('Module import failed')
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Odalar yüklenirken hata oluştu')
      
      consoleSpy.mockRestore()
    })
  })

  describe('POST /api/rooms', () => {
    it('should create room successfully for admin', async () => {
      const { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      vi.mocked(sanitizeInputData).mockReturnValue(mockRoomData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: mockRoomData,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => input)
      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue(null) // No duplicate

      const createdRoom = {
        id: 'room-123',
        name: 'Deluxe Pet Suite',
        type: 'DELUXE',
        capacity: 2,
        pricePerNight: 150.50,
        available: true,
        description: 'Spacious room with premium amenities',
        amenities: [{ name: 'Air Conditioning' }, { name: 'Pet Bed' }, { name: 'Toys' }],
        features: [{ name: '24/7 Monitoring' }, { name: 'Play Area' }],
        images: [
          { url: 'https://example.com/room1.jpg', order: 0 },
          { url: 'https://example.com/room2.jpg', order: 1 }
        ],
        videos: [
          { type: 'UPLOAD', url: 'https://example.com/room-tour.mp4', order: 0 },
          { type: 'YOUTUBE', url: 'https://youtube.com/watch?v=abc123', order: 1 }
        ]
      }

      vi.mocked(prisma.hotelRoom.create).mockResolvedValue(createdRoom)

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(mockRoomData)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        id: 'room-123',
        name: 'Deluxe Pet Suite',
        type: 'deluxe', // Lowercase transformation
        capacity: 2,
        pricePerNight: 150.50,
        available: true,
        description: 'Spacious room with premium amenities',
        amenities: ['Air Conditioning', 'Pet Bed', 'Toys'],
        features: ['24/7 Monitoring', 'Play Area'],
        images: ['https://example.com/room1.jpg', 'https://example.com/room2.jpg'],
        videos: [
          { type: 'upload', url: 'https://example.com/room-tour.mp4' },
          { type: 'youtube', url: 'https://youtube.com/watch?v=abc123' }
        ]
      })

      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'ROOM_CREATED',
        userId: 'admin-123',
        details: { roomId: 'room-123', roomName: 'Deluxe Pet Suite' }
      })
    })

    it('should validate required fields', async () => {
      const { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      const invalidData = { name: '', type: '', capacity: 0 }
      vi.mocked(sanitizeInputData).mockReturnValue(invalidData)
      vi.mocked(validateInput).mockReturnValue({
        valid: false,
        data: null,
        errors: ['name is required', 'type is required', 'capacity must be at least 1']
      })

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz veri')
      expect(data.details).toEqual(['name is required', 'type is required', 'capacity must be at least 1'])
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'INVALID_ROOM_DATA',
        userId: 'admin-123',
        details: { errors: ['name is required', 'type is required', 'capacity must be at least 1'] }
      })
    })

    it('should validate room type', async () => {
      const { requireAdmin, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      const invalidData = { ...mockRoomData, type: 'INVALID_TYPE' }
      vi.mocked(sanitizeInputData).mockReturnValue(invalidData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: invalidData,
        errors: []
      })

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Geçersiz oda tipi')
    })

    it('should check for duplicate room names', async () => {
      const { requireAdmin, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      vi.mocked(sanitizeInputData).mockReturnValue(mockRoomData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: mockRoomData,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => input)
      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue({ id: 'existing-room' }) // Duplicate found

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(mockRoomData)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Bu isimde bir oda zaten mevcut')
    })

    it('should sanitize input data', async () => {
      const { requireAdmin, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      const dataWithXSS = {
        ...mockRoomData,
        name: '<script>alert("xss")</script>Deluxe Suite',
        description: '<img src=x onerror=alert(1)>Premium room',
        amenities: ['<b>Air Conditioning</b>', 'Pet Bed'],
        features: ['<i>24/7 Monitoring</i>']
      }

      vi.mocked(sanitizeInputData).mockReturnValue(dataWithXSS)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: dataWithXSS,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => 
        input.replace(/<[^>]*>/g, '') // Simple HTML tag removal
      )

      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.hotelRoom.create).mockResolvedValue({
        id: 'room-123',
        name: 'Deluxe Suite',
        type: 'DELUXE',
        capacity: 2,
        pricePerNight: 150.50,
        available: true,
        description: 'Premium room',
        amenities: [{ name: 'Air Conditioning' }, { name: 'Pet Bed' }],
        features: [{ name: '24/7 Monitoring' }],
        images: [],
        videos: []
      })

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(dataWithXSS)
      })

      const response = await POST(request, mockAdminUser)

      expect(response.status).toBe(201)
      expect(sanitizeInput).toHaveBeenCalledWith('<script>alert("xss")</script>Deluxe Suite')
      expect(sanitizeInput).toHaveBeenCalledWith('<img src=x onerror=alert(1)>Premium room')
      expect(sanitizeInput).toHaveBeenCalledWith('<b>Air Conditioning</b>')
      expect(sanitizeInput).toHaveBeenCalledWith('<i>24/7 Monitoring</i>')
    })

    it('should handle array validation', async () => {
      const { requireAdmin, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      const dataWithInvalidArrays = {
        ...mockRoomData,
        amenities: ['Valid Amenity', '', null, 123, 'Another Valid'], // Mixed types
        features: null, // Invalid array
        images: ['valid-url.jpg', '', 'another-valid.jpg'], // Empty strings
        videos: [
          { type: 'upload', url: 'valid.mp4' },
          { type: 'invalid', url: '' }, // Invalid video
          { url: 'missing-type.mp4' } // Missing type
        ]
      }

      vi.mocked(sanitizeInputData).mockReturnValue(dataWithInvalidArrays)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: dataWithInvalidArrays,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => input)
      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.hotelRoom.create).mockResolvedValue({
        id: 'room-123',
        name: 'Test Room',
        type: 'DELUXE',
        capacity: 2,
        pricePerNight: 150,
        available: true,
        description: 'Test',
        amenities: [{ name: 'Valid Amenity' }, { name: 'Another Valid' }],
        features: [],
        images: [
          { url: 'valid-url.jpg', order: 0 },
          { url: 'another-valid.jpg', order: 1 }
        ],
        videos: [{ type: 'UPLOAD', url: 'valid.mp4', order: 0 }]
      })

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(dataWithInvalidArrays)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(201)
      
      // Check that only valid items were included
      expect(data.amenities).toEqual(['Valid Amenity', 'Another Valid'])
      expect(data.features).toEqual([])
      expect(data.images).toEqual(['valid-url.jpg', 'another-valid.jpg'])
      expect(data.videos).toEqual([{ type: 'upload', url: 'valid.mp4' }])
    })

    it('should round price to 2 decimal places', async () => {
      const { requireAdmin, validateInput, sanitizeInputData } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      const dataWithPrecisePrice = { ...mockRoomData, pricePerNight: 150.999 }
      vi.mocked(sanitizeInputData).mockReturnValue(dataWithPrecisePrice)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: dataWithPrecisePrice,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => input)
      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(dataWithPrecisePrice)
      })

      await POST(request, mockAdminUser)

      expect(prisma.hotelRoom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pricePerNight: 151 // Rounded to 2 decimal places
          })
        })
      )
    })

    it('should handle database errors', async () => {
      const { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent } = await import('@/lib/auth-middleware')
      const { sanitizeInput } = await import('@/lib/security')
      const prisma = (await import('@/lib/prisma')).default

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      vi.mocked(sanitizeInputData).mockReturnValue(mockRoomData)
      vi.mocked(validateInput).mockReturnValue({
        valid: true,
        data: mockRoomData,
        errors: []
      })

      vi.mocked(sanitizeInput).mockImplementation((input) => input)
      vi.mocked(prisma.hotelRoom.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.hotelRoom.create).mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: JSON.stringify(mockRoomData)
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Veritabanı hatası')
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'DATABASE_ERROR',
        userId: 'admin-123',
        details: { error: 'Database connection failed', operation: 'CREATE_ROOM' }
      })
    })

    it('should handle general system errors', async () => {
      const { requireAdmin, logSecurityEvent } = await import('@/lib/auth-middleware')

      vi.mocked(requireAdmin).mockImplementation((handler) => 
        async (request: NextRequest) => handler(request, mockAdminUser)
      )

      // Mock JSON parsing error
      const request = new NextRequest('http://localhost:3000/api/rooms', {
        method: 'POST',
        body: 'invalid-json'
      })

      const response = await POST(request, mockAdminUser)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Oda eklenirken hata oluştu')
      expect(logSecurityEvent).toHaveBeenCalledWith({
        type: 'API_ERROR',
        userId: 'admin-123',
        details: expect.objectContaining({
          endpoint: 'POST /api/rooms'
        })
      })
    })
  })
})