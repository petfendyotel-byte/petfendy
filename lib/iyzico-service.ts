// İyzico Payment Service for Petfendy
// Secure payment processing with İyzico API

export interface IyzicoConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
  locale: 'tr' | 'en'
}

export interface IyzicoPaymentRequest {
  price: string
  paidPrice: string
  currency: 'TRY' | 'USD' | 'EUR'
  installment: number
  basketId: string
  paymentChannel: string
  paymentGroup: string
  callbackUrl: string
  buyer: {
    id: string
    name: string
    surname: string
    gsmNumber: string
    email: string
    identityNumber: string
    registrationAddress: string
    ip: string
    city: string
    country: string
  }
  shippingAddress: {
    contactName: string
    city: string
    country: string
    address: string
  }
  billingAddress: {
    contactName: string
    city: string
    country: string
    address: string
  }
  basketItems: Array<{
    id: string
    name: string
    category1: string
    itemType: 'PHYSICAL' | 'VIRTUAL'
    price: string
  }>
}

export interface IyzicoPaymentResponse {
  status: 'success' | 'failure'
  locale: string
  systemTime: number
  conversationId: string
  token?: string
  checkoutFormContent?: string
  paymentId?: string
  paymentStatus?: string
  fraudStatus?: number
  merchantCommissionRate?: number
  merchantCommissionRateAmount?: number
  iyziCommissionRateAmount?: number
  iyziCommissionFee?: number
  cardType?: string
  cardAssociation?: string
  cardFamily?: string
  binNumber?: string
  lastFourDigits?: string
  basketId?: string
  currency?: string
  itemTransactions?: Array<{
    itemId: string
    paymentTransactionId: string
    transactionStatus: number
    price: string
    paidPrice: string
    merchantCommissionRate: number
    merchantCommissionRateAmount: number
    iyziCommissionRateAmount: number
    iyziCommissionFee: number
    blockageRate: number
    blockageRateAmountMerchant: number
    blockageRateAmountSubMerchant: number
    blockageResolvedDate: string
    subMerchantPrice: number
    subMerchantPayoutRate: number
    subMerchantPayoutAmount: number
    merchantPayoutAmount: number
  }>
  errorCode?: string
  errorMessage?: string
  errorGroup?: string
}

