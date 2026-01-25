import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent, optionalAuth } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'

// Room type mapping
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE'] as const

// Room validation schema
const roomUpdateSchema = {
  name: { type: 'string', minLength: 2, maxLength: 100 },
  type: { type: 'string' },
  capacity: { type: 'number', min: 1, max: 10 },
  pricePerNight: { type: 'number', min: 0, max: 10000 },
  available: { type: 'boolean' },
  description: { type: 'string', maxLength: 1000 },
  amenities: { type: 'array' },
  features: { type: 'array' },
  images: { type: 'array' },
  videos: { type: 'array' }
}

// GET - Tek oda getir (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz oda ID' }, { status: 400 })
    }

    // Try database
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      const room = await prisma.hotelRoom.findUnique({
        where: { id },
        include: {
          amenities: true,
          features: true,
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
        }
      })

      if (!room) {
        return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
      }

      // Transform to frontend format
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

      return NextResponse.json(transformedRoom)
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
    }

  } catch (error) {
    console.error('Get room error:', error)
    return NextResponse.json({ error: 'Oda yüklenirken hata oluştu' }, { status: 500 })
  }
}

// PUT - Oda güncelle (Admin only)
export const PUT = requireAdmin(async (
  request: NextRequest, 
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz oda ID' }, { status: 400 })
    }

    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, roomUpdateSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_ROOM_UPDATE_DATA',
        userId: user.userId,
        details: { roomId: id, errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz veri', 
        details: validation.errors 
      }, { status: 400 })
    }

    const updateData = validation.data!

    // Validate room type if provided
    if (updateData.type) {
      const roomType = updateData.type.toUpperCase()
      if (!ROOM_TYPES.includes(roomType as any)) {
        return NextResponse.json({ error: 'Geçersiz oda tipi' }, { status: 400 })
      }
      updateData.type = roomType
    }

    // Sanitize string fields
    if (updateData.name) {
      updateData.name = sanitizeInput(updateData.name)
    }
    if (updateData.description) {
      updateData.description = sanitizeInput(updateData.description)
    }

    // Validate and sanitize arrays
    if (updateData.amenities) {
      updateData.amenities = Array.isArray(updateData.amenities) 
        ? updateData.amenities.filter(a => typeof a === 'string' && a.trim()).map(a => sanitizeInput(a))
        : []
    }
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features.filter(f => typeof f === 'string' && f.trim()).map(f => sanitizeInput(f))
        : []
    }

    // Try database
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      // Check if room exists
      const existingRoom = await prisma.hotelRoom.findUnique({
        where: { id },
        include: {
          amenities: true,
          features: true,
          images: true,
          videos: true,
        }
      })

      if (!existingRoom) {
        return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== existingRoom.name) {
        const duplicateRoom = await prisma.hotelRoom.findFirst({
          where: { 
            name: updateData.name,
            id: { not: id }
          }
        })
        
        if (duplicateRoom) {
          return NextResponse.json({ error: 'Bu isimde bir oda zaten mevcut' }, { status: 409 })
        }
      }

      // Prepare update data
      const dbUpdateData: any = {}
      
      // Basic fields
      if (updateData.name !== undefined) dbUpdateData.name = updateData.name
      if (updateData.type !== undefined) dbUpdateData.type = updateData.type
      if (updateData.capacity !== undefined) dbUpdateData.capacity = Math.floor(updateData.capacity)
      if (updateData.pricePerNight !== undefined) dbUpdateData.pricePerNight = Math.round(updateData.pricePerNight * 100) / 100
      if (updateData.available !== undefined) dbUpdateData.available = updateData.available
      if (updateData.description !== undefined) dbUpdateData.description = updateData.description

      // Handle amenities update
      if (updateData.amenities !== undefined) {
        dbUpdateData.amenities = {
          deleteMany: {},
          create: updateData.amenities.map((name: string) => ({ name }))
        }
      }

      // Handle features update
      if (updateData.features !== undefined) {
        dbUpdateData.features = {
          deleteMany: {},
          create: updateData.features.map((name: string) => ({ name }))
        }
      }

      // Handle images update
      if (updateData.images !== undefined) {
        const validImages = Array.isArray(updateData.images) 
          ? updateData.images.filter(img => typeof img === 'string' && img.trim())
          : []
        
        dbUpdateData.images = {
          deleteMany: {},
          create: validImages.map((url: string, index: number) => ({ 
            url, 
            order: index 
          }))
        }
      }

      // Handle videos update
      if (updateData.videos !== undefined) {
        const validVideos = Array.isArray(updateData.videos)
          ? updateData.videos.filter(v => v && typeof v.url === 'string' && v.url.trim())
          : []
        
        dbUpdateData.videos = {
          deleteMany: {},
          create: validVideos.map((v: { type: string, url: string }, index: number) => ({
            type: v.type.toUpperCase() as any,
            url: v.url,
            order: index
          }))
        }
      }

      // Update room
      const updatedRoom = await prisma.hotelRoom.update({
        where: { id },
        data: dbUpdateData,
        include: {
          amenities: true,
          features: true,
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
        }
      })

      // Log successful update
      logSecurityEvent({
        type: 'ROOM_UPDATED',
        userId: user.userId,
        details: { 
          roomId: id, 
          roomName: updatedRoom.name,
          updatedFields: Object.keys(updateData)
        }
      })

      // Transform response
      const transformedRoom = {
        id: updatedRoom.id,
        name: updatedRoom.name,
        type: updatedRoom.type.toLowerCase(),
        capacity: updatedRoom.capacity,
        pricePerNight: updatedRoom.pricePerNight,
        available: updatedRoom.available,
        description: updatedRoom.description || '',
        amenities: updatedRoom.amenities.map((a: any) => a.name),
        features: updatedRoom.features.map((f: any) => f.name),
        images: updatedRoom.images.map((i: any) => i.url),
        videos: updatedRoom.videos.map((v: any) => ({ 
          type: v.type.toLowerCase() as 'upload' | 'youtube', 
          url: v.url 
        })),
      }

      return NextResponse.json(transformedRoom)
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      logSecurityEvent({
        type: 'DATABASE_ERROR',
        userId: user.userId,
        details: { error: dbError.message, operation: 'UPDATE_ROOM', roomId: id }
      })
      
      return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Update room error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `PUT /api/rooms/${params.id}` }
    })
    
    return NextResponse.json({ error: 'Oda güncellenirken hata oluştu' }, { status: 500 })
  }
})

