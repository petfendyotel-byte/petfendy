// POS Entegrasyon Servisi - Ziraat ve Payten
// SOLID Prensipleri: Strategy Pattern kullanarak farklı POS provider'larını destekler
// Veri Bütünlüğü: Tüm işlemler atomik ve idempotent

import type {
  PaymentProvider,
  Transaction,
  TransactionStatus,
  PaymentType,
  Currency,
  ZiraatPOSConfig,
  PaytenPOSConfig,
  RiskAssessment,
  Non3DFallbackRule,
  InstallmentRule,
  PreauthConfig,
  CardToken,
  IdempotencyRecord,
} from './types'
import { maskCardNumber } from './encryption'
import { riskManagementService } from './risk-management-service'

// ==================== INTERFACES ====================

export interface POSPaymentRequest {
  amount: number
  currency: Currency
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardHolder: string
  installmentCount?: number
  orderId: string
  userId?: string
  email: string
  phone: string
  use3DSecure: boolean
  isPreauth?: boolean
  idempotencyKey: string
  metadata?: Record<string, any>
}

export interface POSPaymentResponse {
  success: boolean
  transactionId?: string
  status?: TransactionStatus
  paymentUrl?: string // 3D Secure için yönlendirme URL'i
  message?: string
  errorCode?: string
  errorMessage?: string
  cardToken?: string // Tokenize edilmiş kart
  maskedCard?: string
  requires3DSecure?: boolean
  riskAssessment?: RiskAssessment
}

export interface POSRefundRequest {
  originalTransactionId: string
  amount: number
  reason: string
  isPartial: boolean
  idempotencyKey: string
}

export interface POSRefundResponse {
  success: boolean
  refundTransactionId?: string
  status?: TransactionStatus
  message?: string
  errorCode?: string
  errorMessage?: string
}

export interface POSStatusResponse {
  transactionId: string
  status: TransactionStatus
  amount: number
  currency: Currency
  cardToken?: string
  maskedCard?: string
}

// ==================== STRATEGY INTERFACE ====================

interface POSProviderStrategy {
  processPayment(request: POSPaymentRequest): Promise<POSPaymentResponse>
  refundPayment(request: POSRefundRequest): Promise<POSRefundResponse>
  checkStatus(transactionId: string): Promise<POSStatusResponse>
  tokenizeCard(cardNumber: string, userId: string): Promise<string | null>
  isAvailable(): Promise<boolean>
}

// ==================== ZIRAAT POS IMPLEMENTATION ====================

class ZiraatPOSProvider implements POSProviderStrategy {
  private config: ZiraatPOSConfig
  private baseUrl: string

  constructor(config: ZiraatPOSConfig) {
    this.config = config
    this.baseUrl = config.testMode
      ? 'https://testpos.ziraatbank.com.tr/api'
      : 'https://pos.ziraatbank.com.tr/api'
  }

