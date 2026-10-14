import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { DEFAULT_TAXI_PRICES, TAXI_PRICES_KEY, getSetting, setSetting, type TaxiPrices } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

const validPrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10000

// GET - Taksi km fiyatları (herkese açık; müşteri formu fiyatı buradan alır).
// Yönetici henüz kaydetmediyse saved: false ve varsayılan değerler döner.
export async function GET() {
  try {
    const saved = await getSetting<TaxiPrices>(TAXI_PRICES_KEY)
    if (saved && validPrice(saved.vipPricePerKm) && validPrice(saved.sharedPricePerKm)) {
      return NextResponse.json({ ...saved, saved: true })
    }
    return NextResponse.json({ ...DEFAULT_TAXI_PRICES, saved: false })
  } catch (error) {
    console.error('Taxi prices read error:', error)
    return NextResponse.json({ ...DEFAULT_TAXI_PRICES, saved: false })
  }
}

// PUT - Km fiyatlarını kaydet (yalnızca admin)
export const PUT = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    if (!validPrice(body?.vipPricePerKm) || !validPrice(body?.sharedPricePerKm)) {
      return NextResponse.json({ error: 'Fiyatlar 0 ile 10000 arasında bir sayı olmalı' }, { status: 400 })
    }
    const prices: TaxiPrices = { vipPricePerKm: body.vipPricePerKm, sharedPricePerKm: body.sharedPricePerKm }
    await setSetting(TAXI_PRICES_KEY, prices)
    logSecurityEvent({ type: 'TAXI_PRICES_UPDATED', userId: user.userId, details: prices as unknown as Record<string, unknown> })
    return NextResponse.json({ ...prices, saved: true })
  } catch (error) {
    console.error('Taxi prices save error:', error)
    return NextResponse.json({ error: 'Fiyatlar kaydedilemedi' }, { status: 500 })
  }
})
