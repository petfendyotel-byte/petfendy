import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const smsProvider = process.env.SMS_PROVIDER
    const netgsmUsername = process.env.NETGSM_USERNAME
    const netgsmPassword = process.env.NETGSM_PASSWORD
    const netgsmSender = process.env.NETGSM_SENDER
    const adminPhone = process.env.ADMIN_PHONE
    const forceMock = process.env.SMS_FORCE_MOCK

    return NextResponse.json({
      status: 'SMS Configuration Debug',
      environment: process.env.NODE_ENV || 'development',
      smsProvider: {
        exists: !!smsProvider,
        value: smsProvider || 'not set',
        isValid: ['netgsm', 'twilio', 'mock'].includes(smsProvider || '')
      },
      forceMockMode: {
        exists: !!forceMock,
        value: forceMock || 'false',
        enabled: forceMock === 'true'
      },
      netgsmUsername: {
        exists: !!netgsmUsername,
        value: netgsmUsername ? netgsmUsername.substring(0, 5) + '...' : 'not set'
      },
      netgsmPassword: {
        exists: !!netgsmPassword,
        value: netgsmPassword ? '***' + netgsmPassword.slice(-3) : 'not set'
      },
      netgsmSender: {
        exists: !!netgsmSender,
        value: netgsmSender || 'not set'
      },
      adminPhone: {
        exists: !!adminPhone,
        value: adminPhone ? adminPhone.substring(0, 3) + '***' + adminPhone.slice(-2) : 'not set'
      },
      configured: !!(smsProvider && netgsmUsername && netgsmPassword),
      recommendations: [
        forceMock === 'true' ? '✅ Mock mode enabled - SMS will be logged only' : '⚠️ Real SMS mode - check NetGSM panel',
        !netgsmSender ? '❌ NETGSM_SENDER not set' : '✅ Sender configured',
        !adminPhone ? '❌ ADMIN_PHONE not set' : '✅ Admin phone configured'
      ],
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message
    }, { status: 500 })
  }
}