// Logout API Endpoint
// Handles user logout and token revocation

import { NextRequest, NextResponse } from 'next/server'
import { jwtService } from '@/lib/jwt-service'
import { ApiResponseFormatter } from '@/lib/api-response'
import { protectAPI } from '@/lib/api-waf-middleware'
import { logSecurityEvent, getClientIP } from '@/lib/security-middleware'

export async function POST(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'auth-logout',
    maxRequests: 50,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    const body = await request.json()
    const { refreshToken, logoutAll = false } = body

    // Get user ID from access token (if provided)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const userId = accessToken ? jwtService.extractUserId(accessToken) : null

    if (logoutAll && userId) {
      // Logout from all devices - revoke all refresh tokens for user
      const revokedCount = jwtService.revokeAllUserTokens(userId)
      
      logSecurityEvent('LOGOUT_ALL_DEVICES', { 
        userId,
        revokedTokens: revokedCount,
        ip: getClientIP(request)
      }, request, 'medium')

      return ApiResponseFormatter.success({
        message: 'Tüm cihazlardan başarıyla çıkış yapıldı',
        revokedTokens: revokedCount
      })
    }

    if (refreshToken) {
      // Single device logout - revoke specific refresh token
      const revoked = jwtService.revokeRefreshToken(refreshToken)
      
      if (revoked) {
        logSecurityEvent('LOGOUT_SUCCESS', { 
          userId: userId || 'unknown',
          ip: getClientIP(request)
        }, request, 'low')

        return ApiResponseFormatter.success({
          message: 'Başarıyla çıkış yapıldı'
        })
      } else {
        logSecurityEvent('LOGOUT_INVALID_TOKEN', { 
          userId: userId || 'unknown',
          ip: getClientIP(request)
        }, request, 'medium')

        return ApiResponseFormatter.validationError('Geçersiz refresh token')
      }
    }

    // If no refresh token provided, just return success
    // (client-side token cleanup is sufficient for access tokens)
    logSecurityEvent('LOGOUT_CLIENT_ONLY', { 
      userId: userId || 'unknown',
      ip: getClientIP(request)
    }, request, 'low')

    return ApiResponseFormatter.success({
      message: 'Çıkış yapıldı'
    })

  } catch (error) {
    console.error('❌ [Logout] Failed:', error)
    
    logSecurityEvent('LOGOUT_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIP(request)
    }, request, 'high')

    return ApiResponseFormatter.error(new Error('Çıkış işlemi sırasında bir hata oluştu'))
  }
}

// GET endpoint for logout status/stats (admin only)
export async function GET(request: NextRequest) {
  // Apply WAF protection
  const wafResult = await protectAPI(request, {
    endpoint: 'auth-logout-stats',
    maxRequests: 20,
    windowMs: 60 * 1000
  })
  if (!wafResult.allowed) {
    return wafResult.response!
  }

  try {
    // Check if user is admin
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authorization header gereklidir' },
        { status: 401 }
      )
    }

    const validation = jwtService.validateAccessToken(accessToken)
    if (!validation.valid || !validation.payload) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz access token' },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to see basic stats
    // In production, add proper admin role check
    const stats = jwtService.getTokenStats()

    return ApiResponseFormatter.success({
      tokenStats: stats,
      message: 'Token istatistikleri'
    })

  } catch (error) {
    console.error('❌ [Logout Stats] Failed:', error)
    return ApiResponseFormatter.error(new Error('İstatistikler alınırken bir hata oluştu'))
  }
}