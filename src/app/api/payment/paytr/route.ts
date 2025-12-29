import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || ''
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || ''
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || ''
const PAYTR_TEST_MODE = process.env.PAYTR_TEST_MODE === '1' ? '1' : '0'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const paymentRateLimiter = new Map<string, { count: number; resetTime: number }>()

function checkPaymentRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 1000
  const maxRequests = 3
  
  const record = paymentRateLimiter.get(ip)
  
  if (!record || now > record.resetTime) {
    paymentRateLimiter.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  
  return '127.0.0.1'
}

function sanitizeInput(input: string, maxLength: number = 255): string {
  if (!input) return ''
  return input
    .replace(/[<>'";\\/]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .substring(0, maxLength)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

function generateMerchantOid(): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `PF${timestamp}${random}`
}

function generatePayTRToken(params: {
  merchantOid: string
  userIp: string
  email: string
  paymentAmount: number
  userBasket: string
  noInstallment: string
  maxInstallment: string
  currency: string
}): string {
  const hashStr = [
    PAYTR_MERCHANT_ID,
    params.userIp,
    params.merchantOid,
    params.email,
    params.paymentAmount.toString(),
    params.userBasket,
    params.noInstallment,
    params.maxInstallment,
    params.currency,
    PAYTR_TEST_MODE,
    PAYTR_MERCHANT_SALT
  ].join('')
  
  const hmac = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
  hmac.update(hashStr)
  return hmac.digest('base64')
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    const rateLimit = checkPaymentRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen 1 dakika bekleyin.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          }
        }
      )
    }
    
    if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
      console.error('PayTR credentials not configured')
      return NextResponse.json(
        { error: 'Ödeme sistemi yapılandırılmamış' },
        { status: 500 }
      )
    }
    
    const body = await request.json()
    
    const {
      amount,
      currency = 'TL',
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      locale = 'tr'
    } = body
    
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme tutarı' },
        { status: 400 }
      )
    }
    
    if (!customerName || customerName.length < 2) {
      return NextResponse.json(
        { error: 'Müşteri adı gereklidir' },
        { status: 400 }
      )
    }
    
    if (!customerEmail || !validateEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      )
    }
    
    if (!customerPhone || !validatePhone(customerPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz' },
        { status: 400 }
      )
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Sepet bilgisi gereklidir' },
        { status: 400 }
      )
    }
    
    const merchantOid = generateMerchantOid()
    
    const paymentAmount = Math.round(amount * 100)
    
    const userBasket = Buffer.from(JSON.stringify(
      items.map((item: { name: string; price: number; quantity: number }) => [
        sanitizeInput(item.name, 50),
        (item.price * 100).toString(),
        item.quantity.toString()
      ])
    )).toString('base64')
    
    const noInstallment = '0'
    const maxInstallment = '12'
    
    const paytrToken = generatePayTRToken({
      merchantOid,
      userIp: clientIP,
      email: sanitizeInput(customerEmail, 100),
      paymentAmount,
      userBasket,
      noInstallment,
      maxInstallment,
      currency: currency === 'TL' ? 'TL' : 'USD'
    })
    
    const formData = new URLSearchParams()
    formData.append('merchant_id', PAYTR_MERCHANT_ID)
    formData.append('user_ip', clientIP)
    formData.append('merchant_oid', merchantOid)
    formData.append('email', sanitizeInput(customerEmail, 100))
    formData.append('payment_amount', paymentAmount.toString())
    formData.append('paytr_token', paytrToken)
    formData.append('user_basket', userBasket)
    formData.append('debug_on', PAYTR_TEST_MODE)
    formData.append('no_installment', noInstallment)
    formData.append('max_installment', maxInstallment)
    formData.append('user_name', sanitizeInput(customerName, 100))
    formData.append('user_address', sanitizeInput(customerAddress || 'Türkiye', 200))
    formData.append('user_phone', sanitizeInput(customerPhone, 20))
    formData.append('merchant_ok_url', `${APP_URL}/${locale}/checkout/success`)
    formData.append('merchant_fail_url', `${APP_URL}/${locale}/checkout?error=payment_failed`)
    formData.append('timeout_limit', '30')
    formData.append('currency', currency === 'TL' ? 'TL' : 'USD')
    formData.append('test_mode', PAYTR_TEST_MODE)
    formData.append('lang', locale === 'en' ? 'en' : 'tr')
    
    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
    
    const paytrResult = await paytrResponse.json()
    
    if (paytrResult.status === 'success') {
      console.log(`[PayTR] Token oluşturuldu: ${merchantOid}`)
      
      return NextResponse.json({
        success: true,
        token: paytrResult.token,
        merchantOid,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`
      })
    } else {
      console.error('[PayTR] Token hatası:', paytrResult.reason)
      
      return NextResponse.json(
        { 
          error: 'Ödeme başlatılamadı',
          details: PAYTR_TEST_MODE === '1' ? paytrResult.reason : undefined
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('[PayTR] Sunucu hatası:', error)
    
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