  async processPayment(request: POSPaymentRequest): Promise<POSPaymentResponse> {
    try {
      // Ziraat POS API çağrısı
      // Production'da gerçek API entegrasyonu yapılacak
      
      const response = await fetch(`${this.baseUrl}/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
          'X-Terminal-Id': this.config.terminalId,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          cardNumber: request.cardNumber,
          expiryMonth: request.expiryMonth,
          expiryYear: request.expiryYear,
          cvv: request.cvv,
          cardHolder: request.cardHolder,
          installmentCount: request.installmentCount || 1,
          orderId: request.orderId,
          email: request.email,
          phone: request.phone,
          use3DSecure: request.use3DSecure && this.config.enable3DSecure,
          isPreauth: request.isPreauth,
          idempotencyKey: request.idempotencyKey,
          successUrl: this.config.successUrl,
          failUrl: this.config.failUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'PAYMENT_FAILED',
          errorMessage: errorData.message || 'Ödeme işlemi başarısız',
        }
      }

      const data = await response.json()

      return {
        success: data.success || false,
        transactionId: data.transactionId,
        status: this.mapStatus(data.status),
        paymentUrl: data.paymentUrl, // 3D Secure için
        cardToken: data.cardToken,
        maskedCard: maskCardNumber(request.cardNumber),
        requires3DSecure: data.requires3DSecure || false,
        message: data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'POS servisine bağlanılamadı',
      }
    }
  }

  async refundPayment(request: POSRefundRequest): Promise<POSRefundResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
        body: JSON.stringify({
          originalTransactionId: request.originalTransactionId,
          amount: request.amount,
          reason: request.reason,
          isPartial: request.isPartial,
          idempotencyKey: request.idempotencyKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'REFUND_FAILED',
          errorMessage: errorData.message || 'İade işlemi başarısız',
        }
      }

      const data = await response.json()

      return {
        success: data.success || false,
        refundTransactionId: data.refundTransactionId,
        status: this.mapStatus(data.status),
        message: data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'POS servisine bağlanılamadı',
      }
    }
  }

  async checkStatus(transactionId: string): Promise<POSStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
      })

      if (!response.ok) {
        throw new Error('Status check failed')
      }

      const data = await response.json()

      return {
        transactionId: data.transactionId,
        status: this.mapStatus(data.status),
        amount: data.amount,
        currency: data.currency as Currency,
        cardToken: data.cardToken,
        maskedCard: data.maskedCard,
      }
    } catch (error: any) {
      throw new Error(`Status check failed: ${error.message}`)
    }
  }

  async tokenizeCard(cardNumber: string, userId: string): Promise<string | null> {
    // Ziraat tokenization API'si
    // Production'da implement edilecek
    return null
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  private mapStatus(posStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'SUCCESS': 'success',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'REFUNDED': 'refunded',
      'CANCELLED': 'cancelled',
    }
    return statusMap[posStatus] || 'pending'
  }
}

// ==================== PAYTEN POS IMPLEMENTATION ====================

class PaytenPOSProvider implements POSProviderStrategy {
  private config: PaytenPOSConfig
  private baseUrl: string

  constructor(config: PaytenPOSConfig) {
    this.config = config
    this.baseUrl = config.testMode
      ? 'https://test.payten.com.tr/api/v1'
      : 'https://api.payten.com.tr/api/v1'
  }

  async processPayment(request: POSPaymentRequest): Promise<POSPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          cardNumber: request.cardNumber,
          expiryMonth: request.expiryMonth,
          expiryYear: request.expiryYear,
          cvv: request.cvv,
          cardHolder: request.cardHolder,
          installmentCount: request.installmentCount || 1,
          orderId: request.orderId,
          customerEmail: request.email,
          customerPhone: request.phone,
          use3DSecure: request.use3DSecure && this.config.enable3DSecure,
          isPreauth: request.isPreauth,
          idempotencyKey: request.idempotencyKey,
          successUrl: this.config.successUrl,
          failUrl: this.config.failUrl,
          tokenize: this.config.tokenizationEnabled,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'PAYMENT_FAILED',
          errorMessage: errorData.message || 'Ödeme işlemi başarısız',
        }
      }

      const data = await response.json()

      return {
        success: data.success || false,
        transactionId: data.transactionId,
        status: this.mapStatus(data.status),
        paymentUrl: data.redirectUrl, // 3D Secure için
        cardToken: data.cardToken,
        maskedCard: maskCardNumber(request.cardNumber),
        requires3DSecure: data.requires3DSecure || false,
        message: data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'POS servisine bağlanılamadı',
      }
    }
  }

  async refundPayment(request: POSRefundRequest): Promise<POSRefundResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
        body: JSON.stringify({
          transactionId: request.originalTransactionId,
          amount: request.amount,
          reason: request.reason,
          isPartial: request.isPartial,
          idempotencyKey: request.idempotencyKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          errorCode: errorData.code || 'REFUND_FAILED',
          errorMessage: errorData.message || 'İade işlemi başarısız',
        }
      }

      const data = await response.json()

      return {
        success: data.success || false,
        refundTransactionId: data.refundTransactionId,
        status: this.mapStatus(data.status),
        message: data.message,
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'POS servisine bağlanılamadı',
      }
    }
  }

  async checkStatus(transactionId: string): Promise<POSStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
      })

      if (!response.ok) {
        throw new Error('Status check failed')
      }

      const data = await response.json()

      return {
        transactionId: data.transactionId,
        status: this.mapStatus(data.status),
        amount: data.amount,
        currency: data.currency as Currency,
        cardToken: data.cardToken,
        maskedCard: data.maskedCard,
      }
    } catch (error: any) {
      throw new Error(`Status check failed: ${error.message}`)
    }
  }

  async tokenizeCard(cardNumber: string, userId: string): Promise<string | null> {
    if (!this.config.tokenizationEnabled) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-Id': this.config.merchantId,
        },
        body: JSON.stringify({
          cardNumber,
          userId,
        }),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.token || null
    } catch {
      return null
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  private mapStatus(posStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'SUCCESS': 'success',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'REFUNDED': 'refunded',
      'CANCELLED': 'cancelled',
    }
    return statusMap[posStatus] || 'pending'
  }
}

// ==================== POS INTEGRATION SERVICE ====================

export class POSIntegrationService {
  private providers: Map<PaymentProvider, POSProviderStrategy> = new Map()
  private defaultProvider: PaymentProvider | null = null
  private failoverProviders: PaymentProvider[] = []

  constructor() {
    // Provider'lar runtime'da yapılandırılacak
  }

  /**
   * Provider ekleme (Strategy Pattern)
   */
  registerProvider(provider: PaymentProvider, strategy: POSProviderStrategy): void {
    this.providers.set(provider, strategy)
  }

  /**
   * Default provider ayarlama
   */
  setDefaultProvider(provider: PaymentProvider): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not registered`)
    }
    this.defaultProvider = provider
  }

