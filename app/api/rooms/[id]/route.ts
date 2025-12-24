import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Room type mapping
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE'] as const

// GET - Tek oda getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

  } catch (error) {
    console.error('Get room error:', error)
    return NextResponse.json({ error: 'Oda yüklenirken hata oluştu' }, { status: 500 })
  }
}

// PUT - Oda güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, capacity, pricePerNight, available, description, amenities, features, images, videos } = body

    // Check if room exists
    const existingRoom = await prisma.hotelRoom.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
    }

    // Map type to enum
    const roomType = type?.toUpperCase()
    if (type && !ROOM_TYPES.includes(roomType as any)) {
      return NextResponse.json({ error: 'Geçersiz oda tipi' }, { status: 400 })
    }

    // Update room - delete old relations and create new ones
    await prisma.$transaction(async (tx: any) => {
      // Delete old relations
      await tx.roomAmenity.deleteMany({ where: { roomId: id } })
      await tx.roomFeature.deleteMany({ where: { roomId: id } })
      await tx.roomImage.deleteMany({ where: { roomId: id } })
      await tx.roomVideo.deleteMany({ where: { roomId: id } })

      // Update room
      await tx.hotelRoom.update({
        where: { id },
        data: {
          name: name ?? existingRoom.name,
          type: roomType ? (roomType as any) : existingRoom.type,
          capacity: capacity ? parseInt(capacity) : existingRoom.capacity,
          pricePerNight: pricePerNight ? parseFloat(pricePerNight) : existingRoom.pricePerNight,
          available: available ?? existingRoom.available,
          description: description ?? existingRoom.description,
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
        }
      })
    })

    // Fetch updated room
    const updatedRoom = await prisma.hotelRoom.findUnique({
      where: { id },
      include: {
        amenities: true,
        features: true,
        images: { orderBy: { order: 'asc' } },
        videos: { orderBy: { order: 'asc' } },
      }
    })

    const transformedRoom = {
      id: updatedRoom!.id,
      name: updatedRoom!.name,
      type: updatedRoom!.type.toLowerCase(),
      capacity: updatedRoom!.capacity,
      pricePerNight: updatedRoom!.pricePerNight,
      available: updatedRoom!.available,
      description: updatedRoom!.description || '',
      amenities: updatedRoom!.amenities.map((a: any) => a.name),
      features: updatedRoom!.features.map((f: any) => f.name),
      images: updatedRoom!.images.map((i: any) => i.url),
      videos: updatedRoom!.videos.map((v: any) => ({ 
        type: v.type.toLowerCase() as 'upload' | 'youtube', 
        url: v.url 
      })),
    }

    return NextResponse.json(transformedRoom)

  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json({ error: 'Oda güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE - Oda sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if room exists
    const existingRoom = await prisma.hotelRoom.findUnique({ where: { id } })
    if (!existingRoom) {
      return NextResponse.json({ error: 'Oda bulunamadı' }, { status: 404 })
    }

    // Delete room (cascade will delete relations)
    await prisma.hotelRoom.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Oda silindi' })

  } catch (error) {
    console.error('Delete room error:', error)
    return NextResponse.json({ error: 'Oda silinirken hata oluştu' }, { status: 500 })
  }
}
