import { NextRequest, NextResponse } from 'next/server'
import { wafService } from '@/lib/waf-service'
import { protectAPI } from '@/lib/api-waf-middleware'

// WAF Management API - Admin only
export async function GET(request: NextRequest) {
  // Protect this admin endpoint
  const protection = await protectAPI(request, {
    endpoint: 'admin-waf',
    maxRequests: 50,
    windowMs: 60 * 1000
  })

  if (!protection.allowed) {
    return protection.response!
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = wafService.getAttackStats()
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            blockedIPs: wafService.getBlockedIPs()
          },
          timestamp: new Date().toISOString()
        })

      case 'blocked-ips':
        return NextResponse.json({
          success: true,
          data: {
            blockedIPs: wafService.getBlockedIPs(),
            count: wafService.getBlockedIPs().length
          },
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'WAF Management API',
            availableActions: ['stats', 'blocked-ips'],
            usage: {
              stats: 'GET /api/admin/waf?action=stats',
              blockedIPs: 'GET /api/admin/waf?action=blocked-ips',
              blockIP: 'POST /api/admin/waf with { action: "block", ip: "x.x.x.x" }',
              unblockIP: 'POST /api/admin/waf with { action: "unblock", ip: "x.x.x.x" }'
            }
          },
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('WAF admin API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Protect this admin endpoint
  const protection = await protectAPI(request, {
    endpoint: 'admin-waf-post',
    maxRequests: 20,
    windowMs: 60 * 1000
  })

  if (!protection.allowed) {
    return protection.response!
  }

  try {
    const { action, ip } = await request.json()

    if (!action || !ip) {
      return NextResponse.json(
        { success: false, error: 'Action and IP are required' },
        { status: 400 }
      )
    }

    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address format' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'block':
        wafService.blockIP(ip)
        console.log(`[WAF ADMIN] IP ${ip} manually blocked`)
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been blocked`,
          timestamp: new Date().toISOString()
        })

      case 'unblock':
        wafService.unblockIP(ip)
        console.log(`[WAF ADMIN] IP ${ip} manually unblocked`)
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been unblocked`,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "block" or "unblock"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('WAF admin POST error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}