import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sanitizeInput } from '@/lib/security'
import { RateLimiterService, RateLimitProfiles } from '@/lib/rate-limiter-service'

const rateLimiter = new RateLimiterService(RateLimitProfiles.payment)

interface PayTRTokenRequest {
  amount: number
  email: string
  userName: string
  userPhone: string
  userAddress: string
  basketItems: Array<{
    name: string
    price: string
    quantity: number
  }>
  orderId?: string
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

function validateRequest(data: PayTRTokenRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.amount || data.amount <= 0) {
    errors.push('Geçersiz tutar')
  }
  if (data.amount > 100000) {
    errors.push('Tutar limiti aşıldı (max 100.000 TL)')
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Geçersiz e-posta adresi')
  }
  if (!data.userName || data.userName.length < 2) {
    errors.push('Geçersiz kullanıcı adı')
  }
  if (!data.userPhone || !/^(\+90|0)?[1-9]\d{9}$/.test(data.userPhone.replace(/\s/g, ''))) {
    errors.push('Geçersiz telefon numarası')
  }
  if (!data.userAddress || data.userAddress.length < 10) {
    errors.push('Geçersiz adres (minimum 10 karakter)')
  }
  if (!data.basketItems || data.basketItems.length === 0) {
    errors.push('Sepet boş olamaz')
  }

  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    const rateCheck = rateLimiter.check(`payment:${clientIP}`)
    if (rateCheck.limited) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Çok fazla istek. Lütfen biraz bekleyin.',
          retryAfter: Math.ceil(rateCheck.resetMs / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString()
          }
        }
      )
    }

    const merchantId = process.env.PAYTR_MERCHANT_ID
    const merchantKey = process.env.PAYTR_MERCHANT_KEY
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT

    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error('❌ PayTR credentials not configured')
      return NextResponse.json(
        { success: false, error: 'Ödeme sistemi yapılandırılmamış' },
        { status: 500 }
      )
    }

    const body: PayTRTokenRequest = await request.json()

    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    const merchantOid = body.orderId || `ORDER-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`

    const userBasket = Buffer.from(JSON.stringify(
      body.basketItems.map(item => [
        sanitizeInput(item.name),
        item.price,
        item.quantity
      ])
    )).toString('base64')

    const paymentAmount = Math.round(body.amount * 100).toString()

    const userIp = clientIP
    const noInstallment = '0'
    const maxInstallment = '12'
    const currency = 'TL'
    const testMode = process.env.NODE_ENV === 'production' ? '0' : '1'
    const debugOn = process.env.NODE_ENV === 'production' ? '0' : '1'
    const lang = 'tr'
    const timeoutLimit = '30'

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petfendy.com'
    const merchantOkUrl = `${baseUrl}/tr/checkout/success`
    const merchantFailUrl = `${baseUrl}/tr/checkout?error=payment_failed`

    const hashStr = [
      merchantId,
      userIp,
      merchantOid,
      sanitizeInput(body.email),
      paymentAmount,
      userBasket,
      noInstallment,
      maxInstallment,
      currency,
      testMode
    ].join('')

    const paytrToken = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr + merchantSalt)
      .digest('base64')

    const formData = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: sanitizeInput(body.email),
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: debugOn,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: sanitizeInput(body.userName),
      user_address: sanitizeInput(body.userAddress),
      user_phone: sanitizeInput(body.userPhone),
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit: timeoutLimit,
      currency: currency,
      test_mode: testMode,
      lang: lang,
    })

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    const result = await response.json()

    if (result.status === 'success') {
      console.log(`✅ [PayTR] Token generated for order: ${merchantOid}`)
      return NextResponse.json({
        success: true,
        token: result.token,
        orderId: merchantOid,
      })
    } else {
      console.error(`❌ [PayTR] Token generation failed: ${result.reason}`)
      return NextResponse.json(
        { success: false, error: result.reason || 'Token oluşturulamadı' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('❌ [PayTR] API Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Ödeme sistemi hatası' },
      { status: 500 }
    )
  }
}
