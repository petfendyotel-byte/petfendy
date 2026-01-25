import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { checkHotelRoomConflict, checkTaxiVehicleConflict } from '@/lib/booking-service'
import { sanitizeInput } from '@/lib/security'

// Booking update validation schema
const bookingUpdateSchema = {
  status: { type: 'string' },
  startDate: { type: 'string' },
  endDate: { type: 'string' },
  specialRequests: { type: 'string', maxLength: 1000 },
  pickupLocation: { type: 'string', maxLength: 200 },
  dropoffLocation: { type: 'string', maxLength: 200 }
}

// GET - Get single booking
export const GET = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz rezervasyon ID' }, { status: 400 })
    }

    const prisma = (await import('@/lib/prisma')).default
    
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          select: { id: true, name: true, type: true, pricePerNight: true, images: true }
        },
        vehicle: {
          select: { id: true, name: true, type: true, pricePerKm: true }
        },
        pet: {
          select: { id: true, name: true, type: true, weight: true }
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        additionalServices: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
    }

    // Check permissions - users can only see their own bookings, admins can see all
    if (user.role !== 'admin' && booking.userId !== user.userId) {
      logSecurityEvent({
        type: 'UNAUTHORIZED_BOOKING_ACCESS',
        userId: user.userId,
        details: { bookingId: id, bookingOwner: booking.userId }
      })
      return NextResponse.json({ error: 'Bu rezervasyonu görme yetkiniz yok' }, { status: 403 })
    }

    return NextResponse.json(booking)

  } catch (error: any) {
    console.error('Get booking error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `GET /api/bookings/${params.id}` }
    })
    
    return NextResponse.json({ error: 'Rezervasyon yüklenirken hata oluştu' }, { status: 500 })
  }
})

// PUT - Update booking
export const PUT = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz rezervasyon ID' }, { status: 400 })
    }

    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, bookingUpdateSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_BOOKING_UPDATE_DATA',
        userId: user.userId,
        details: { bookingId: id, errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz güncelleme verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const updateData = validation.data!

    const prisma = (await import('@/lib/prisma')).default
    
    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        vehicle: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = user.role === 'admin' || 
                     existingBooking.userId === user.userId ||
                     (existingBooking.status === 'PENDING' && existingBooking.userId === user.userId)

    if (!canUpdate) {
      logSecurityEvent({
        type: 'UNAUTHORIZED_BOOKING_UPDATE',
        userId: user.userId,
        details: { bookingId: id, bookingOwner: existingBooking.userId }
      })
      return NextResponse.json({ error: 'Bu rezervasyonu güncelleme yetkiniz yok' }, { status: 403 })
    }

    // Validate status changes
    if (updateData.status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
      }

      // Business rules for status changes
      if (existingBooking.status === 'COMPLETED' && updateData.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Tamamlanmış rezervasyon durumu değiştirilemez' }, { status: 400 })
      }

      if (existingBooking.status === 'CANCELLED' && updateData.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'İptal edilmiş rezervasyon durumu değiştirilemez' }, { status: 400 })
      }

      // Only admins can confirm bookings
      if (updateData.status === 'CONFIRMED' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Rezervasyon onaylama yetkisi sadece yöneticilerde' }, { status: 403 })
      }
    }

    // Handle date changes
    let startDate: Date | undefined
    let endDate: Date | undefined

    if (updateData.startDate || updateData.endDate) {
      try {
        startDate = updateData.startDate ? new Date(updateData.startDate) : existingBooking.startDate!
        endDate = updateData.endDate ? new Date(updateData.endDate) : existingBooking.endDate!
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format')
        }

        if (endDate <= startDate) {
          return NextResponse.json({ error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' }, { status: 400 })
        }

        // Check for conflicts if dates are changing
        if (updateData.startDate || updateData.endDate) {
          if (existingBooking.type === 'HOTEL' && existingBooking.roomId) {
            const conflictCheck = await checkHotelRoomConflict(
              existingBooking.roomId,
              startDate,
              endDate,
              id // Exclude current booking from conflict check
            )
            
            if (conflictCheck.hasConflict) {
              return NextResponse.json({ 
                error: 'Yeni tarihler için oda müsait değil',
                conflicts: conflictCheck.conflictingBookings,
                alternatives: conflictCheck.availableAlternatives
              }, { status: 409 })
            }
          }

          if (existingBooking.type === 'TAXI' && existingBooking.vehicleId) {
            const conflictCheck = await checkTaxiVehicleConflict(
              existingBooking.vehicleId,
              startDate,
              endDate,
              id // Exclude current booking from conflict check
            )
            
            if (conflictCheck.hasConflict) {
              return NextResponse.json({ 
                error: 'Yeni tarihler için araç müsait değil',
                conflicts: conflictCheck.conflictingBookings,
                alternatives: conflictCheck.availableAlternatives
              }, { status: 409 })
            }
          }
        }
      } catch (dateError) {
        return NextResponse.json({ error: 'Geçersiz tarih formatı' }, { status: 400 })
      }
    }

    // Prepare update data
    const dbUpdateData: any = {}
    
    if (updateData.status !== undefined) dbUpdateData.status = updateData.status
    if (startDate !== undefined) dbUpdateData.startDate = startDate
    if (endDate !== undefined) dbUpdateData.endDate = endDate
    if (updateData.specialRequests !== undefined) {
      dbUpdateData.specialRequests = updateData.specialRequests ? sanitizeInput(updateData.specialRequests) : null
    }
    if (updateData.pickupLocation !== undefined) {
      dbUpdateData.pickupLocation = updateData.pickupLocation ? sanitizeInput(updateData.pickupLocation) : null
    }
    if (updateData.dropoffLocation !== undefined) {
      dbUpdateData.dropoffLocation = updateData.dropoffLocation ? sanitizeInput(updateData.dropoffLocation) : null
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: dbUpdateData,
      include: {
        room: {
          select: { id: true, name: true, type: true, pricePerNight: true }
        },
        vehicle: {
          select: { id: true, name: true, type: true, pricePerKm: true }
        },
        pet: {
          select: { id: true, name: true, type: true, weight: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        additionalServices: true
      }
    })

    // Log successful update
    logSecurityEvent({
      type: 'BOOKING_UPDATED',
      userId: user.userId,
      details: { 
        bookingId: id,
        updatedFields: Object.keys(updateData),
        newStatus: updateData.status,
        wasOwner: existingBooking.userId === user.userId
      }
    })

    return NextResponse.json(updatedBooking)

  } catch (error: any) {
    console.error('Update booking error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `PUT /api/bookings/${params.id}` }
    })
    
    return NextResponse.json({ error: 'Rezervasyon güncellenirken hata oluştu' }, { status: 500 })
  }
})

