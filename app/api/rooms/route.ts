import { NextRequest, NextResponse } from 'next/server'

// Room type mapping
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE'] as const

// GET - Tüm odaları getir
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

// POST - Yeni oda ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, capacity, pricePerNight, description, amenities, features, images, videos } = body

    // Validation
    if (!name || !type || !capacity || !pricePerNight) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    // Map type to enum
    const roomType = type.toUpperCase()
    if (!ROOM_TYPES.includes(roomType as any)) {
      return NextResponse.json({ error: 'Geçersiz oda tipi' }, { status: 400 })
    }

    // Try database
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      // Create room with relations
      const room = await prisma.hotelRoom.create({
        data: {
          name,
          type: roomType as any,
          capacity: parseInt(capacity),
          pricePerNight: parseFloat(pricePerNight),
          description: description || null,
          available: true,
          amenities: {
            create: (amenities || []).map((name: string) => ({ name }))
          },
          features: {
            create: (features || []).map((name: string) => ({ name }))
          },
          images: {
            create: (images || []).map((url: string, index: number) => ({ 
              url, 
              order: index 
            }))
          },
          videos: {
            create: (videos || []).map((v: { type: string, url: string }, index: number) => ({
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
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Veritabanı bağlantısı kurulamadı' }, { status: 500 })
    }

  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json({ error: 'Oda eklenirken hata oluştu' }, { status: 500 })
  }
}
