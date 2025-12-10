// Risk Yönetimi Servisi
// 3D Secure fallback kuralları, risk değerlendirmesi

import type {
  RiskAssessment,
  RiskFactor,
  Non3DFallbackRule,
  InstallmentRule,
} from './types'

export class RiskManagementService {
  private non3DFallbackRule: Non3DFallbackRule = {
    enabled: true,
    maxAmount: 500, // TL
    allowedBINs: [],
    requireDeviceFingerprint: true,
    requirePreviousSuccess: true,
    velocityCheckWindowMinutes: 10,
    maxAttemptsPerWindow: 1,
  }

  private installmentRules: InstallmentRule[] = []
  private threeDSOutage = false

  /**
   * Non-3D fallback kuralını ayarla
   */
  setNon3DFallbackRule(rule: Non3DFallbackRule): void {
    this.non3DFallbackRule = rule
  }

  /**
   * Taksit kurallarını ayarla
   */
  setInstallmentRules(rules: InstallmentRule[]): void {
    this.installmentRules = rules
  }

  /**
   * 3D servis kesintisi bilgisi (monitoring entegrasyonu ile tetiklenebilir)
   */
  set3DOutage(isOutage: boolean): void {
    this.threeDSOutage = isOutage
  }

  is3DAvailable(): boolean {
    return !this.threeDSOutage
  }

  /**
   * Risk değerlendirmesi
   */
  async assessRisk(params: {
    amount: number
    cardBIN?: string
    deviceFingerprint?: string
    userId?: string
    previousSuccessCount?: number
    failedAttemptsInWindow?: number
    country?: string
    ipAddress?: string
  }): Promise<RiskAssessment> {
    const factors: RiskFactor[] = []
    let score = 0

    // Tutar kontrolü
    if (params.amount > 10000) {
      score += 30
      factors.push({
        type: 'amount',
        severity: 'high',
        message: `Yüksek tutar: ${params.amount} TL`,
      })
    } else if (params.amount > 5000) {
      score += 15
      factors.push({
        type: 'amount',
        severity: 'medium',
        message: `Orta yüksek tutar: ${params.amount} TL`,
      })
    }

    // BIN kontrolü
    if (params.cardBIN) {
      const isAllowedBIN = this.non3DFallbackRule.allowedBINs.includes(params.cardBIN)
      if (!isAllowedBIN && this.non3DFallbackRule.allowedBINs.length > 0) {
        score += 20
        factors.push({
          type: 'bin',
          severity: 'medium',
          message: 'BIN izinli listede değil',
        })
      }
    }

    // Velocity kontrolü
    if (params.failedAttemptsInWindow && params.failedAttemptsInWindow > 2) {
      score += 40
      factors.push({
        type: 'velocity',
        severity: 'high',
        message: `Son ${this.non3DFallbackRule.velocityCheckWindowMinutes} dakikada ${params.failedAttemptsInWindow} başarısız deneme`,
      })
    }

    // Kart geçmişi
    if (params.previousSuccessCount === 0) {
      score += 10
      factors.push({
        type: 'card_history',
        severity: 'low',
        message: 'İlk işlem',
      })
    }

    // Ülke/IP kontrolü (basit)
    if (params.country && params.country !== 'TR') {
      score += 20
      factors.push({
        type: 'country',
        severity: 'medium',
        message: `Ülke uyuşmazlığı: ${params.country}`,
      })
    }

    if (!params.ipAddress) {
      score += 10
      factors.push({
        type: 'device',
        severity: 'low',
        message: 'IP adresi bulunamadı',
      })
    }

    // Recommendation
    let recommendation: 'allow' | 'require_3d' | 'block'
    if (score >= 70) {
      recommendation = 'block'
    } else if (score >= 40) {
      recommendation = 'require_3d'
    } else {
      recommendation = 'allow'
    }

    return {
      score,
      factors,
      recommendation,
    }
  }

  /**
   * Non-3D fallback'e izin verilip verilmeyeceğini kontrol et
   */
  async canUseNon3DFallback(params: {
    amount: number
    cardBIN?: string
    deviceFingerprint?: string
    userId?: string
    previousSuccessCount?: number
    failedAttemptsInWindow?: number
  }): Promise<boolean> {
    if (!this.non3DFallbackRule.enabled) {
      return false
    }

    // Tutar kontrolü
    if (params.amount > this.non3DFallbackRule.maxAmount) {
      return false
    }

    // BIN kontrolü
    if (this.non3DFallbackRule.allowedBINs.length > 0) {
      if (!params.cardBIN || !this.non3DFallbackRule.allowedBINs.includes(params.cardBIN)) {
        return false
      }
    }

    // Device fingerprint kontrolü
    if (this.non3DFallbackRule.requireDeviceFingerprint) {
      if (!params.deviceFingerprint) {
        return false
      }
    }

    // Önceki başarılı işlem kontrolü
    if (this.non3DFallbackRule.requirePreviousSuccess) {
      if (!params.previousSuccessCount || params.previousSuccessCount === 0) {
        return false
      }
    }

    // Velocity kontrolü
    if (
      params.failedAttemptsInWindow &&
      params.failedAttemptsInWindow >= this.non3DFallbackRule.maxAttemptsPerWindow
    ) {
      return false
    }

    return true
  }

  /**
   * Taksit kurallarına göre izin verilen taksit sayılarını getir
   */
  getAllowedInstallments(amount: number, cardBIN?: string): number[] {
    const allowed: number[] = []

    for (const rule of this.installmentRules) {
      if (!rule.enabled) continue

      // Tutar kontrolü
      if (amount < rule.minAmount || amount > rule.maxAmount) {
        continue
      }

      // BIN kontrolü
      if (cardBIN) {
        if (rule.blockedBINs && rule.blockedBINs.includes(cardBIN)) {
          continue
        }
        if (rule.allowedBINs && rule.allowedBINs.length > 0) {
          if (!rule.allowedBINs.includes(cardBIN)) {
            continue
          }
        }
      }

      // İzin verilen taksitleri ekle
      allowed.push(...rule.allowedInstallments)
    }

    // Tekrarları kaldır ve sırala
    return [...new Set(allowed)].sort((a, b) => a - b)
  }
}

export const riskManagementService = new RiskManagementService()