  /**
   * Failover provider'ları ayarlama
   */
  setFailoverProviders(providers: PaymentProvider[]): void {
    this.failoverProviders = providers.filter(p => this.providers.has(p))
  }

  /**
   * Ödeme işlemi - failover desteği ile
   */
  async processPayment(
    request: POSPaymentRequest,
    preferredProvider?: PaymentProvider
  ): Promise<POSPaymentResponse> {
    // Risk değerlendirmesi ve 3D/Non-3D kararı
    const cardBIN = request.cardNumber?.replace(/\s/g, '').slice(0, 6)
    const riskAssessment = await riskManagementService.assessRisk({
      amount: request.amount,
      cardBIN,
      deviceFingerprint: request.metadata?.deviceFingerprint,
      userId: request.userId,
      previousSuccessCount: request.metadata?.previousSuccessCount,
      failedAttemptsInWindow: request.metadata?.failedAttemptsInWindow,
      country: request.metadata?.country,
      ipAddress: request.metadata?.ipAddress,
    })

    if (riskAssessment.recommendation === 'block') {
      return {
        success: false,
        errorCode: 'RISK_BLOCKED',
        errorMessage: 'İşlem risk nedeniyle engellendi',
        riskAssessment,
      }
    }

    // 3D zorunluluğu
    const force3D = riskAssessment.recommendation === 'require_3d'
    let use3D = force3D ? true : request.use3DSecure

    const threeDAvailable = riskManagementService.is3DAvailable()
    const canFallbackToNon3D = await riskManagementService.canUseNon3DFallback({
      amount: request.amount,
      cardBIN,
      deviceFingerprint: request.metadata?.deviceFingerprint,
      userId: request.userId,
      previousSuccessCount: request.metadata?.previousSuccessCount,
      failedAttemptsInWindow: request.metadata?.failedAttemptsInWindow,
    })

    // 3D zorunlu ama servis yok → Non-3D fallback kontrolü
    if (use3D && !threeDAvailable) {
      if (!canFallbackToNon3D) {
        return {
          success: false,
          errorCode: '3D_UNAVAILABLE',
          errorMessage: '3D Secure hizmeti uygun değil ve Non-3D fallback kuralları sağlanmadı',
          riskAssessment,
        }
      }
      use3D = false
    }

    // 3D kapatılmışsa ve fallback koşulları sağlanmıyorsa 3D'ye zorla
    if (!use3D && !canFallbackToNon3D) {
      use3D = true
    }

    const requestWithRisk: POSPaymentRequest = {
      ...request,
      use3DSecure: use3D,
      metadata: {
        ...request.metadata,
        riskRecommendation: riskAssessment.recommendation,
        riskScore: riskAssessment.score,
      },
    }

    const providersToTry = preferredProvider
      ? [preferredProvider, ...this.failoverProviders]
      : this.defaultProvider
      ? [this.defaultProvider, ...this.failoverProviders]
      : Array.from(this.providers.keys())

    let lastError: POSPaymentResponse | null = null

    for (const provider of providersToTry) {
      const strategy = this.providers.get(provider)
      if (!strategy) continue

      // Provider'ın müsait olduğunu kontrol et
      const isAvailable = await strategy.isAvailable().catch(() => false)
      if (!isAvailable) {
        console.warn(`[POS] Provider ${provider} is not available, trying next...`)
        continue
      }

      try {
        const response = await strategy.processPayment({
          ...requestWithRisk,
          metadata: {
            ...requestWithRisk.metadata,
            attemptedProvider: provider,
          },
        })

        if (response.success) {
          return {
            ...response,
            riskAssessment,
            metadata: {
              ...requestWithRisk.metadata,
              provider,
              attemptedProviders: providersToTry.slice(0, providersToTry.indexOf(provider) + 1),
            },
          }
        }

        lastError = response
      } catch (error: any) {
        console.error(`[POS] Error with provider ${provider}:`, error)
        lastError = {
          success: false,
          errorCode: 'PROVIDER_ERROR',
          errorMessage: error.message || 'Provider error',
        }
      }
    }

    return (
      lastError || {
        success: false,
        errorCode: 'NO_AVAILABLE_PROVIDER',
        errorMessage: 'Tüm POS sağlayıcıları müsait değil',
      }
    )
  }

