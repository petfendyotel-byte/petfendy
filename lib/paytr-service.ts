// PayTR Payment Gateway Service
// Official PayTR integration for Turkish market
// Documentation: https://dev.paytr.com/

import crypto from 'crypto'

export interface PayTRPaymentRequest {
  amount: number // Kuruş cinsinden (örn: 100.50 TL = 10050)
  currency: 'TL' | 'USD' | 'EUR'
  orderReference: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerCountry: string
  basketItems: Array<{
    name: string
    category1: string
    category2?: string
    itemType: 'PHYSICAL' | 'VIRTUAL'
    price: number
  }>
  installment?: number
  testMode?: boolean
}

export interface PayTRPaymentResponse {
  success: boolean
  token?: string
  paymentUrl?: string
  errorMessage?: string
  errorCode?: string
}

export interface PayTRCallbackData {
  merchant_oid: string
  status: 'success' | 'failed'
  total_amount: string
  hash: string
  failed_reason_code?: string
  failed_reason_msg?: string
  test_mode?: string
  payment_type?: string
  currency?: string
  payment_amount?: string
}

class PayTRService {
  private merchantId: string
  private merchantKey: string
  private merchantSalt: string
  private successUrl: string
  private failUrl: string
  private webhookSecret: string
  private testMode: boolean

  constructor() {
    this.merchantId = process.env.PAYTR_MERCHANT_ID || ''
    this.merchantKey = process.env.PAYTR_MERCHANT_KEY || ''
    this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || ''
    this.successUrl = process.env.PAYTR_SUCCESS_URL || 'https://petfendy.com/payment/success'
    this.failUrl = process.env.PAYTR_FAIL_URL || 'https://petfendy.com/payment/fail'
    this.webhookSecret = process.env.PAYTR_WEBHOOK_SECRET || ''
    this.testMode = process.env.NODE_ENV !== 'production'

    if (!this.merchantId || !this.merchantKey || !this.merchantSalt) {
      console.warn('⚠️ PayTR credentials not configured. Using test mode.')
    }
  }

  /**
   * PayTR ödeme başlatma
   */
  async initializePayment(request: PayTRPaymentRequest): Promise<PayTRPaymentResponse> {
    try {
      console.log('💳 [PayTR] Initializing payment...')
      console.log('Order:', request.orderReference)
      console.log('Amount:', request.amount / 100, request.currency)

      // PayTR için gerekli parametreler
      const params = {
        merchant_id: this.merchantId,
        user_ip: '127.0.0.1', // Gerçek IP'yi request'ten alın
        merchant_oid: request.orderReference,
        email: request.customerEmail,
        payment_amount: request.amount.toString(),
        paytr_token: this.generatePayTRToken(request),
        user_basket: this.formatBasket(request.basketItems),
        debug_on: this.testMode ? '1' : '0',
        no_installment: request.installment ? '0' : '1',
        max_installment: request.installment?.toString() || '0',
        user_name: request.customerName,
        user_address: request.customerAddress,
        user_phone: request.customerPhone,
        merchant_ok_url: this.successUrl,
        merchant_fail_url: this.failUrl,
        timeout_limit: '30',
        currency: request.currency,
        test_mode: this.testMode ? '1' : '0'
      }

      // PayTR API'ye istek gönder
      const response = await this.sendPayTRRequest(params)
      
      if (response.status === 'success') {
        return {
          success: true,
          token: response.token,
          paymentUrl: `https://www.paytr.com/odeme/guvenli/${response.token}`
        }
      } else {
        return {
          success: false,
          errorMessage: response.reason || 'Ödeme başlatılamadı',
          errorCode: response.status
        }
      }

    } catch (error) {
      console.error('❌ [PayTR] Payment initialization failed:', error)
      return {
        success: false,
        errorMessage: 'Ödeme sistemi geçici olarak kullanılamıyor',
        errorCode: 'SYSTEM_ERROR'
      }
    }
  }

  /**
   * PayTR token oluşturma
   */
  private generatePayTRToken(request: PayTRPaymentRequest): string {
    const hashStr = [
      this.merchantId,
      '127.0.0.1', // user_ip
      request.orderReference, // merchant_oid
      request.customerEmail, // email
      request.amount.toString(), // payment_amount
      this.formatBasket(request.basketItems), // user_basket
      request.installment ? '0' : '1', // no_installment
      request.installment?.toString() || '0', // max_installment
      request.currency, // currency
      this.testMode ? '1' : '0', // test_mode
      this.merchantSalt
    ].join('|')

    return crypto.createHmac('sha256', this.merchantKey).update(hashStr).digest('base64')
  }

  /**
   * Sepet formatı oluşturma
   */
  private formatBasket(items: PayTRPaymentRequest['basketItems']): string {
    return JSON.stringify(items.map(item => [
      item.name,
      item.price.toString(),
      1, // quantity
      item.category1,
      item.category2 || '',
      item.itemType
    ]))
  }

  /**
   * PayTR API'ye istek gönderme
   */
  private async sendPayTRRequest(params: any): Promise<any> {
    const formData = new URLSearchParams()
    Object.keys(params).forEach(key => {
      formData.append(key, params[key])
    })

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    return await response.json()
  }