// DELETE - Cancel booking
export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'Geçersiz rezervasyon ID' }, { status: 400 })
    }

    const prisma = (await import('@/lib/prisma')).default
    
    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
    }

    // Check permissions
    const canCancel = user.role === 'admin' || existingBooking.userId === user.userId

    if (!canCancel) {
      logSecurityEvent({
        type: 'UNAUTHORIZED_BOOKING_CANCEL',
        userId: user.userId,
        details: { bookingId: id, bookingOwner: existingBooking.userId }
      })
      return NextResponse.json({ error: 'Bu rezervasyonu iptal etme yetkiniz yok' }, { status: 403 })
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Tamamlanmış rezervasyon iptal edilemez' }, { status: 400 })
    }

    if (existingBooking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Rezervasyon zaten iptal edilmiş' }, { status: 400 })
    }

    // Check cancellation policy (24 hours before start date)
    const now = new Date()
    const startDate = existingBooking.startDate
    const hoursUntilStart = startDate ? (startDate.getTime() - now.getTime()) / (1000 * 60 * 60) : 0

    if (hoursUntilStart < 24 && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Rezervasyon başlangıcına 24 saatten az kaldığında iptal edilemez' 
      }, { status: 400 })
    }

    // Cancel booking (soft delete - just change status)
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })

    // Log successful cancellation
    logSecurityEvent({
      type: 'BOOKING_CANCELLED',
      userId: user.userId,
      details: { 
        bookingId: id,
        bookingType: existingBooking.type,
        wasOwner: existingBooking.userId === user.userId,
        hoursUntilStart
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Rezervasyon iptal edildi',
      booking: cancelledBooking
    })

  } catch (error: any) {
    console.error('Cancel booking error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `DELETE /api/bookings/${params.id}` }
    })
    
    return NextResponse.json({ error: 'Rezervasyon iptal edilirken hata oluştu' }, { status: 500 })
  }
})