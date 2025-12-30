// Standart API Response Şeması ve Presenter/Formatter
import { NextResponse } from 'next/server'

/**
 * Standart API Response Şeması
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
    [key: string]: any
  }
}

/**
 * HTTP Status Kodları - Merkezi Yönetim
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Error Kodları - Tip Bazlı Hata Yönetimi
 */
export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication Errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Authorization Errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Not Found Errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict Errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Payment Errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_CARD = 'INVALID_CARD',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
}

/**
 * Custom API Error Sınıfı
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  static validation(message: string, details?: any): ApiError {
    return new ApiError(ErrorCode.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST, details)
  }

  static unauthorized(message: string = 'Yetkilendirme gerekli'): ApiError {
    return new ApiError(ErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED)
  }

  static forbidden(message: string = 'Erişim reddedildi'): ApiError {
    return new ApiError(ErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN)
  }

  static notFound(message: string = 'Kaynak bulunamadı'): ApiError {
    return new ApiError(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND)
  }

  static conflict(message: string, details?: any): ApiError {
    return new ApiError(ErrorCode.CONFLICT, message, HttpStatus.CONFLICT, details)
  }

  static internal(message: string = 'Sunucu hatası', details?: any): ApiError {
    return new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR, details)
  }
}

/**
 * Response Presenter/Formatter
 */
export class ApiResponseFormatter {
  /**
   * Başarılı response formatla
   */
  static success<T>(
    data: T,
    statusCode: HttpStatus = HttpStatus.OK,
    meta?: Record<string, any>
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Hata response formatla
   */
  static error(
    error: ApiError | Error,
    requestId?: string
  ): NextResponse<ApiResponse> {
    let apiError: ApiError

    if (error instanceof ApiError) {
      apiError = error
    } else {
      // Bilinmeyen hatalar için generic error
      apiError = ApiError.internal(
        process.env.NODE_ENV === 'production'
          ? 'Bir hata oluştu'
          : error.message
      )
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    }

    return NextResponse.json(response, { status: apiError.statusCode })
  }

  /**
   * Validation hatası formatla
   */
  static validationError(
    message: string,
    details?: Record<string, string[]>
  ): NextResponse<ApiResponse> {
    return this.error(ApiError.validation(message, details))
  }
}

/**
 * Helper fonksiyonlar
 */
export function successResponse<T>(
  data: T,
  statusCode: HttpStatus = HttpStatus.OK,
  meta?: Record<string, any>
): NextResponse<ApiResponse<T>> {
  return ApiResponseFormatter.success(data, statusCode, meta)
}

export function errorResponse(
  error: ApiError | Error,
  requestId?: string
): NextResponse<ApiResponse> {
  return ApiResponseFormatter.error(error, requestId)
}

export function validationErrorResponse(
  message: string,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return ApiResponseFormatter.validationError(message, details)
}