class IyzicoService {
  private config: IyzicoConfig

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || '',
      secretKey: process.env.IYZICO_SECRET_KEY || '',
      baseUrl: process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com',
      locale: 'tr'
    }
  }

  private generateAuthString(requestBody: string, uri: string): string {
    const crypto = require('crypto')
    const randomString = Math.random().toString(36).substring(2, 15)
    const timestamp = Date.now()
    
    const dataToSign = `${this.config.apiKey}${randomString}${timestamp}${requestBody}${uri}`
    const hash = crypto.createHmac('sha256', this.config.secretKey).update(dataToSign).digest('base64')
    
    return `IYZWSv2 ${this.config.apiKey}:${randomString}:${timestamp}:${hash}`
  }

  async createCheckoutForm(paymentData: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    try {
      const requestBody = JSON.stringify({
        locale: this.config.locale,
        conversationId: paymentData.basketId,
        price: paymentData.price,
        paidPrice: paymentData.paidPrice,
        currency: paymentData.currency,
        installment: paymentData.installment,
        basketId: paymentData.basketId,
        paymentChannel: paymentData.paymentChannel,
        paymentGroup: paymentData.paymentGroup,
        callbackUrl: paymentData.callbackUrl,
        enabledInstallments: [1, 2, 3, 6, 9, 12],
        buyer: paymentData.buyer,
        shippingAddress: paymentData.shippingAddress,
        billingAddress: paymentData.billingAddress,
        basketItems: paymentData.basketItems
      })

      const uri = '/payment/iyzipos/checkoutform/initialize/auth/ecom'
      const authString = this.generateAuthString(requestBody, uri)

      const response = await fetch(`${this.config.baseUrl}${uri}`, {
        method: 'POST',
        headers: {
          'Authorization': authString,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        console.log('✅ İyzico checkout form created successfully')
        return result
      } else {
        console.error('❌ İyzico checkout form creation failed:', result)
        throw new Error(result.errorMessage || 'Payment form creation failed')
      }

    } catch (error: any) {
      console.error('❌ İyzico API Error:', error)
      throw new Error(`İyzico payment error: ${error.message}`)
    }
  }

  async retrieveCheckoutForm(token: string): Promise<IyzicoPaymentResponse> {
    try {
      const requestBody = JSON.stringify({
        locale: this.config.locale,
        token: token
      })

      const uri = '/payment/iyzipos/checkoutform/auth/ecom/detail'
      const authString = this.generateAuthString(requestBody, uri)

      const response = await fetch(`${this.config.baseUrl}${uri}`, {
        method: 'POST',
        headers: {
          'Authorization': authString,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody
      })

      const result = await response.json()
      
      console.log('📊 İyzico payment result:', result.status)
      return result

    } catch (error: any) {
      console.error('❌ İyzico retrieve error:', error)
      throw new Error(`İyzico retrieve error: ${error.message}`)
    }
  }

  // Petfendy için özel helper fonksiyonlar
  async createPetfendyPayment(bookingData: {
    orderId: string
    totalPrice: number
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    bookingType: 'hotel' | 'taxi' | 'daycare'
    bookingDetails: string
    userIp: string
  }): Promise<IyzicoPaymentResponse> {
    
    const paymentRequest: IyzicoPaymentRequest = {
      price: bookingData.totalPrice.toFixed(2),
      paidPrice: bookingData.totalPrice.toFixed(2),
      currency: 'TRY',
      installment: 1,
      basketId: bookingData.orderId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/iyzico/callback`,
      buyer: {
        id: bookingData.orderId,
        name: bookingData.customerName.split(' ')[0] || 'Ad',
        surname: bookingData.customerName.split(' ').slice(1).join(' ') || 'Soyad',
        gsmNumber: bookingData.customerPhone,
        email: bookingData.customerEmail,
        identityNumber: '11111111111', // Zorunlu alan - gerçek projede müşteriden alınmalı
        registrationAddress: bookingData.customerAddress,
        ip: bookingData.userIp,
        city: 'Ankara',
        country: 'Turkey'
      },
      shippingAddress: {
        contactName: bookingData.customerName,
        city: 'Ankara',
        country: 'Turkey',
        address: bookingData.customerAddress
      },
      billingAddress: {
        contactName: bookingData.customerName,
        city: 'Ankara',
        country: 'Turkey',
        address: bookingData.customerAddress
      },
      basketItems: [{
        id: bookingData.orderId,
        name: this.getServiceName(bookingData.bookingType),
        category1: 'Hizmet',
        itemType: 'VIRTUAL',
        price: bookingData.totalPrice.toFixed(2)
      }]
    }

    return await this.createCheckoutForm(paymentRequest)
  }

  private getServiceName(bookingType: string): string {
    switch (bookingType) {
      case 'hotel':
        return 'Petfendy Pet Otel Rezervasyon Hizmeti'
      case 'taxi':
        return 'Petfendy Pet Taksi Rezervasyon Hizmeti'
      case 'daycare':
        return 'Petfendy Pet Kreş Rezervasyon Hizmeti'
      default:
        return 'Petfendy Rezervasyon Hizmeti'
    }
  }
}

export const iyzicoService = new IyzicoService()

// Payment modal için basit wrapper fonksiyon
export async function processIyzicoPayment(paymentData: {
  amount: number
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  email: string
}): Promise<{ success: boolean; message?: string; paymentUrl?: string }> {
  try {
    // Bu fonksiyon şimdilik mock response döner
    // Gerçek entegrasyon için İyzico checkout form kullanılacak
    
    console.log('İyzico payment processing:', {
      amount: paymentData.amount,
      email: paymentData.email
    })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock success response
    return {
      success: true,
      message: 'Ödeme başarılı'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Ödeme işlemi başarısız'
    }
  }
}

export const iyzicoService = new IyzicoService()

// Environment'tan otomatik yapılandırma kontrolü
export function validateIyzicoConfig(): boolean {
  const requiredEnvVars = [
    'IYZICO_API_KEY',
    'IYZICO_SECRET_KEY'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.error('❌ Missing İyzico environment variables:', missing)
    return false
  }

  console.log('✅ İyzico configuration validated')
  return true
}