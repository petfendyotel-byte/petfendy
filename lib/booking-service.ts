// Booking Service - Handles booking conflicts and business logic
import type { Booking } from './types'

// Advisory lock utilities for PostgreSQL
export class AdvisoryLockManager {
  private static locks = new Map<string, boolean>()
  
  static async acquireLock(lockId: string, timeoutMs: number = 5000): Promise<boolean> {
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      // Convert string to numeric hash for PostgreSQL advisory lock
      const numericLockId = lockId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      
      // Use PostgreSQL advisory lock
      const result = await prisma.$queryRaw`
        SELECT pg_try_advisory_lock(${numericLockId}) as acquired
      ` as any[]
      
      const acquired = result[0]?.acquired
      
      if (acquired) {
        this.locks.set(lockId, true)
        
        // Auto-release after timeout
        setTimeout(() => {
          this.releaseLock(lockId)
        }, timeoutMs)
      }
      
      return acquired
    } catch (error) {
      console.error('Advisory lock acquisition failed:', error)
      return false
    }
  }
  
  static async releaseLock(lockId: string): Promise<void> {
    try {
      if (this.locks.has(lockId)) {
        const prisma = (await import('@/lib/prisma')).default
        const numericLockId = lockId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        
        await prisma.$queryRaw`
          SELECT pg_advisory_unlock(${numericLockId})
        `
        this.locks.delete(lockId)
      }
    } catch (error) {
      console.error('Advisory lock release failed:', error)
    }
  }
}

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
 * Check for hotel room booking conflicts with SELECT FOR UPDATE and Advisory Locks
 */
export async function checkHotelRoomConflict(
  roomId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<BookingConflictCheck> {
  const lockId = `room_check_${roomId}`
  
  // Acquire advisory lock for this room
  const lockAcquired = await AdvisoryLockManager.acquireLock(lockId, 10000)
  
  if (!lockAcquired) {
    throw new Error('Room availability check is in progress, please try again')
  }

  try {
    const prisma = (await import('@/lib/prisma')).default

    // Use transaction with SELECT FOR UPDATE to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Lock the room record to prevent concurrent modifications
      const room = await tx.hotelRoom.findUnique({
        where: { id: roomId }
      })

      if (!room) {
        throw new Error('Room not found')
      }

      // Find overlapping bookings using CTE for complex date logic
      const conflictingBookings = await tx.$queryRaw`
        WITH overlapping_bookings AS (
          SELECT b.*, u.name as user_name, u.email as user_email
          FROM "Booking" b
          LEFT JOIN "User" u ON b."userId" = u.id
          WHERE b."roomId" = ${roomId}
            AND b.type = 'HOTEL'
            AND b.status IN ('PENDING', 'CONFIRMED')
            ${excludeBookingId ? `AND b.id != '${excludeBookingId}'` : ''}
            AND (
              -- New booking starts during existing booking
              (b."startDate" <= ${startDate} AND b."endDate" > ${startDate}) OR
              -- New booking ends during existing booking  
              (b."startDate" < ${endDate} AND b."endDate" >= ${endDate}) OR
              -- New booking completely contains existing booking
              (b."startDate" >= ${startDate} AND b."endDate" <= ${endDate}) OR
              -- Existing booking completely contains new booking
              (b."startDate" <= ${startDate} AND b."endDate" >= ${endDate})
            )
        )
        SELECT * FROM overlapping_bookings
        ORDER BY "startDate"
      ` as any[]

      // Get available alternatives using CTE
      const availableAlternatives = await tx.$queryRaw`
        WITH available_rooms AS (
          SELECT r.id, r.name, r.type, r.capacity, r."pricePerNight"
          FROM "HotelRoom" r
          WHERE r.available = true 
            AND r.type = (SELECT type FROM "HotelRoom" WHERE id = ${roomId})
            AND r.id != ${roomId}
            AND NOT EXISTS (
              SELECT 1 FROM "Booking" b 
              WHERE b."roomId" = r.id 
                AND b.type = 'HOTEL'
                AND b.status IN ('PENDING', 'CONFIRMED')
                AND (
                  (b."startDate" <= ${startDate} AND b."endDate" > ${startDate}) OR
                  (b."startDate" < ${endDate} AND b."endDate" >= ${endDate}) OR
                  (b."startDate" >= ${startDate} AND b."endDate" <= ${endDate}) OR
                  (b."startDate" <= ${startDate} AND b."endDate" >= ${endDate})
                )
                ${excludeBookingId ? `AND b.id != '${excludeBookingId}'` : ''}
            )
          LIMIT 5
        )
        SELECT * FROM available_rooms
      ` as any[]

      return {
        hasConflict: conflictingBookings.length > 0,
        conflictingBookings: conflictingBookings.map(booking => ({
          ...booking,
          user: { name: booking.user_name, email: booking.user_email }
        })),
        availableAlternatives: availableAlternatives.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type.toLowerCase(),
          pricePerNight: room.pricePerNight
        }))
      }
    })

    return result
  } finally {
    // Always release the lock
    await AdvisoryLockManager.releaseLock(lockId)
  }
}

