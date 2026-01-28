// JWT Token Refresh API Endpoint
// Handles access token refresh using refresh tokens

import { NextRequest, NextResponse } from 'next/server'
import { jwtService } from '@/lib/jwt-service'
import { ApiResponseFormatter } from '@/lib/api-response'
import { protectAPI } from '@/lib/api-waf-middleware'
import { logSecurityEvent, getClientIP } from '@/lib/security-middleware'

export async function POST(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'auth-refresh',
    maxRequests: 100,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      logSecurityEvent('REFRESH_TOKEN_MISSING', { ip: getClientIP(request) }, request, 'medium')
      return ApiResponseFormatter.validationError('Refresh token gereklidir')
    }

    // Validate and refresh the token
    const refreshResult = jwtService.refreshAccessToken(refreshToken)

    if (!refreshResult.success) {
      logSecurityEvent('REFRESH_TOKEN_INVALID', { 
        error: refreshResult.error,
        ip: getClientIP(request)
      }, request, 'high')

      // Return specific error codes for different scenarios
      if (refreshResult.error?.includes('expired')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Refresh token expired',
            code: 'REFRESH_TOKEN_EXPIRED',
            message: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
          },
          { status: 401 }
        )
      } else if (refreshResult.error?.includes('revoked')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Refresh token revoked',
            code: 'REFRESH_TOKEN_REVOKED',
            message: 'Oturum geçersiz. Lütfen tekrar giriş yapın.'
          },
          { status: 401 }
        )
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid refresh token',
            code: 'REFRESH_TOKEN_INVALID',
            message: 'Geçersiz refresh token. Lütfen tekrar giriş yapın.'
          },
          { status: 401 }
        )
      }
    }

    // Extract user ID for logging
    const userId = jwtService.extractUserId(refreshResult.tokens!.accessToken)
    
    logSecurityEvent('TOKEN_REFRESHED', { 
      userId,
      ip: getClientIP(request)
    }, request, 'low')

    return ApiResponseFormatter.success({
      message: 'Token başarıyla yenilendi',
      tokens: {
        accessToken: refreshResult.tokens!.accessToken,
        refreshToken: refreshResult.tokens!.refreshToken,
        expiresIn: refreshResult.tokens!.expiresIn,
        refreshExpiresIn: refreshResult.tokens!.refreshExpiresIn
      }
    })

  } catch (error) {
    console.error('❌ [Token Refresh] Failed:', error)
    
    logSecurityEvent('TOKEN_REFRESH_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIP(request)
    }, request, 'high')

    return ApiResponseFormatter.error(new Error('Token yenileme işlemi sırasında bir hata oluştu'))
  }
}

// GET endpoint to check token status
export async function GET(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'auth-refresh-status',
    maxRequests: 50,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return ApiResponseFormatter.validationError('Authorization header gereklidir')
    }

    const validation = jwtService.validateAccessToken(token)
    const isExpired = jwtService.isTokenExpired(token)
    const userId = jwtService.extractUserId(token)
    const stats = jwtService.getTokenStats()

    return ApiResponseFormatter.success({
      token: {
        valid: validation.valid,
        expired: isExpired,
        error: validation.error,
        userId: userId,
        payload: validation.payload
      },
      stats: {
        totalRefreshTokens: stats.totalRefreshTokens,
        activeTokens: stats.activeTokens,
        revokedTokens: stats.revokedTokens
      }
    })

  } catch (error) {
    console.error('❌ [Token Status] Failed:', error)
    return ApiResponseFormatter.error(new Error('Token durumu kontrol edilirken bir hata oluştu'))
  }
}