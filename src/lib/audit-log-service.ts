// Audit Log Servisi
// Tüm kritik işlemleri loglar
// PII maskeleme ile güvenli

import type { AuditLog } from './types'
import { sanitizeLogData } from './security-utils'

export class AuditLogService {
  private logs: AuditLog[] = []
  private maxLogs = 10000 // Maksimum log sayısı (memory'de)

  /**
   * Audit log ekle
   */
  async log(action: {
    userId?: string
    action: string
    entityType: string
    entityId: string
    changes?: Record<string, { old: any; new: any }>
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    // Hassas verileri maskele
    const sanitizedChanges = action.changes
      ? Object.entries(action.changes).reduce((acc, [key, value]) => {
          acc[key] = {
            old: sanitizeLogData(value.old),
            new: sanitizeLogData(value.new),
          }
          return acc
        }, {} as Record<string, { old: any; new: any }>)
      : undefined

    const sanitizedMetadata = action.metadata
      ? sanitizeLogData(action.metadata)
      : undefined

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      userId: action.userId,
      action: action.action,
      entityType: action.entityType,
      entityId: action.entityId,
      changes: sanitizedChanges,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      metadata: sanitizedMetadata,
      createdAt: new Date(),
    }

    this.logs.push(auditLog)

    // Maksimum log sayısını aşmışsa eski logları temizle
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Production'da burada veritabanına kayıt yapılacak
    console.log('[Audit Log]', {
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      userId: auditLog.userId,
      timestamp: auditLog.createdAt.toISOString(),
    })
  }

  /**
   * Log sorgulama
   */
  async query(filters: {
    userId?: string
    action?: string
    entityType?: string
    entityId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditLog[]> {
    let filtered = [...this.logs]

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId)
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    if (filters.entityType) {
      filtered = filtered.filter(log => log.entityType === filters.entityType)
    }

    if (filters.entityId) {
      filtered = filtered.filter(log => log.entityId === filters.entityId)
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => log.createdAt >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => log.createdAt <= filters.endDate!)
    }

    // Tarihe göre sırala (yeniden eskiye)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Limit uygula
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  /**
   * Belirli bir entity için logları getir
   */
  async getEntityLogs(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.query({
      entityType,
      entityId,
      limit,
    })
  }
}

export const auditLogService = new AuditLogService()