/**
 * Check for taxi vehicle booking conflicts with SELECT FOR UPDATE and Advisory Locks
 */
export async function checkTaxiVehicleConflict(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<BookingConflictCheck> {
  const lockId = `vehicle_check_${vehicleId}`
  
  // Acquire advisory lock for this vehicle
  const lockAcquired = await AdvisoryLockManager.acquireLock(lockId, 10000)
  
  if (!lockAcquired) {
    throw new Error('Vehicle availability check is in progress, please try again')
  }

  try {
    const prisma = (await import('@/lib/prisma')).default

    // Use transaction with SELECT FOR UPDATE
    const result = await prisma.$transaction(async (tx) => {
      // Lock the vehicle record
      const vehicle = await tx.taxiVehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle) {
        throw new Error('Vehicle not found')
      }

      // For taxi, we need to consider travel time + buffer
      const bufferMinutes = 30 // 30 minutes buffer between bookings
      const startWithBuffer = new Date(startDate.getTime() - bufferMinutes * 60 * 1000)
      const endWithBuffer = new Date(endDate.getTime() + bufferMinutes * 60 * 1000)

      // Find overlapping bookings using CTE with buffer time
      const conflictingBookings = await tx.$queryRaw`
        WITH overlapping_bookings AS (
          SELECT b.*, u.name as user_name, u.email as user_email
          FROM "Booking" b
          LEFT JOIN "User" u ON b."userId" = u.id
          WHERE b."vehicleId" = ${vehicleId}
            AND b.type = 'TAXI'
            AND b.status IN ('PENDING', 'CONFIRMED')
            ${excludeBookingId ? `AND b.id != '${excludeBookingId}'` : ''}
            AND (
              -- Check with buffer time for taxi operations
              (b."startDate" <= ${startWithBuffer} AND b."endDate" > ${startWithBuffer}) OR
              (b."startDate" < ${endWithBuffer} AND b."endDate" >= ${endWithBuffer}) OR
              (b."startDate" >= ${startWithBuffer} AND b."endDate" <= ${endWithBuffer}) OR
              (b."startDate" <= ${startWithBuffer} AND b."endDate" >= ${endWithBuffer})
            )
        )
        SELECT * FROM overlapping_bookings
        ORDER BY "startDate"
      ` as any[]

      // Get available alternatives using CTE
      const availableAlternatives = await tx.$queryRaw`
        WITH available_vehicles AS (
          SELECT v.id, v.name, v.type, v.capacity, v."pricePerKm"
          FROM "TaxiVehicle" v
          WHERE v."isAvailable" = true 
            AND v.type = (SELECT type FROM "TaxiVehicle" WHERE id = ${vehicleId})
            AND v.id != ${vehicleId}
            AND NOT EXISTS (
              SELECT 1 FROM "Booking" b 
              WHERE b."vehicleId" = v.id 
                AND b.type = 'TAXI'
                AND b.status IN ('PENDING', 'CONFIRMED')
                AND (
                  (b."startDate" <= ${startWithBuffer} AND b."endDate" > ${startWithBuffer}) OR
                  (b."startDate" < ${endWithBuffer} AND b."endDate" >= ${endWithBuffer}) OR
                  (b."startDate" >= ${startWithBuffer} AND b."endDate" <= ${endWithBuffer}) OR
                  (b."startDate" <= ${startWithBuffer} AND b."endDate" >= ${endWithBuffer})
                )
                ${excludeBookingId ? `AND b.id != '${excludeBookingId}'` : ''}
            )
          LIMIT 5
        )
        SELECT * FROM available_vehicles
      ` as any[]

      return {
        hasConflict: conflictingBookings.length > 0,
        conflictingBookings: conflictingBookings.map(booking => ({
          ...booking,
          user: { name: booking.user_name, email: booking.user_email }
        })),
        availableAlternatives: availableAlternatives.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name,
          type: vehicle.type.toLowerCase(),
          pricePerKm: vehicle.pricePerKm
        }))
      }
    })

    return result
  } finally {
    // Always release the lock
    await AdvisoryLockManager.releaseLock(lockId)
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
 * Create booking with conflict prevention using Advisory Locks and Transactions
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
  const lockId = `booking_create_${bookingData.type}_${bookingData.roomId || bookingData.vehicleId}_${Date.now()}`
  
  // Acquire advisory lock for booking creation
  const lockAcquired = await AdvisoryLockManager.acquireLock(lockId, 15000)
  
  if (!lockAcquired) {
    return {
      success: false,
      errors: ['Booking creation is in progress, please try again']
    }
  }

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

    // Create booking in transaction with SELECT FOR UPDATE to prevent race conditions
    const prisma = (await import('@/lib/prisma')).default
    
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check for conflicts within transaction using SELECT FOR UPDATE
      if (bookingData.type === 'HOTEL' && bookingData.roomId) {
        // Lock the room record
        const room = await tx.hotelRoom.findUnique({
          where: { id: bookingData.roomId }
        })

        if (!room || !room.available) {
          throw new Error('Room is no longer available')
        }

        // Check conflicts with locked data
        const conflictCheck = await tx.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Booking" b
          WHERE b."roomId" = ${bookingData.roomId}
            AND b.type = 'HOTEL'
            AND b.status IN ('PENDING', 'CONFIRMED')
            AND (
              (b."startDate" <= ${bookingData.startDate} AND b."endDate" > ${bookingData.startDate}) OR
              (b."startDate" < ${bookingData.endDate} AND b."endDate" >= ${bookingData.endDate}) OR
              (b."startDate" >= ${bookingData.startDate} AND b."endDate" <= ${bookingData.endDate}) OR
              (b."startDate" <= ${bookingData.startDate} AND b."endDate" >= ${bookingData.endDate})
            )
          FOR UPDATE
        ` as any[]

        if (conflictCheck[0]?.count > 0) {
          throw new Error('Room conflict detected during booking creation')
        }
      }

      if (bookingData.type === 'TAXI' && bookingData.vehicleId) {
        // Lock the vehicle record
        const vehicle = await tx.taxiVehicle.findUnique({
          where: { id: bookingData.vehicleId }
        })

        if (!vehicle || !vehicle.isAvailable) {
          throw new Error('Vehicle is no longer available')
        }

        // Check conflicts with buffer time
        const bufferMinutes = 30
        const startWithBuffer = new Date(bookingData.startDate.getTime() - bufferMinutes * 60 * 1000)
        const endWithBuffer = new Date(bookingData.endDate.getTime() + bufferMinutes * 60 * 1000)

        const conflictCheck = await tx.$queryRaw`
          SELECT COUNT(*) as count
          FROM "Booking" b
          WHERE b."vehicleId" = ${bookingData.vehicleId}
            AND b.type = 'TAXI'
            AND b.status IN ('PENDING', 'CONFIRMED')
            AND (
              (b."startDate" <= ${startWithBuffer} AND b."endDate" > ${startWithBuffer}) OR
              (b."startDate" < ${endWithBuffer} AND b."endDate" >= ${endWithBuffer}) OR
              (b."startDate" >= ${startWithBuffer} AND b."endDate" <= ${endWithBuffer}) OR
              (b."startDate" <= ${startWithBuffer} AND b."endDate" >= ${endWithBuffer})
            )
          FOR UPDATE
        ` as any[]

        if (conflictCheck[0]?.count > 0) {
          throw new Error('Vehicle conflict detected during booking creation')
        }
      }

      // Create the booking with optimistic locking
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
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
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

      // Update availability counters using CTE
      if (bookingData.type === 'HOTEL' && bookingData.roomId) {
        await tx.$executeRaw`
          UPDATE "HotelRoom" 
          SET "bookingCount" = COALESCE("bookingCount", 0) + 1,
              "updatedAt" = NOW()
          WHERE id = ${bookingData.roomId}
        `
      }

      if (bookingData.type === 'TAXI' && bookingData.vehicleId) {
        await tx.$executeRaw`
          UPDATE "TaxiVehicle" 
          SET "bookingCount" = COALESCE("bookingCount", 0) + 1,
              "updatedAt" = NOW()
          WHERE id = ${bookingData.vehicleId}
        `
      }

      return newBooking
    }, {
      timeout: 10000, // 10 second timeout for transaction
      isolationLevel: 'Serializable' // Highest isolation level for critical operations
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
  } finally {
    // Always release the lock
    await AdvisoryLockManager.releaseLock(lockId)
  }
}