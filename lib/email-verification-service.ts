// Email Verification Service
// Handles email verification tokens and flow

import crypto from 'crypto'

interface VerificationToken {
  userId: string
  email: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// In-memory storage for development (use Redis/Database in production)
const verificationTokens = new Map<string, VerificationToken>()

export class EmailVerificationService {
  
  /**
   * Generate verification token for user
   */
  generateVerificationToken(userId: string, email: string): string {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const verificationData: VerificationToken = {
      userId,
      email,
      token,
      expiresAt,
      createdAt: new Date()
    }
    
    // Store token (in production, use database)
    verificationTokens.set(token, verificationData)
    
    // Clean up expired tokens periodically
    this.cleanupExpiredTokens()
    
    console.log(`📧 [Email Verification] Token generated for ${email}`)
    return token
  }
  
  /**
   * Verify email token
   */
  verifyToken(token: string): { valid: boolean; userId?: string; email?: string; error?: string } {
    const verificationData = verificationTokens.get(token)
    
    if (!verificationData) {
      return { valid: false, error: 'Invalid verification token' }
    }
    
    if (new Date() > verificationData.expiresAt) {
      // Remove expired token
      verificationTokens.delete(token)
      return { valid: false, error: 'Verification token expired' }
    }
    
    // Token is valid, remove it (one-time use)
    verificationTokens.delete(token)
    
    console.log(`✅ [Email Verification] Token verified for ${verificationData.email}`)
    return { 
      valid: true, 
      userId: verificationData.userId, 
      email: verificationData.email 
    }
  }
  
  /**
   * Check if user has pending verification
   */
  hasPendingVerification(userId: string): boolean {
    for (const [token, data] of verificationTokens.entries()) {
      if (data.userId === userId && new Date() < data.expiresAt) {
        return true
      }
    }
    return false
  }
  
  /**
   * Resend verification email
   */
  async resendVerification(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    // Check rate limiting (max 3 emails per hour)
    const recentTokens = Array.from(verificationTokens.values())
      .filter(data => 
        data.userId === userId && 
        new Date().getTime() - data.createdAt.getTime() < 60 * 60 * 1000 // 1 hour
      )
    
    if (recentTokens.length >= 3) {
      return { success: false, error: 'Too many verification emails sent. Please wait before requesting another.' }
    }
    
    // Generate new token
    const token = this.generateVerificationToken(userId, email)
    
    // Send verification email
    const emailSent = await this.sendVerificationEmail(email, token)
    
    if (!emailSent) {
      return { success: false, error: 'Failed to send verification email' }
    }
    
    return { success: true }
  }
  
  /**
   * Send verification email
   */
  private async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://petfendy.com'}/verify-email?token=${token}`
      
      const emailTemplate = {
        to: email,
        subject: 'Petfendy - Email Adresinizi Doğrulayın',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Petfendy</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Evcil Dostlarınız İçin En İyi Hizmet</p>
            </div>
            
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Email Adresinizi Doğrulayın</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                Merhaba! Petfendy'ye hoş geldiniz. Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak 
                email adresinizi doğrulayın.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold;
                          display: inline-block;
                          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  ✅ Email Adresimi Doğrula
                </a>
              </div>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Güvenlik İpucu:</strong> Bu link 24 saat geçerlidir. 
                  Eğer bu email'i siz talep etmediyseniz, güvenle göz ardı edebilirsiniz.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                Link çalışmıyor mu? Aşağıdaki URL'yi tarayıcınıza kopyalayın:<br>
                <span style="word-break: break-all; color: #f97316;">${verificationUrl}</span>
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Bu email Petfendy tarafından gönderilmiştir.<br>
                Sorularınız için: <a href="mailto:info@petfendy.com" style="color: #f97316;">info@petfendy.com</a> | 
                <a href="tel:+905323073264" style="color: #f97316;">0532 307 32 64</a>
              </p>
            </div>
          </div>
        `,
        text: `
Petfendy - Email Adresinizi Doğrulayın

Merhaba! Petfendy'ye hoş geldiniz. 

Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:
${verificationUrl}

Bu link 24 saat geçerlidir.

Sorularınız için: info@petfendy.com | 0532 307 32 64
        `
      }
      
      // Send email via API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailTemplate)
      })
      
      const result = await response.json()
      return result.success === true
      
    } catch (error) {
      console.error('❌ [Email Verification] Failed to send email:', error)
      return false
    }
  }
  
  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date()
    for (const [token, data] of verificationTokens.entries()) {
      if (now > data.expiresAt) {
        verificationTokens.delete(token)
      }
    }
  }
  
  /**
   * Get verification statistics
   */
  getStats(): {
    totalPendingVerifications: number
    expiredTokens: number
    recentVerifications: number
  } {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    let totalPending = 0
    let expired = 0
    let recent = 0
    
    for (const data of verificationTokens.values()) {
      if (now > data.expiresAt) {
        expired++
      } else {
        totalPending++
        if (data.createdAt > oneHourAgo) {
          recent++
        }
      }
    }
    
    return { totalPendingVerifications: totalPending, expiredTokens: expired, recentVerifications: recent }
  }
}

// Singleton instance
export const emailVerificationService = new EmailVerificationService()

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    emailVerificationService['cleanupExpiredTokens']()
  }, 60 * 60 * 1000) // 1 hour
}