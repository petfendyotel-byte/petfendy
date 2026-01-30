import { NextRequest, NextResponse } from 'next/server'
import { iyzicoService } from '@/lib/iyzico-service'
import { logSecurityEvent } from '@/lib/auth-middleware'

// POST - İyzico payment callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ 
        error: 'Token gerekli' 
      }, { status: 400 })
    }

    // Retrieve payment result from İyzico
    const paymentResult = await iyzicoService.retrieveCheckoutForm(token)

    if (paymentResult.status === 'success') {
      // Log successful payment
      logSecurityEvent({
        type: 'PAYMENT_SUCCESS',
        details: { 
          paymentId: paymentResult.paymentId,
          basketId: paymentResult.basketId,
          paidPrice: paymentResult.paidPrice,
          provider: 'iyzico'
        }
      })

      // TODO: Update booking status in database
      // TODO: Send confirmation email/SMS
      // TODO: Update order status

      return NextResponse.json({
        success: true,
        paymentId: paymentResult.paymentId,
        paymentStatus: paymentResult.paymentStatus,
        paidPrice: paymentResult.paidPrice,
        currency: paymentResult.currency,
        basketId: paymentResult.basketId
      })
    } else {
      // Log failed payment
      logSecurityEvent({
        type: 'PAYMENT_FAILED',
        details: { 
          token,
          error: paymentResult.errorMessage,
          provider: 'iyzico'
        }
      })

      return NextResponse.json({ 
        error: 'Ödeme başarısız',
        details: paymentResult.errorMessage
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('İyzico callback error:', error)
    
    logSecurityEvent({
      type: 'PAYMENT_CALLBACK_ERROR',
      details: { error: error.message, endpoint: 'POST /api/payment/iyzico/callback' }
    })
    
    return NextResponse.json({ 
      error: 'Ödeme doğrulama hatası' 
    }, { status: 500 })
  }
}

// GET - Payment success page redirect
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=invalid_token', request.url))
  }

  try {
    const paymentResult = await iyzicoService.retrieveCheckoutForm(token)

    if (paymentResult.status === 'success' && paymentResult.paymentStatus === '1') {
      return NextResponse.redirect(new URL(`/checkout/success?payment=${paymentResult.paymentId}`, request.url))
    } else {
      return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url))
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/checkout?error=verification_failed', request.url))
  }
}