  /**
   * İade işlemi
   */
  async refundPayment(
    request: POSRefundRequest,
    provider: PaymentProvider
  ): Promise<POSRefundResponse> {
    const strategy = this.providers.get(provider)
    if (!strategy) {
      return {
        success: false,
        errorCode: 'PROVIDER_NOT_FOUND',
        errorMessage: `Provider ${provider} bulunamadı`,
      }
    }

    return strategy.refundPayment(request)
  }

  /**
   * İşlem durumu sorgulama
   */
  async checkStatus(transactionId: string, provider: PaymentProvider): Promise<POSStatusResponse> {
    const strategy = this.providers.get(provider)
    if (!strategy) {
      throw new Error(`Provider ${provider} bulunamadı`)
    }

    return strategy.checkStatus(transactionId)
  }

  /**
   * Kart tokenization
   */
  async tokenizeCard(
    cardNumber: string,
    userId: string,
    provider: PaymentProvider
  ): Promise<string | null> {
    const strategy = this.providers.get(provider)
    if (!strategy) {
      return null
    }

    return strategy.tokenizeCard(cardNumber, userId)
  }
}

// ==================== EXPORTS ====================

export const posIntegrationService = new POSIntegrationService()

// Helper function: Ziraat config ile provider oluştur
export function createZiraatProvider(config: ZiraatPOSConfig): ZiraatPOSProvider {
  return new ZiraatPOSProvider(config)
}

// Helper function: Payten config ile provider oluştur
export function createPaytenProvider(config: PaytenPOSConfig): PaytenPOSProvider {
  return new PaytenPOSProvider(config)
}

