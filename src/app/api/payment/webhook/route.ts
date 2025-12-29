import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { emailService } from '@/lib/email-service'
import { notificationService } from '@/lib/notification-service'

interface PayTRCallbackData {
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

const processedOrders = new Set<string>()

function verifyPayTRHash(data: PayTRCallbackData): boolean {
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT

  if (!merchantKey || !merchantSalt) {
    console.error('❌ PayTR credentials not configured for webhook')
    return false
  }

  const hashStr = data.merchant_oid + merchantSalt + data.status + data.total_amount
  
  const expectedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64')

  const isValid = expectedHash === data.hash

  if (!isValid) {
    console.error('❌ [PayTR Webhook] Hash verification failed!')
    console.error('Expected:', expectedHash)
    console.error('Received:', data.hash)
  }

  return isValid
}

function logPaymentEvent(data: PayTRCallbackData, verified: boolean) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    orderId: data.merchant_oid,
    status: data.status,
    amount: parseInt(data.total_amount) / 100,
    verified,
    testMode: data.test_mode === '1',
    paymentType: data.payment_type,
    failReason: data.failed_reason_msg,
  }

  if (data.status === 'success') {
    console.log('✅ [PayTR Webhook] Payment successful:', logEntry)
  } else {
    console.warn('❌ [PayTR Webhook] Payment failed:', logEntry)
  }
}

async function handleSuccessfulPayment(data: PayTRCallbackData) {
  const orderId = data.merchant_oid
  const amount = parseInt(data.total_amount) / 100

  console.log(`✅ Processing successful payment for order: ${orderId}`)

  try {
    await emailService.sendBookingConfirmationEmail({
      to: 'customer@example.com',
      customerName: 'Müşteri',
      bookingDetails: `Sipariş No: ${orderId}`,
      totalAmount: amount,
      reservationDate: new Date().toLocaleDateString('tr-TR'),
    })
  } catch (error) {
    console.error('Email sending failed:', error)
  }
}

async function handleFailedPayment(data: PayTRCallbackData) {
  const orderId = data.merchant_oid
  
  console.log(`❌ Processing failed payment for order: ${orderId}`)
  console.log(`Reason: ${data.failed_reason_msg || 'Unknown'}`)
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let data: PayTRCallbackData

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      data = {
        merchant_oid: formData.get('merchant_oid') as string,
        status: formData.get('status') as 'success' | 'failed',
        total_amount: formData.get('total_amount') as string,
        hash: formData.get('hash') as string,
        failed_reason_code: formData.get('failed_reason_code') as string | undefined,
        failed_reason_msg: formData.get('failed_reason_msg') as string | undefined,
        test_mode: formData.get('test_mode') as string | undefined,
        payment_type: formData.get('payment_type') as string | undefined,
        currency: formData.get('currency') as string | undefined,
        payment_amount: formData.get('payment_amount') as string | undefined,
      }
    } else {
      data = await request.json()
    }

    if (!data.merchant_oid || !data.status || !data.total_amount || !data.hash) {
      console.error('❌ [PayTR Webhook] Missing required fields')
      return new NextResponse('MISSING_FIELDS', { status: 400 })
    }

    const isVerified = verifyPayTRHash(data)
    
    if (!isVerified) {
      console.error('❌ [PayTR Webhook] SECURITY ALERT: Invalid hash!')
      return new NextResponse('HASH_INVALID', { status: 403 })
    }

    if (processedOrders.has(data.merchant_oid)) {
      console.log(`⚠️ [PayTR Webhook] Duplicate callback for order: ${data.merchant_oid}`)
      return new NextResponse('OK', { status: 200 })
    }

    processedOrders.add(data.merchant_oid)

    setTimeout(() => {
      processedOrders.delete(data.merchant_oid)
    }, 24 * 60 * 60 * 1000)

    logPaymentEvent(data, isVerified)

    if (data.status === 'success') {
      await handleSuccessfulPayment(data)
    } else {
      await handleFailedPayment(data)
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error: any) {
    console.error('❌ [PayTR Webhook] Error:', error.message)
    return new NextResponse('ERROR', { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'PayTR Webhook Endpoint',
    timestamp: new Date().toISOString()
  })
}
