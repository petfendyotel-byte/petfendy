import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent, optionalAuth } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'

// Room type mapping
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE'] as const

// Room validation schema
const roomSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  type: { required: true, type: 'string' },
  capacity: { required: true, type: 'number', min: 1, max: 10 },
  pricePerNight: { required: true, type: 'number', min: 0, max: 10000 },
  description: { type: 'string', maxLength: 1000 },
  amenities: { type: 'array' },
  features: { type: 'array' },
  images: { type: 'array' },
  videos: { type: 'array' }
}

// GET - Tüm odaları getir (public endpoint with optional auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const availableOnly = searchParams.get('available') === 'true'

    // Try database first
    try {
      const prisma = (await import('@/lib/prisma')).default
      const rooms = await prisma.hotelRoom.findMany({
        where: availableOnly ? { available: true } : undefined,
        include: {
          amenities: true,
          features: true,
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' }
      })

      // Transform to frontend format
      const transformedRooms = rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        type: room.type.toLowerCase(),
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        available: room.available,
        description: room.description || '',
        amenities: room.amenities.map((a: any) => a.name),
        features: room.features.map((f: any) => f.name),
        images: room.images.map((i: any) => i.url),
        videos: room.videos.map((v: any) => ({ 
          type: v.type.toLowerCase() as 'upload' | 'youtube', 
          url: v.url 
        })),
      }))

      return NextResponse.json(transformedRooms)
    } catch (dbError) {
      console.warn('Database not available, returning empty array:', dbError)
      // Return empty array if database is not available
      return NextResponse.json([])
    }

  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json({ error: 'Odalar yüklenirken hata oluştu' }, { status: 500 })
  }
}

// POST - Yeni oda ekle (Admin only)
export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, roomSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_ROOM_DATA',
        userId: user.userId,
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz veri', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { name, type, capacity, pricePerNight, description, amenities, features, images, videos } = validation.data!

    // Additional validation
    const roomType = type.toUpperCase()
    if (!ROOM_TYPES.includes(roomType as any)) {
      return NextResponse.json({ error: 'Geçersiz oda tipi' }, { status: 400 })
    }

    // Sanitize string fields
    const sanitizedName = sanitizeInput(name)
    const sanitizedDescription = description ? sanitizeInput(description) : null

    // Validate arrays
    const validAmenities = Array.isArray(amenities) ? amenities.filter(a => typeof a === 'string' && a.trim()).map(a => sanitizeInput(a)) : []
    const validFeatures = Array.isArray(features) ? features.filter(f => typeof f === 'string' && f.trim()).map(f => sanitizeInput(f)) : []
    const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.trim()) : []
    const validVideos = Array.isArray(videos) ? videos.filter(v => v && typeof v.url === 'string' && v.url.trim()) : []

    // Try database
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      // Check for duplicate room names
      const existingRoom = await prisma.hotelRoom.findFirst({
        where: { name: sanitizedName }
      })
      
      if (existingRoom) {
        return NextResponse.json({ error: 'Bu isimde bir oda zaten mevcut' }, { status: 409 })
      }
      
      // Create room with relations
      const room = await prisma.hotelRoom.create({
        data: {
          name: sanitizedName,
          type: roomType as any,
          capacity: Math.floor(capacity),
          pricePerNight: Math.round(pricePerNight * 100) / 100, // Round to 2 decimal places
          description: sanitizedDescription,
          available: true,
          amenities: {
            create: validAmenities.map((name: string) => ({ name }))
          },
          features: {
            create: validFeatures.map((name: string) => ({ name }))
          },
          images: {
            create: validImages.map((url: string, index: number) => ({ 
              url, 
              order: index 
            }))
          },
          videos: {
            create: validVideos.map((v: { type: string, url: string }, index: number) => ({
              type: v.type.toUpperCase() as any,
              url: v.url,
              order: index
            }))
          }
        },
        include: {
          amenities: true,
          features: true,
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
        }
      })

      // Log successful creation
      logSecurityEvent({
        type: 'ROOM_CREATED',
        userId: user.userId,
        details: { roomId: room.id, roomName: room.name }
      })

      // Transform response
      const transformedRoom = {
        id: room.id,
        name: room.name,
        type: room.type.toLowerCase(),
        capacity: room.capacity,
        pricePerNight: room.pricePerNight,
        available: room.available,
        description: room.description || '',
        amenities: room.amenities.map((a: any) => a.name),
        features: room.features.map((f: any) => f.name),
        images: room.images.map((i: any) => i.url),
        videos: room.videos.map((v: any) => ({ 
          type: v.type.toLowerCase() as 'upload' | 'youtube', 
          url: v.url 
        })),
      }

      return NextResponse.json(transformedRoom, { status: 201 })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      logSecurityEvent({
        type: 'DATABASE_ERROR',
        userId: user.userId,
        details: { error: dbError.message, operation: 'CREATE_ROOM' }
      })
      
      return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Create room error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: 'POST /api/rooms' }
    })
    
    return NextResponse.json({ error: 'Oda eklenirken hata oluştu' }, { status: 500 })
  }
})
