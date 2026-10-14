import prisma from '@/lib/prisma'

// Basit anahtar-değer ayar tablosu (ör. taksi km fiyatları). Şema değişikliği canlıda otomatik uygulanmadığı için
// tablo ilk kullanımda oluşturulur. Yalnızca ham SQL kullanılır (Prisma modeli gerekmez).
let ready: Promise<void> | null = null

async function init(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "site_settings" (
      "key" TEXT NOT NULL PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function ensureSettingsTable(): Promise<void> {
  if (!ready) {
    ready = init().catch((error) => {
      ready = null
      throw error
    })
  }
  return ready
}

export async function getSetting<T>(key: string): Promise<T | null> {
  await ensureSettingsTable()
  const rows = await prisma.$queryRaw<{ value: string }[]>`SELECT "value" FROM "site_settings" WHERE "key" = ${key}`
  if (rows.length === 0) return null
  try {
    return JSON.parse(rows[0].value) as T
  } catch {
    return null
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await ensureSettingsTable()
  const json = JSON.stringify(value)
  await prisma.$executeRaw`
    INSERT INTO "site_settings" ("key", "value", "updatedAt") VALUES (${key}, ${json}, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = CURRENT_TIMESTAMP
  `
}

export interface TaxiPrices {
  vipPricePerKm: number
  sharedPricePerKm: number
}

export const TAXI_PRICES_KEY = 'taxi_prices'
export const DEFAULT_TAXI_PRICES: TaxiPrices = { vipPricePerKm: 15, sharedPricePerKm: 8 }
