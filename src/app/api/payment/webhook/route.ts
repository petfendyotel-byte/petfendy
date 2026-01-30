import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || ''
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || ''

const processedOrders = new Map<string, { timestamp: number; status: string }>()

function verifyPayTRHash(params: {
  merchantOid: string
  status: string
  totalAmount: string
  hash: string
}): boolean {
  const hashStr = [
    params.merchantOid,
    PAYTR_MERCHANT_SALT,
    params.status,
    params.totalAmount
  ].join('')
  
  const hmac = crypto.createHmac('sha256', PAYTR_MERCHANT_KEY)
  hmac.update(hashStr)
  const calculatedHash = hmac.digest('base64')
  
  if (params.hash.length !== calculatedHash.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < params.hash.length; i++) {
    result |= params.hash.charCodeAt(i) ^ calculatedHash.charCodeAt(i)
  }
  
  return result === 0
}

function isValidPayTRIP(ip: string): boolean {
  const paytrIPs = [
    '193.192.59.',
    '176.236.232.',
    '212.174.104.'
  ]
  
  return paytrIPs.some(prefix => ip.startsWith(prefix))
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  
  return 'unknown'
}

function isDuplicateNotification(merchantOid: string): boolean {
  const existing = processedOrders.get(merchantOid)
  
  if (existing) {
    const hourAgo = Date.now() - (60 * 60 * 1000)
    if (existing.timestamp > hourAgo) {
      return true
    }
  }
  
  return false
}

function markOrderProcessed(merchantOid: string, status: string): void {
  processedOrders.set(merchantOid, {
    timestamp: Date.now(),
    status
  })
  
  const hourAgo = Date.now() - (60 * 60 * 1000)
  for (const [oid, data] of processedOrders.entries()) {
    if (data.timestamp < hourAgo) {
      processedOrders.delete(oid)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    if (process.env.NODE_ENV === 'production' && !isValidPayTRIP(clientIP)) {
      console.warn(`[PayTR Webhook] Geçersiz IP adresi: ${clientIP}`)
      return new NextResponse('OK', { status: 200 })
    }
    
    if (!PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) {
      console.error('[PayTR Webhook] Credentials yapılandırılmamış')
      return new NextResponse('OK', { status: 200 })
    }
    
    const formData = await request.formData()
    
    const merchantOid = formData.get('merchant_oid')?.toString() || ''
    const status = formData.get('status')?.toString() || ''
    const totalAmount = formData.get('total_amount')?.toString() || ''
    const hash = formData.get('hash')?.toString() || ''
    const failedReasonCode = formData.get('failed_reason_code')?.toString() || ''
    const failedReasonMsg = formData.get('failed_reason_msg')?.toString() || ''
    const testMode = formData.get('test_mode')?.toString() || ''
    const paymentType = formData.get('payment_type')?.toString() || ''
    const currency = formData.get('currency')?.toString() || ''
    const paymentAmount = formData.get('payment_amount')?.toString() || ''
    
    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error('[PayTR Webhook] Eksik parametreler')
      return new NextResponse('OK', { status: 200 })
    }
    
    const isValidHash = verifyPayTRHash({
      merchantOid,
      status,
      totalAmount,
      hash
    })
    
    if (!isValidHash) {
      console.error(`[PayTR Webhook] Hash doğrulama başarısız: ${merchantOid}`)
      return new NextResponse('OK', { status: 200 })
    }
    
    if (isDuplicateNotification(merchantOid)) {
      console.log(`[PayTR Webhook] Tekrarlanan bildirim: ${merchantOid}`)
      return new NextResponse('OK', { status: 200 })
    }
    
    markOrderProcessed(merchantOid, status)
    
    if (status === 'success') {
      console.log(`[PayTR Webhook] ✅ Ödeme başarılı: ${merchantOid}`)
      console.log(`  - Tutar: ${totalAmount} kuruş`)
      console.log(`  - Ödeme Türü: ${paymentType}`)
      console.log(`  - Para Birimi: ${currency}`)
      console.log(`  - Test Modu: ${testMode}`)
      
      
    } else {
      console.log(`[PayTR Webhook] ❌ Ödeme başarısız: ${merchantOid}`)
      console.log(`  - Hata Kodu: ${failedReasonCode}`)
      console.log(`  - Hata Mesajı: ${failedReasonMsg}`)
      
    }
    
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('[PayTR Webhook] Sunucu hatası:', error)
    return new NextResponse('OK', { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
