import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, optionalAuth, validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { createBookingWithValidation, validateBooking } from '@/lib/booking-service'
import { sanitizeInput } from '@/lib/security'
import { smsService } from '@/lib/sms-service'

// Booking validation schema
const bookingSchema = {
  type: { required: true, type: 'string' },
  roomId: { type: 'string' },
  vehicleId: { type: 'string' },
  petId: { type: 'string' },
  startDate: { required: true, type: 'string' },
  endDate: { required: true, type: 'string' },
  guestName: { type: 'string', minLength: 2, maxLength: 100 },
  guestEmail: { type: 'email' },
  guestPhone: { type: 'string', minLength: 10, maxLength: 20 },
  specialRequests: { type: 'string', maxLength: 1000 },
  pickupLocation: { type: 'string', maxLength: 200 },
  dropoffLocation: { type: 'string', maxLength: 200 },
  distance: { type: 'number', min: 0, max: 2000 },
  isRoundTrip: { type: 'boolean' }
}

// GET - List bookings (authenticated users see their own, admins see all)
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items per page

    const prisma = (await import('@/lib/prisma')).default

    // Build where clause
    const where: any = {}
    
    // Non-admin users can only see their own bookings
    if (user.role !== 'admin') {
      where.userId = user.userId
    }

    if (status && ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      where.status = status
    }

    if (type && ['HOTEL', 'TAXI'].includes(type)) {
      where.type = type
    }

    // Get total count for pagination
    const totalCount = await prisma.booking.count({ where })

    // Get bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error: any) {
    console.error('Get bookings error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: 'GET /api/bookings' }
    })
    
    return NextResponse.json({ error: 'Rezervasyonlar yüklenirken hata oluştu' }, { status: 500 })
  }
})

// POST - Create new booking (authenticated or guest)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (optional)
    const user = await optionalAuth(request)
    
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, bookingSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_BOOKING_DATA',
        userId: user?.userId,
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz rezervasyon verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const bookingData = validation.data!

    // Parse dates
    let startDate: Date
    let endDate: Date
    
    try {
      startDate = new Date(bookingData.startDate)
      endDate = new Date(bookingData.endDate)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format')
      }
    } catch (dateError) {
      return NextResponse.json({ 
        error: 'Geçersiz tarih formatı' 
      }, { status: 400 })
    }

    // Validate booking type
    if (!['HOTEL', 'TAXI'].includes(bookingData.type)) {
      return NextResponse.json({ 
        error: 'Geçersiz rezervasyon tipi' 
      }, { status: 400 })
    }

    // Sanitize string fields
    const sanitizedBookingData = {
      ...bookingData,
      type: bookingData.type as 'HOTEL' | 'TAXI',
      startDate,
      endDate,
      userId: user?.userId,
      guestName: bookingData.guestName ? sanitizeInput(bookingData.guestName) : undefined,
      guestEmail: bookingData.guestEmail ? sanitizeInput(bookingData.guestEmail) : undefined,
      guestPhone: bookingData.guestPhone ? sanitizeInput(bookingData.guestPhone) : undefined,
      specialRequests: bookingData.specialRequests ? sanitizeInput(bookingData.specialRequests) : undefined,
      pickupLocation: bookingData.pickupLocation ? sanitizeInput(bookingData.pickupLocation) : undefined,
      dropoffLocation: bookingData.dropoffLocation ? sanitizeInput(bookingData.dropoffLocation) : undefined,
    }

    // Create booking with validation
    const result = await createBookingWithValidation(sanitizedBookingData)

    if (!result.success) {
      logSecurityEvent({
        type: 'BOOKING_VALIDATION_FAILED',
        userId: user?.userId,
        details: { errors: result.errors, bookingType: bookingData.type }
      })
      
      return NextResponse.json({ 
        error: 'Rezervasyon oluşturulamadı',
        details: result.errors,
        warnings: result.warnings
      }, { status: 400 })
    }

    // Log successful booking creation
    logSecurityEvent({
      type: 'BOOKING_CREATED',
      userId: user?.userId,
      details: { 
        bookingId: result.booking.id,
        bookingType: result.booking.type,
        isGuest: !user?.userId,
        totalPrice: result.booking.totalPrice
      }
    })

    // Send SMS notifications for successful booking
    try {
      const customerName = result.booking.user?.name || result.booking.guestName || 'Müşteri'
      const customerPhone = result.booking.user?.phone || result.booking.guestPhone
      
      if (customerPhone) {
        let bookingDetails = ''
        let bookingType: 'hotel' | 'taxi' | 'daycare' = 'hotel'
        
        if (result.booking.type === 'HOTEL') {
          bookingType = 'hotel'
          const startDate = new Date(result.booking.startDate).toLocaleDateString('tr-TR')
          const endDate = new Date(result.booking.endDate).toLocaleDateString('tr-TR')
          const roomName = result.booking.room?.name || 'Oda'
          bookingDetails = `${roomName} - ${startDate} / ${endDate}`
        } else if (result.booking.type === 'TAXI') {
          bookingType = 'taxi'
          const startDate = new Date(result.booking.startDate).toLocaleDateString('tr-TR')
          const startTime = new Date(result.booking.startDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          const pickup = result.booking.pickupLocation || 'Belirtilmemiş'
          const dropoff = result.booking.dropoffLocation || 'Belirtilmemiş'
          bookingDetails = `${startDate}, Saat: ${startTime} - ${pickup} → ${dropoff}`
        }
        
        // Send SMS notifications to both customer and admin
        await smsService.sendNewBookingNotifications(
          bookingType,
          customerName,
          customerPhone,
          bookingDetails
        )
        
        console.log(`📱 [Booking] SMS notifications sent for booking ${result.booking.id}`)
      } else {
        console.warn(`📱 [Booking] No phone number available for SMS notifications - booking ${result.booking.id}`)
      }
    } catch (smsError) {
      console.error('📱 [Booking] SMS notification error:', smsError)
      // Don't fail the booking if SMS fails
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      warnings: result.warnings
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create booking error:', error)
    
    const user = await optionalAuth(request).catch(() => null)
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user?.userId,
      details: { error: error.message, endpoint: 'POST /api/bookings' }
    })
    
    return NextResponse.json({ 
      error: 'Rezervasyon oluşturulurken hata oluştu' 
    }, { status: 500 })
  }
}