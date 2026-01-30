// SMS Servisi - Failover desteği ile
// SOLID Prensipleri: Strategy Pattern kullanarak farklı SMS provider'larını destekler
// Retry mekanizması: Exponential backoff ile 3 deneme

import type {
  SMSServiceConfig,
  SMSMessage,
  NotificationStatus,
} from './types'
import { maskPhoneNumber } from './security-utils'

// ==================== INTERFACES ====================

export interface SMSSendRequest {
  to: string
  message: string
  metadata?: Record<string, any>
}

export interface SMSSendResponse {
  success: boolean
  messageId?: string
  provider?: string
  errorCode?: string
  errorMessage?: string
}

// ==================== SMS PROVIDER STRATEGY ====================

interface SMSProviderStrategy {
  sendSMS(request: SMSSendRequest): Promise<SMSSendResponse>
  isAvailable(): Promise<boolean>
  getName(): string
}

// ==================== TWILIO IMPLEMENTATION ====================

class TwilioSMSProvider implements SMSProviderStrategy {
  private apiKey: string
  private apiSecret: string
  private fromNumber: string

  constructor(apiKey: string, apiSecret: string, fromNumber: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.fromNumber = fromNumber
  }

  getName(): string {
    return 'twilio'
  }

  async sendSMS(request: SMSSendRequest): Promise<SMSSendResponse> {
    try {
      // Twilio API entegrasyonu
      // Production'da gerçek Twilio SDK kullanılacak
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.apiKey}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: request.to,
          Body: request.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'SMS_SEND_FAILED',
          errorMessage: errorData.message || 'SMS gönderilemedi',
        }
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.sid,
        provider: 'twilio',
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'SMS servisine bağlanılamadı',
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Health check - basit bir API çağrısı
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.apiKey}.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// ==================== TURKCELL SMS IMPLEMENTATION ====================

class TurkcellSMSProvider implements SMSProviderStrategy {
  private apiKey: string
  private apiSecret: string
  private fromNumber: string

  constructor(apiKey: string, apiSecret: string, fromNumber: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.fromNumber = fromNumber
  }

  getName(): string {
    return 'turkcell'
  }

