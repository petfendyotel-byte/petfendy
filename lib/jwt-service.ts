// JWT Service with Token Expiry and Refresh Mechanism
// Enhanced security with proper token lifecycle management

import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export interface TokenPayload {
  userId: string
  email: string
  role?: string
  type: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshExpiresIn: number
}

export interface TokenValidationResult {
  valid: boolean
  payload?: TokenPayload
  error?: string
  expired?: boolean
}

// In-memory refresh token storage (use Redis in production)
const refreshTokens = new Map<string, {
  userId: string
  email: string
  createdAt: Date
  expiresAt: Date
  revoked: boolean
}>()

class JWTService {
  private accessTokenSecret: string
  private refreshTokenSecret: string
  private accessTokenExpiry: string = '1h' // 1 hour
  private refreshTokenExpiry: string = '7d' // 7 days

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production'

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('⚠️ [JWT] Using fallback secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in production!')
    }
  }

  /**
   * Generate access and refresh token pair
   */
  generateTokenPair(userId: string, email: string, role?: string): TokenPair {
    // Generate access token (short-lived)
    const accessPayload: TokenPayload = {
      userId,
      email,
      role,
      type: 'access'
    }

    const accessToken = jwt.sign(accessPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'petfendy',
      audience: 'petfendy-users'
    })

    // Generate refresh token (long-lived)
    const refreshTokenId = crypto.randomBytes(32).toString('hex')
    const refreshPayload: TokenPayload = {
      userId,
      email,
      role,
      type: 'refresh'
    }

    const refreshToken = jwt.sign(
      { ...refreshPayload, jti: refreshTokenId }, 
      this.refreshTokenSecret, 
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'petfendy',
        audience: 'petfendy-users'
      }
    )

    // Store refresh token metadata
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    refreshTokens.set(refreshTokenId, {
      userId,
      email,
      createdAt: new Date(),
      expiresAt,
      revoked: false
    })

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens()

    console.log(`🔑 [JWT] Token pair generated for user ${userId}`)

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      refreshExpiresIn: 7 * 24 * 3600 // 7 days in seconds
    }
  }

  /**
   * Validate access token
   */
  validateAccessToken(token: string): TokenValidationResult {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'petfendy',
        audience: 'petfendy-users'
      }) as TokenPayload

      if (payload.type !== 'access') {
        return { valid: false, error: 'Invalid token type' }
      }

      return { valid: true, payload }

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired', expired: true }
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' }
      } else {
        console.error('❌ [JWT] Access token validation error:', error)
        return { valid: false, error: 'Token validation failed' }
      }
    }
  }

  /**
   * Validate refresh token
   */
  validateRefreshToken(token: string): TokenValidationResult {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'petfendy',
        audience: 'petfendy-users'
      }) as TokenPayload & { jti: string }

      if (payload.type !== 'refresh') {
        return { valid: false, error: 'Invalid token type' }
      }

      // Check if refresh token is revoked
      const tokenData = refreshTokens.get(payload.jti)
      if (!tokenData || tokenData.revoked) {
        return { valid: false, error: 'Refresh token revoked' }
      }

      if (new Date() > tokenData.expiresAt) {
        // Clean up expired token
        refreshTokens.delete(payload.jti)
        return { valid: false, error: 'Refresh token expired', expired: true }
      }

      return { valid: true, payload }

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Refresh token expired', expired: true }
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid refresh token' }
      } else {
        console.error('❌ [JWT] Refresh token validation error:', error)
        return { valid: false, error: 'Refresh token validation failed' }
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(refreshToken: string): { success: boolean; tokens?: TokenPair; error?: string } {
    const validation = this.validateRefreshToken(refreshToken)
    
    if (!validation.valid || !validation.payload) {
      return { success: false, error: validation.error }
    }

    // Generate new token pair (refresh token rotation)
    const newTokens = this.generateTokenPair(
      validation.payload.userId,
      validation.payload.email,
      validation.payload.role
    )

    // Revoke old refresh token
    const oldPayload = jwt.decode(refreshToken) as any
    if (oldPayload?.jti) {
      const tokenData = refreshTokens.get(oldPayload.jti)
      if (tokenData) {
        tokenData.revoked = true
      }
    }

    console.log(`🔄 [JWT] Access token refreshed for user ${validation.payload.userId}`)

    return { success: true, tokens: newTokens }
  }

  /**
   * Revoke refresh token (logout)
   */
  revokeRefreshToken(refreshToken: string): boolean {
    try {
      const payload = jwt.decode(refreshToken) as any
      if (payload?.jti) {
        const tokenData = refreshTokens.get(payload.jti)
        if (tokenData) {
          tokenData.revoked = true
          console.log(`🚫 [JWT] Refresh token revoked for user ${tokenData.userId}`)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('❌ [JWT] Token revocation failed:', error)
      return false
    }
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  revokeAllUserTokens(userId: string): number {
    let revokedCount = 0
    for (const [tokenId, tokenData] of refreshTokens.entries()) {
      if (tokenData.userId === userId && !tokenData.revoked) {
        tokenData.revoked = true
        revokedCount++
      }
    }
    console.log(`🚫 [JWT] Revoked ${revokedCount} tokens for user ${userId}`)
    return revokedCount
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date()
    let cleanedCount = 0
    
    for (const [tokenId, tokenData] of refreshTokens.entries()) {
      if (now > tokenData.expiresAt) {
        refreshTokens.delete(tokenId)
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [JWT] Cleaned up ${cleanedCount} expired refresh tokens`)
    }
  }

  /**
   * Get token statistics
   */
  getTokenStats(): {
    totalRefreshTokens: number
    activeTokens: number
    revokedTokens: number
    expiredTokens: number
  } {
    const now = new Date()
    let active = 0
    let revoked = 0
    let expired = 0

    for (const tokenData of refreshTokens.values()) {
      if (now > tokenData.expiresAt) {
        expired++
      } else if (tokenData.revoked) {
        revoked++
      } else {
        active++
      }
    }

    return {
      totalRefreshTokens: refreshTokens.size,
      activeTokens: active,
      revokedTokens: revoked,
      expiredTokens: expired
    }
  }

  /**
   * Extract user ID from token (without validation)
   */
  extractUserId(token: string): string | null {
    try {
      const payload = jwt.decode(token) as TokenPayload
      return payload?.userId || null
    } catch {
      return null
    }
  }

  /**
   * Check if token is expired (without validation)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = jwt.decode(token) as any
      if (!payload?.exp) return true
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }
}

// Singleton instance
export const jwtService = new JWTService()

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    jwtService['cleanupExpiredTokens']()
  }, 60 * 60 * 1000) // 1 hour
}

// Export types
export type { TokenPayload, TokenPair, TokenValidationResult }