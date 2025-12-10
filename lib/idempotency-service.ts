// Idempotency Servisi
// Aynı isteğin tekrar gönderilmesini engeller
// TTL: 24 saat

import type { IdempotencyRecord } from './types'
import { createHash } from 'crypto'

export class IdempotencyService {
  private records: Map<string, IdempotencyRecord> = new Map()
  private readonly TTL_MS = 24 * 60 * 60 * 1000 // 24 saat

  /**
   * Idempotency key oluştur
   */
  generateKey(orderId: string, userId?: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `${orderId}_${userId || 'guest'}_${timestamp}_${random}`
  }

  /**
   * İstek hash'i oluştur (request body'den)
   */
  createRequestHash(requestData: any): string {
    const dataString = JSON.stringify(requestData)
    return createHash('sha256').update(dataString).digest('hex')
  }

  /**
   * Idempotency kontrolü
   */
  async checkIdempotency(
    key: string,
    requestHash: string
  ): Promise<{ isDuplicate: boolean; existingResponse?: any }> {
    // Süresi dolmuş kayıtları temizle
    this.cleanExpiredRecords()

    const record = this.records.get(key)

    if (!record) {
      // Yeni kayıt oluştur
      const newRecord: IdempotencyRecord = {
        key,
        requestHash,
        status: 'pending',
        expiresAt: new Date(Date.now() + this.TTL_MS),
        createdAt: new Date(),
      }
      this.records.set(key, newRecord)
      return { isDuplicate: false }
    }

    // Request hash kontrolü - aynı istek mi?
    if (record.requestHash === requestHash) {
      if (record.status === 'completed' && record.response) {
        return {
          isDuplicate: true,
          existingResponse: record.response,
        }
      }
      // Hala pending veya failed, tekrar denemeye izin ver
      return { isDuplicate: false }
    }

    // Farklı request, yeni kayıt
    const newRecord: IdempotencyRecord = {
      key: `${key}_${Date.now()}`,
      requestHash,
      status: 'pending',
      expiresAt: new Date(Date.now() + this.TTL_MS),
      createdAt: new Date(),
    }
    this.records.set(newRecord.key, newRecord)
    return { isDuplicate: false }
  }

  /**
   * İşlem tamamlandı - response'u kaydet
   */
  async markCompleted(key: string, response: any): Promise<void> {
    const record = this.records.get(key)
    if (record) {
      record.status = 'completed'
      record.response = response
      this.records.set(key, record)
    }
  }

  /**
   * İşlem başarısız
   */
  async markFailed(key: string): Promise<void> {
    const record = this.records.get(key)
    if (record) {
      record.status = 'failed'
      this.records.set(key, record)
    }
  }

  /**
   * Süresi dolmuş kayıtları temizle
   */
  private cleanExpiredRecords(): void {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      if (record.expiresAt.getTime() < now) {
        this.records.delete(key)
      }
    }
  }

  /**
   * Manuel temizleme (opsiyonel)
   */
  async clearExpired(): Promise<number> {
    const before = this.records.size
    this.cleanExpiredRecords()
    return before - this.records.size
  }
}

export const idempotencyService = new IdempotencyService()

