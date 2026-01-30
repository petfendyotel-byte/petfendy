import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, validateInput, sanitizeInputData, logSecurityEvent } from '@/lib/auth-middleware'
import { iyzicoService } from '@/lib/iyzico-service'
import { sanitizeInput } from '@/lib/security'

// Payment creation validation schema
const paymentSchema = {
  orderId: { required: true, type: 'string' },
  totalPrice: { required: true, type: 'number', min: 1 },
  customerName: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  customerEmail: { required: true, type: 'email' },
  customerPhone: { required: true, type: 'string', minLength: 10, maxLength: 20 },
  customerAddress: { required: true, type: 'string', minLength: 10, maxLength: 200 },
  bookingType: { required: true, type: 'string' },
  bookingDetails: { required: true, type: 'string', maxLength: 500 }
}

// POST - Create İyzico payment form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, paymentSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_PAYMENT_DATA',
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz ödeme verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const paymentData = validation.data!

    // Get user IP
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1'

    // Sanitize all string fields
    const sanitizedPaymentData = {
      orderId: sanitizeInput(paymentData.orderId),
      totalPrice: paymentData.totalPrice,
      customerName: sanitizeInput(paymentData.customerName),
      customerEmail: sanitizeInput(paymentData.customerEmail),
      customerPhone: sanitizeInput(paymentData.customerPhone.replace(/\D/g, '')),
      customerAddress: sanitizeInput(paymentData.customerAddress),
      bookingType: sanitizeInput(paymentData.bookingType) as 'hotel' | 'taxi' | 'daycare',
      bookingDetails: sanitizeInput(paymentData.bookingDetails),
      userIp: userIp.split(',')[0].trim() // İlk IP'yi al
    }

    // Validate booking type
    if (!['hotel', 'taxi', 'daycare'].includes(sanitizedPaymentData.bookingType)) {
      return NextResponse.json({ 
        error: 'Geçersiz rezervasyon tipi' 
      }, { status: 400 })
    }

    // Create İyzico payment form
    const iyzicoResult = await iyzicoService.createPetfendyPayment(sanitizedPaymentData)

    if (iyzicoResult.status === 'success') {
      // Log successful payment form creation
      logSecurityEvent({
        type: 'PAYMENT_FORM_CREATED',
        details: { 
          orderId: sanitizedPaymentData.orderId,
          totalPrice: sanitizedPaymentData.totalPrice,
          bookingType: sanitizedPaymentData.bookingType,
          provider: 'iyzico'
        }
      })

      return NextResponse.json({
        success: true,
        checkoutFormContent: iyzicoResult.checkoutFormContent,
        token: iyzicoResult.token,
        conversationId: iyzicoResult.conversationId
      })
    } else {
      logSecurityEvent({
        type: 'PAYMENT_FORM_FAILED',
        details: { 
          orderId: sanitizedPaymentData.orderId,
          error: iyzicoResult.errorMessage,
          provider: 'iyzico'
        }
      })

      return NextResponse.json({ 
        error: 'Ödeme formu oluşturulamadı',
        details: iyzicoResult.errorMessage
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('İyzico payment creation error:', error)
    
    logSecurityEvent({
      type: 'PAYMENT_API_ERROR',
      details: { error: error.message, endpoint: 'POST /api/payment/iyzico' }
    })
    
    return NextResponse.json({ 
      error: 'Ödeme işlemi sırasında hata oluştu' 
    }, { status: 500 })
  }
}