// DELETE - Oda sil (Admin only)
export const DELETE = requireAdmin(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz oda ID' }, { status: 400 })
    }

    // Try database
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      // Check if room exists and has active bookings
      const room = await prisma.hotelRoom.findUnique({
        where: { id },
        include: {
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED'] },
              endDate: { gte: new Date() }
            }
          }
        }
      })

      if (!room) {
        return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
      }

      // Check for active bookings
      if (room.bookings.length > 0) {
        return NextResponse.json({ 
          error: 'Bu odanın aktif rezervasyonları var. Önce rezervasyonları iptal edin.' 
        }, { status: 409 })
      }

      // Delete room (cascade will handle related records)
      await prisma.hotelRoom.delete({
        where: { id }
      })

      // Log successful deletion
      logSecurityEvent({
        type: 'ROOM_DELETED',
        userId: user.userId,
        details: { roomId: id, roomName: room.name }
      })

      return NextResponse.json({ success: true, message: 'Oda başarıyla silindi' })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      logSecurityEvent({
        type: 'DATABASE_ERROR',
        userId: user.userId,
        details: { error: dbError.message, operation: 'DELETE_ROOM', roomId: id }
      })
      
      return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Delete room error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `DELETE /api/rooms/${params.id}` }
    })
    
    return NextResponse.json({ error: 'Oda silinirken hata oluştu' }, { status: 500 })
  }
})