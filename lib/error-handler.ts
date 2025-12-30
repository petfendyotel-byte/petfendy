// Global Error Handler ve Uncaught Error Handling
import { NextRequest, NextResponse } from 'next/server'
import { ApiError, ApiResponseFormatter, HttpStatus, ErrorCode } from './api-response'

/**
 * Global Error Handler
 * Tüm uncaught hataları yakalar ve standart formatta döner
 */
export function globalErrorHandler(
  error: unknown,
  request?: NextRequest
): NextResponse {
  // Request ID oluştur
  const requestId = request
    ? request.headers.get('x-request-id') || generateRequestId()
    : generateRequestId()

  // Log error (production'da sensitive data loglanmamalı)
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Handler]', {
      requestId,
      error,
      url: request?.url,
      method: request?.method,
    })
  } else {
    // Production'da sadece error message logla
    console.error('[Error Handler]', {
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
      url: request?.url,
      method: request?.method,
    })
  }

  // ApiError ise direkt döndür
  if (error instanceof ApiError) {
    return ApiResponseFormatter.error(error, requestId)
  }

  // Zod validation error ise
  if (error && typeof error === 'object' && 'issues' in error) {
    return ApiResponseFormatter.error(
      ApiError.validation('Validasyon hatası', error),
      requestId
    )
  }

  // Generic Error ise
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('database') || error.message.includes('prisma')) {
      return ApiResponseFormatter.error(
        ApiError.internal('Veritabanı hatası', { originalError: error.message }),
        requestId
      )
    }

    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ApiResponseFormatter.error(
        ApiError.internal('Ağ hatası', { originalError: error.message }),
        requestId
      )
    }

    // Generic error
    return ApiResponseFormatter.error(
      ApiError.internal(
        process.env.NODE_ENV === 'production'
          ? 'Bir hata oluştu'
          : error.message
      ),
      requestId
    )
  }

  // Unknown error
  return ApiResponseFormatter.error(
    ApiError.internal('Bilinmeyen bir hata oluştu'),
    requestId
  )
}

/**
 * Request ID oluştur
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * API Route Wrapper
 * Tüm API route'larını wrap ederek error handling sağlar
 */
export function withErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Request ID ekle
      const requestId = generateRequestId()
      request.headers.set('x-request-id', requestId)

      // Handler'ı çalıştır
      return await handler(request, ...args)
    } catch (error) {
      // Uncaught error'ı yakala
      return globalErrorHandler(error, request)
    }
  }
}

/**
 * Async Handler Wrapper
 * Async fonksiyonları wrap ederek error handling sağlar
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      // Error'ı logla ve tekrar fırlat
      console.error('[Async Handler Error]', error)
      throw error
    }
  }
}

/**
 * Process-level uncaught error handlers
 */
if (typeof process !== 'undefined') {
  // Uncaught Exception Handler
  process.on('uncaughtException', (error: Error) => {
    console.error('[Uncaught Exception]', error)
    // Production'da process'i sonlandır
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  })

  // Unhandled Rejection Handler
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('[Unhandled Rejection]', { reason, promise })
    // Production'da process'i sonlandır
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  })
}

