// MFA Servisi (TOTP + SMS/Email OTP)
// Admin ve yüksek riskli işlemler için zorunlu; son kullanıcıya opsiyonel

import { authenticator } from 'otplib'
import bcrypt from 'bcryptjs'
import { notificationService } from './notification-service'
import type { MFASettings, MFAVerification } from './types'

type MFAMethod = 'sms' | 'totp' | 'email'

interface UserMFAState {
  settings: MFASettings
  secret?: string // TOTP secret (base32)
  backupCodes?: string[] // hashed
}

/**
 * In-memory MFA store (prod'da DB)
 */
class MFAStore {
  private store: Map<string, UserMFAState> = new Map()
  private verifications: Map<string, MFAVerification> = new Map()

  get(userId: string): UserMFAState | undefined {
    return this.store.get(userId)
  }

  set(userId: string, value: UserMFAState): void {
    this.store.set(userId, value)
  }

  saveVerification(record: MFAVerification): void {
    this.verifications.set(record.userId, record)
  }

  getVerification(userId: string): MFAVerification | undefined {
    return this.verifications.get(userId)
  }

  clearVerification(userId: string): void {
    this.verifications.delete(userId)
  }
}

const mfaStore = new MFAStore()

function generateBackupCodes(count = 6): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).slice(-10)
    codes.push(code)
  }
  return codes
}

async function hashCodes(codes: string[]): Promise<string[]> {
  const result: string[] = []
  for (const code of codes) {
    const hash = await bcrypt.hash(code, 10)
    result.push(hash)
  }
  return result
}

async function verifyHashedCode(code: string, hashedCodes?: string[]): Promise<boolean> {
  if (!hashedCodes) return false
  for (const hash of hashedCodes) {
    if (await bcrypt.compare(code, hash)) {
      return true
    }
  }
  return false
}

export class MFAService {
  /**
   * MFA etkinleştir (TOTP veya SMS/Email)
   */
  async enableMFA(userId: string, settings: MFASettings): Promise<{ secret?: string; backupCodes?: string[] }> {
    const state: UserMFAState = {
      settings,
    }

    // TOTP için secret üret
    if (settings.methods.includes('totp')) {
      state.secret = authenticator.generateSecret()
    }

    // Backup kodları üret ve hash'le
    const backupCodes = generateBackupCodes()
    state.backupCodes = await hashCodes(backupCodes)

    mfaStore.set(userId, state)

    return {
      secret: state.secret,
      backupCodes,
    }
  }

  /**
   * TOTP kodu doğrula
   */
  verifyTOTP(userId: string, token: string): boolean {
    const state = mfaStore.get(userId)
    if (!state?.secret) return false
    return authenticator.verify({ token, secret: state.secret })
  }

  /**
   * SMS/Email OTP oluştur ve gönder
   */
  async sendOTP(params: { userId: string; method: Exclude<MFAMethod, 'totp'>; recipient: string }): Promise<MFAVerification> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60_000) // 15 dk

    const record: MFAVerification = {
      userId: params.userId,
      method: params.method,
      code,
      expiresAt,
      verified: false,
      createdAt: new Date(),
    }

    mfaStore.saveVerification(record)

    // Bildirim gönder
    if (params.method === 'sms') {
      await notificationService.sendNotification({
        userId: params.userId,
        type: 'payment_preauth', // tip placeholder
        channel: 'sms',
        recipient: params.recipient,
        customMessage: `Doğrulama kodunuz: ${code}`,
      })
    } else if (params.method === 'email') {
      await notificationService.sendNotification({
        userId: params.userId,
        type: 'payment_preauth',
        channel: 'email',
        recipient: params.recipient,
        customSubject: 'MFA Doğrulama Kodu',
        customMessage: `Doğrulama kodunuz: ${code}`,
      })
    }

    return record
  }

  /**
   * OTP doğrula (SMS/Email)
   */
  verifyOTP(userId: string, code: string): boolean {
    const record = mfaStore.getVerification(userId)
    if (!record) return false
    if (record.expiresAt.getTime() < Date.now()) {
      return false
    }
    const ok = record.code === code
    if (ok) {
      record.verified = true
      mfaStore.saveVerification(record)
    }
    return ok
  }

  /**
   * Backup kod doğrula
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const state = mfaStore.get(userId)
    if (!state?.backupCodes) return false
    return verifyHashedCode(code, state.backupCodes)
  }
}

export const mfaService = new MFAService()