  async sendSMS(request: SMSSendRequest): Promise<SMSSendResponse> {
    try {
      // Turkcell SMS API entegrasyonu
      // Production'da gerçek API entegrasyonu yapılacak
      
      const response = await fetch('https://api.turkcell.com.tr/sms/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromNumber,
          to: request.to,
          message: request.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'SMS_SEND_FAILED',
          errorMessage: errorData.message || 'SMS gönderilemedi',
        }
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.messageId,
        provider: 'turkcell',
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'SMS servisine bağlanılamadı',
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.turkcell.com.tr/sms/v1/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// ==================== SINCH IMPLEMENTATION ====================

class SinchSMSProvider implements SMSProviderStrategy {
  private apiKey: string
  private apiSecret: string
  private fromNumber: string

  constructor(apiKey: string, apiSecret: string, fromNumber: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.fromNumber = fromNumber
  }

  getName(): string {
    return 'sinch'
  }

  async sendSMS(request: SMSSendRequest): Promise<SMSSendResponse> {
    try {
      const response = await fetch(`https://sms.api.sinch.com/xms/v1/${this.apiKey}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiSecret}`,
        },
        body: JSON.stringify({
          from: this.fromNumber,
          to: [request.to],
          body: request.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'SMS_SEND_FAILED',
          errorMessage: errorData.message || 'SMS gönderilemedi',
        }
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.id,
        provider: 'sinch',
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'SMS servisine bağlanılamadı',
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`https://sms.api.sinch.com/xms/v1/${this.apiKey}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiSecret}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// ==================== SMS SERVICE ====================

export class SMSService {
  private config: SMSServiceConfig
  private primaryProvider: SMSProviderStrategy | null = null
  private fallbackProvider: SMSProviderStrategy | null = null
  private retryConfig = {
    maxRetries: 3,
    delays: [1000, 5000, 15000], // 1s, 5s, 15s
  }

  constructor(config: SMSServiceConfig) {
    this.config = config
    this.initializeProviders()
  }

  /**
   * Provider'ları yapılandırma
   */
  private initializeProviders(): void {
    // Primary provider
    switch (this.config.provider) {
      case 'twilio':
        this.primaryProvider = new TwilioSMSProvider(
          this.config.primaryApiKey,
          this.config.primaryApiSecret,
          this.config.primaryFromNumber
        )
        break
      case 'turkcell':
        this.primaryProvider = new TurkcellSMSProvider(
          this.config.primaryApiKey,
          this.config.primaryApiSecret,
          this.config.primaryFromNumber
        )
        break
      case 'sinch':
        this.primaryProvider = new SinchSMSProvider(
          this.config.primaryApiKey,
          this.config.primaryApiSecret,
          this.config.primaryFromNumber
        )
        break
    }

    // Fallback provider
    if (this.config.fallbackProvider && this.config.fallbackApiKey) {
      switch (this.config.fallbackProvider) {
        case 'twilio':
          this.fallbackProvider = new TwilioSMSProvider(
            this.config.fallbackApiKey,
            this.config.fallbackApiSecret || '',
            this.config.fallbackFromNumber || ''
          )
          break
        case 'turkcell':
          this.fallbackProvider = new TurkcellSMSProvider(
            this.config.fallbackApiKey,
            this.config.fallbackApiSecret || '',
            this.config.fallbackFromNumber || ''
          )
          break
        case 'sinch':
          this.fallbackProvider = new SinchSMSProvider(
            this.config.fallbackApiKey,
            this.config.fallbackApiSecret || '',
            this.config.fallbackFromNumber || ''
          )
          break
      }
    }
  }

  /**
   * SMS gönderme - retry ve failover desteği ile
   */
  async sendSMS(request: SMSSendRequest): Promise<SMSSendResponse> {
    if (!this.config.enabled) {
      return {
        success: false,
        errorCode: 'SERVICE_DISABLED',
        errorMessage: 'SMS servisi devre dışı',
      }
    }

    // Telefon numarasını maskele (log için)
    const maskedPhone = maskPhoneNumber(request.to)
    console.log(`[SMS] Sending SMS to ${maskedPhone}`)

    // Primary provider ile dene
    if (this.primaryProvider) {
      const result = await this.trySendWithProvider(this.primaryProvider, request)
      if (result.success) {
        return result
      }

      // Primary başarısız oldu, fallback dene
      if (this.fallbackProvider) {
        console.log(`[SMS] Primary provider failed, trying fallback...`)
        const fallbackResult = await this.trySendWithProvider(this.fallbackProvider, request)
        if (fallbackResult.success) {
          return fallbackResult
        }
      }
    }

    return {
      success: false,
      errorCode: 'ALL_PROVIDERS_FAILED',
      errorMessage: 'Tüm SMS sağlayıcıları başarısız oldu',
    }
  }

  /**
   * Provider ile SMS gönderme - retry mekanizması ile
   */
  private async trySendWithProvider(
    provider: SMSProviderStrategy,
    request: SMSSendRequest
  ): Promise<SMSSendResponse> {
    // Provider'ın müsait olduğunu kontrol et
    const isAvailable = await provider.isAvailable().catch(() => false)
    if (!isAvailable) {
      return {
        success: false,
        errorCode: 'PROVIDER_UNAVAILABLE',
        errorMessage: `${provider.getName()} sağlayıcısı müsait değil`,
      }
    }

    // Retry mekanizması
    let lastError: SMSSendResponse | null = null

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = this.retryConfig.delays[attempt - 1]
        console.log(`[SMS] Retry attempt ${attempt} after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const result = await provider.sendSMS(request)

      if (result.success) {
        console.log(`[SMS] Successfully sent via ${provider.getName()}`)
        return result
      }

      lastError = result
    }

    return (
      lastError || {
        success: false,
        errorCode: 'SEND_FAILED',
        errorMessage: 'SMS gönderilemedi',
      }
    )
  }

  /**
   * SMS servisi durumu
   */
  async getStatus(): Promise<{
    enabled: boolean
    primaryAvailable: boolean
    fallbackAvailable: boolean
  }> {
    const primaryAvailable = this.primaryProvider
      ? await this.primaryProvider.isAvailable().catch(() => false)
      : false

    const fallbackAvailable = this.fallbackProvider
      ? await this.fallbackProvider.isAvailable().catch(() => false)
      : false

    return {
      enabled: this.config.enabled,
      primaryAvailable,
      fallbackAvailable,
    }
  }
}

// ==================== EXPORTS ====================

export function createSMSService(config: SMSServiceConfig): SMSService {
  return new SMSService(config)
}