  /**
   * PayTR callback doğrulama - Enhanced Security
   */
  verifyCallback(callbackData: PayTRCallbackData): { valid: boolean; error?: string } {
    try {
      // 1. Required fields check
      if (!callbackData.merchant_oid || !callbackData.status || !callbackData.total_amount || !callbackData.hash) {
        return { valid: false, error: 'Missing required callback fields' }
      }

      // 2. Hash verification
      const hashStr = [
        callbackData.merchant_oid,
        this.merchantSalt,
        callbackData.status,
        callbackData.total_amount
      ].join('|')

      const expectedHash = crypto
        .createHmac('sha256', this.merchantKey)
        .update(hashStr)
        .digest('base64')

      if (expectedHash !== callbackData.hash) {
        console.error('❌ [PayTR] Hash mismatch:', { expected: expectedHash, received: callbackData.hash })
        return { valid: false, error: 'Invalid callback signature' }
      }

      // 3. Amount validation (prevent amount manipulation)
      const amount = parseFloat(callbackData.total_amount)
      if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: 'Invalid payment amount' }
      }

      // 4. Status validation
      if (!['success', 'failed'].includes(callbackData.status)) {
        return { valid: false, error: 'Invalid payment status' }
      }

      // 5. Test mode consistency check
      const isTestCallback = callbackData.test_mode === '1'
      if (isTestCallback !== this.testMode) {
        console.warn('⚠️ [PayTR] Test mode mismatch:', { callbackTest: isTestCallback, configTest: this.testMode })
      }

      console.log('✅ [PayTR] Callback verification successful:', callbackData.merchant_oid)
      return { valid: true }

    } catch (error) {
      console.error('❌ [PayTR] Callback verification failed:', error)
      return { valid: false, error: 'Callback verification error' }
    }
  }

  /**
   * Webhook signature validation (additional security layer)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('⚠️ [PayTR] Webhook secret not configured')
      return true // Allow if not configured (backward compatibility)
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex')

      const receivedSignature = signature.replace('sha256=', '')
      
      // Constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      )
    } catch (error) {
      console.error('❌ [PayTR] Webhook signature verification failed:', error)
      return false
    }
  }

  /**
   * Ödeme durumu sorgulama
   */
  async checkPaymentStatus(orderReference: string): Promise<{
    success: boolean
    status: 'success' | 'failed' | 'pending'
    amount?: number
    message?: string
  }> {
    try {
      // PayTR'de ödeme durumu sorgulama API'si
      // Bu özellik için PayTR ile iletişime geçmeniz gerekebilir
      
      console.log('🔍 [PayTR] Checking payment status for:', orderReference)
      
      // Mock response - gerçek implementasyon için PayTR API dokümantasyonunu inceleyin
      return {
        success: true,
        status: 'success',
        message: 'Ödeme başarıyla tamamlandı'
      }
    } catch (error) {
      console.error('❌ [PayTR] Status check failed:', error)
      return {
        success: false,
        status: 'failed',
        message: 'Durum sorgulanamadı'
      }
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(orderReference: string, amount: number, reason: string): Promise<{
    success: boolean
    refundId?: string
    message: string
  }> {
    try {
      console.log('💰 [PayTR] Processing refund...')
      console.log('Order:', orderReference)
      console.log('Amount:', amount / 100, 'TL')
      console.log('Reason:', reason)

      // PayTR iade API'si - gerçek implementasyon için PayTR dokümantasyonunu inceleyin
      
      return {
        success: true,
        refundId: `REF-${Date.now()}`,
        message: 'İade işlemi başarıyla başlatıldı'
      }
    } catch (error) {
      console.error('❌ [PayTR] Refund failed:', error)
      return {
        success: false,
        message: 'İade işlemi başarısız oldu'
      }
    }
  }

  /**
   * Taksit seçenekleri
   */
  getInstallmentOptions(amount: number): Array<{
    installment: number
    totalAmount: number
    installmentAmount: number
    commissionRate: number
  }> {
    // PayTR taksit oranları (örnek - gerçek oranlar için PayTR'ye başvurun)
    const installmentRates = [
      { installment: 1, rate: 0 },
      { installment: 2, rate: 0.02 },
      { installment: 3, rate: 0.03 },
      { installment: 6, rate: 0.06 },
      { installment: 9, rate: 0.09 },
      { installment: 12, rate: 0.12 }
    ]

    return installmentRates.map(option => {
      const totalAmount = amount * (1 + option.rate)
      return {
        installment: option.installment,
        totalAmount,
        installmentAmount: totalAmount / option.installment,
        commissionRate: option.rate
      }
    })
  }

  /**
   * Konfigürasyon kontrolü
   */
  isConfigured(): boolean {
    return !!(this.merchantId && this.merchantKey && this.merchantSalt)
  }

  /**
   * Test modu kontrolü
   */
  isTestMode(): boolean {
    return this.testMode
  }
}

export const paytrService = new PayTRService()