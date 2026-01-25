// Booking Service - Handles booking conflicts and business logic
import type { Booking, HotelRoom, TaxiVehicle } from './types'

export interface BookingConflictCheck {
  hasConflict: boolean
  conflictingBookings?: Booking[]
  availableAlternatives?: Array<{
    id: string
    name: string
    type: string
    pricePerNight?: number
    pricePerKm?: number
  }>
}

export interface BookingValidation {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Check for hotel room booking conflicts
 */
export async function checkHotelRoomConflict(
  roomId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<BookingConflictCheck> {
  try {
    const prisma = (await import('@/lib/prisma')).default

    // Find overlapping bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        type: 'HOTEL',
        status: { in: ['PENDING', 'CONFIRMED'] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        OR: [
          // New booking starts during existing booking
          {
            startDate: { lte: startDate },
            endDate: { gt: startDate }
          },
          // New booking ends during existing booking
          {
            startDate: { lt: endDate },
            endDate: { gte: endDate }
          },
          // New booking completely contains existing booking
          {
            startDate: { gte: startDate },
            endDate: { lte: endDate }
          },
          // Existing booking completely contains new booking
          {
            startDate: { lte: startDate },
            endDate: { gte: endDate }
          }
        ]
      },
      include: {
        room: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (conflictingBookings.length > 0) {
      // Find alternative rooms of the same type
      const currentRoom = await prisma.hotelRoom.findUnique({
        where: { id: roomId }
      })

      let availableAlternatives: any[] = []
      
      if (currentRoom) {
        const alternativeRooms = await prisma.hotelRoom.findMany({
          where: {
            id: { not: roomId },
            type: currentRoom.type,
            available: true
          }
        })

        // Check which alternatives are actually available
        for (const room of alternativeRooms) {
          const altConflict = await checkHotelRoomConflict(room.id, startDate, endDate)
          if (!altConflict.hasConflict) {
            availableAlternatives.push({
              id: room.id,
              name: room.name,
              type: room.type.toLowerCase(),
              pricePerNight: room.pricePerNight
            })
          }
        }
      }

      return {
        hasConflict: true,
        conflictingBookings: conflictingBookings as any[],
        availableAlternatives
      }
    }

    return { hasConflict: false }
  } catch (error) {
    console.error('Error checking hotel room conflict:', error)
    throw new Error('Rezervasyon çakışması kontrol edilemedi')
  }
}

/**
 * Check for taxi vehicle booking conflicts
 */
export async function checkTaxiVehicleConflict(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<BookingConflictCheck> {
  try {
    const prisma = (await import('@/lib/prisma')).default

    // For taxi, we need to consider travel time + buffer
    const bufferMinutes = 30 // 30 minutes buffer between bookings
    const startWithBuffer = new Date(startDate.getTime() - bufferMinutes * 60 * 1000)
    const endWithBuffer = new Date(endDate.getTime() + bufferMinutes * 60 * 1000)

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        vehicleId,
        type: 'TAXI',
        status: { in: ['PENDING', 'CONFIRMED'] },
        ...(excludeBookingId && { id: { not: excludeBookingId } }),
        OR: [
          {
            startDate: { lte: startWithBuffer },
            endDate: { gt: startWithBuffer }
          },
          {
            startDate: { lt: endWithBuffer },
            endDate: { gte: endWithBuffer }
          },
          {
            startDate: { gte: startWithBuffer },
            endDate: { lte: endWithBuffer }
          },
          {
            startDate: { lte: startWithBuffer },
            endDate: { gte: endWithBuffer }
          }
        ]
      },
      include: {
        vehicle: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (conflictingBookings.length > 0) {
      // Find alternative vehicles of the same type
      const currentVehicle = await prisma.taxiVehicle.findUnique({
        where: { id: vehicleId }
      })

      let availableAlternatives: any[] = []
      
      if (currentVehicle) {
        const alternativeVehicles = await prisma.taxiVehicle.findMany({
          where: {
            id: { not: vehicleId },
            type: currentVehicle.type,
            isAvailable: true
          }
        })

        // Check which alternatives are actually available
        for (const vehicle of alternativeVehicles) {
          const altConflict = await checkTaxiVehicleConflict(vehicle.id, startDate, endDate)
          if (!altConflict.hasConflict) {
            availableAlternatives.push({
              id: vehicle.id,
              name: vehicle.name,
              type: vehicle.type.toLowerCase(),
              pricePerKm: vehicle.pricePerKm
            })
          }
        }
      }

      return {
        hasConflict: true,
        conflictingBookings: conflictingBookings as any[],
        availableAlternatives
      }
    }

    return { hasConflict: false }
  } catch (error) {
    console.error('Error checking taxi vehicle conflict:', error)
    throw new Error('Araç çakışması kontrol edilemedi')
  }
}

/**
 * Validate booking business rules
 */
export async function validateBooking(bookingData: {
  type: 'HOTEL' | 'TAXI'
  roomId?: string
  vehicleId?: string
  startDate: Date
  endDate: Date
  petId?: string
  userId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
}): Promise<BookingValidation> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Basic date validation
    const now = new Date()
    const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

    if (bookingData.startDate < minBookingTime) {
      errors.push('Rezervasyon en az 2 saat önceden yapılmalıdır')
    }

    if (bookingData.endDate <= bookingData.startDate) {
      errors.push('Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
    }

    // Hotel-specific validation
    if (bookingData.type === 'HOTEL') {
      if (!bookingData.roomId) {
        errors.push('Oda seçimi zorunludur')
      } else {
        // Check room availability
        const prisma = (await import('@/lib/prisma')).default
        const room = await prisma.hotelRoom.findUnique({
          where: { id: bookingData.roomId }
        })

        if (!room) {
          errors.push('Seçilen oda bulunamadı')
        } else if (!room.available) {
          errors.push('Seçilen oda şu anda müsait değil')
        }

        // Check minimum stay (1 night)
        const nights = Math.ceil((bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60 * 60 * 24))
        if (nights < 1) {
          errors.push('Minimum 1 gece konaklama gereklidir')
        }

        // Check maximum stay (30 nights)
        if (nights > 30) {
          warnings.push('30 günden uzun konaklamalar için özel onay gerekebilir')
        }

        // Check for conflicts
        if (room && errors.length === 0) {
          const conflictCheck = await checkHotelRoomConflict(
            bookingData.roomId,
            bookingData.startDate,
            bookingData.endDate
          )

          if (conflictCheck.hasConflict) {
            errors.push('Seçilen tarihler için oda müsait değil')
            if (conflictCheck.availableAlternatives && conflictCheck.availableAlternatives.length > 0) {
              warnings.push(`${conflictCheck.availableAlternatives.length} alternatif oda mevcut`)
            }
          }
        }
      }
    }

    // Taxi-specific validation
    if (bookingData.type === 'TAXI') {
      if (!bookingData.vehicleId) {
        errors.push('Araç seçimi zorunludur')
      } else {
        // Check vehicle availability
        const prisma = (await import('@/lib/prisma')).default
        const vehicle = await prisma.taxiVehicle.findUnique({
          where: { id: bookingData.vehicleId }
        })

        if (!vehicle) {
          errors.push('Seçilen araç bulunamadı')
        } else if (!vehicle.isAvailable) {
          errors.push('Seçilen araç şu anda müsait değil')
        }

        // Check minimum duration (30 minutes)
        const durationMinutes = (bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60)
        if (durationMinutes < 30) {
          errors.push('Minimum 30 dakika rezervasyon gereklidir')
        }

        // Check maximum duration (12 hours)
        if (durationMinutes > 12 * 60) {
          warnings.push('12 saatten uzun süreli rezervasyonlar için özel onay gerekebilir')
        }

        // Check for conflicts
        if (vehicle && errors.length === 0) {
          const conflictCheck = await checkTaxiVehicleConflict(
            bookingData.vehicleId,
            bookingData.startDate,
            bookingData.endDate
          )

          if (conflictCheck.hasConflict) {
            errors.push('Seçilen tarihler için araç müsait değil')
            if (conflictCheck.availableAlternatives && conflictCheck.availableAlternatives.length > 0) {
              warnings.push(`${conflictCheck.availableAlternatives.length} alternatif araç mevcut`)
            }
          }
        }
      }
    }

    // User/Guest validation
    if (!bookingData.userId) {
      // Guest booking validation
      if (!bookingData.guestName || bookingData.guestName.trim().length < 2) {
        errors.push('Misafir adı en az 2 karakter olmalıdır')
      }

      if (!bookingData.guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.guestEmail)) {
        errors.push('Geçerli bir e-posta adresi giriniz')
      }

      if (!bookingData.guestPhone || bookingData.guestPhone.trim().length < 10) {
        errors.push('Geçerli bir telefon numarası giriniz')
      }
    } else {
      // Registered user validation
      const prisma = (await import('@/lib/prisma')).default
      const user = await prisma.user.findUnique({
        where: { id: bookingData.userId }
      })

      if (!user) {
        errors.push('Kullanıcı bulunamadı')
      }

      // Check if pet is required and belongs to user
      if (bookingData.petId) {
        const pet = await prisma.pet.findUnique({
          where: { id: bookingData.petId }
        })

        if (!pet) {
          errors.push('Evcil hayvan bulunamadı')
        } else if (pet.userId !== bookingData.userId) {
          errors.push('Bu evcil hayvan size ait değil')
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    }

  } catch (error) {
    console.error('Error validating booking:', error)
    return {
      valid: false,
      errors: ['Rezervasyon doğrulaması sırasında hata oluştu']
    }
  }
}

/**
 * Calculate booking price with all fees
 */
export async function calculateBookingPrice(bookingData: {
  type: 'HOTEL' | 'TAXI'
  roomId?: string
  vehicleId?: string
  startDate: Date
  endDate: Date
  distance?: number
  additionalServices?: Array<{ id: string; quantity?: number }>
}): Promise<{
  basePrice: number
  servicesPrice: number
  taxPrice: number
  totalPrice: number
  breakdown: Array<{ item: string; price: number; quantity?: number }>
}> {
  const breakdown: Array<{ item: string; price: number; quantity?: number }> = []
  let basePrice = 0
  let servicesPrice = 0

  try {
    const prisma = (await import('@/lib/prisma')).default

    if (bookingData.type === 'HOTEL' && bookingData.roomId) {
      const room = await prisma.hotelRoom.findUnique({
        where: { id: bookingData.roomId }
      })

      if (room) {
        const nights = Math.ceil((bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60 * 60 * 24))
        basePrice = room.pricePerNight * nights
        breakdown.push({
          item: `${room.name} (${nights} gece)`,
          price: basePrice,
          quantity: nights
        })

        // Check for special pricing on specific dates
        const specialPricings = await prisma.roomPricing.findMany({
          where: {
            roomId: bookingData.roomId,
            date: {
              gte: bookingData.startDate,
              lt: bookingData.endDate
            }
          }
        })

        // Apply special pricing if any
        let specialPriceAdjustment = 0
        for (const pricing of specialPricings) {
          const adjustment = pricing.pricePerNight - room.pricePerNight
          specialPriceAdjustment += adjustment
          if (adjustment !== 0) {
            breakdown.push({
              item: `Özel fiyat (${pricing.date.toLocaleDateString('tr-TR')})`,
              price: adjustment
            })
          }
        }
        basePrice += specialPriceAdjustment
      }
    }

    if (bookingData.type === 'TAXI' && bookingData.vehicleId && bookingData.distance) {
      const vehicle = await prisma.taxiVehicle.findUnique({
        where: { id: bookingData.vehicleId }
      })

      if (vehicle) {
        basePrice = vehicle.pricePerKm * bookingData.distance
        breakdown.push({
          item: `${vehicle.name} (${bookingData.distance} km)`,
          price: basePrice,
          quantity: bookingData.distance
        })
      }
    }

    // Calculate additional services
    if (bookingData.additionalServices && bookingData.additionalServices.length > 0) {
      // This would need to be implemented based on your additional services structure
      // For now, we'll skip this part
    }

    // Calculate tax (18% KDV in Turkey)
    const taxRate = 0.18
    const taxPrice = (basePrice + servicesPrice) * taxRate

    const totalPrice = basePrice + servicesPrice + taxPrice

    breakdown.push({
      item: 'KDV (%18)',
      price: taxPrice
    })

    return {
      basePrice,
      servicesPrice,
      taxPrice,
      totalPrice,
      breakdown
    }

  } catch (error) {
    console.error('Error calculating booking price:', error)
    throw new Error('Fiyat hesaplaması yapılamadı')
  }
}

/**
 * Create booking with conflict prevention
 */
export async function createBookingWithValidation(bookingData: {
  type: 'HOTEL' | 'TAXI'
  roomId?: string
  vehicleId?: string
  petId?: string
  userId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  startDate: Date
  endDate: Date
  specialRequests?: string
  pickupLocation?: string
  dropoffLocation?: string
  distance?: number
  isRoundTrip?: boolean
  additionalServices?: Array<{ id: string; name: string; price: number }>
}): Promise<{ success: boolean; booking?: any; errors?: string[]; warnings?: string[] }> {
  try {
    // Validate booking
    const validation = await validateBooking(bookingData)
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      }
    }

    // Calculate price
    const pricing = await calculateBookingPrice(bookingData)

    // Create booking in transaction to prevent race conditions
    const prisma = (await import('@/lib/prisma')).default
    
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check for conflicts within transaction
      if (bookingData.type === 'HOTEL' && bookingData.roomId) {
        const conflictCheck = await checkHotelRoomConflict(
          bookingData.roomId,
          bookingData.startDate,
          bookingData.endDate
        )
        if (conflictCheck.hasConflict) {
          throw new Error('Rezervasyon çakışması tespit edildi')
        }
      }

      if (bookingData.type === 'TAXI' && bookingData.vehicleId) {
        const conflictCheck = await checkTaxiVehicleConflict(
          bookingData.vehicleId,
          bookingData.startDate,
          bookingData.endDate
        )
        if (conflictCheck.hasConflict) {
          throw new Error('Araç çakışması tespit edildi')
        }
      }

      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          type: bookingData.type,
          roomId: bookingData.roomId,
          vehicleId: bookingData.vehicleId,
          petId: bookingData.petId,
          userId: bookingData.userId,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          totalPrice: pricing.totalPrice,
          specialRequests: bookingData.specialRequests,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          distance: bookingData.distance,
          isRoundTrip: bookingData.isRoundTrip || false,
          status: 'PENDING'
        },
        include: {
          room: true,
          vehicle: true,
          pet: true,
          user: {
            select: { name: true, email: true, phone: true }
          }
        }
      })

      // Add additional services if any
      if (bookingData.additionalServices && bookingData.additionalServices.length > 0) {
        await tx.bookingService.createMany({
          data: bookingData.additionalServices.map(service => ({
            bookingId: newBooking.id,
            name: service.name,
            price: service.price
          }))
        })
      }

      return newBooking
    })

    return {
      success: true,
      booking,
      warnings: validation.warnings
    }

  } catch (error: any) {
    console.error('Error creating booking:', error)
    return {
      success: false,
      errors: [error.message || 'Rezervasyon oluşturulamadı']
    }
  }
}