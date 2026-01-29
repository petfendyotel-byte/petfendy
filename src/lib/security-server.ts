// Server-side password hashing (argon2id -> bcrypt fallback)
import type { Options as ArgonOptions } from 'argon2'

const ARGON2_OPTIONS: ArgonOptions & { type: number } = {
  type: 2, // argon2id
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 4,
}

function isArgon2Hash(hash: string): boolean {
  return hash.startsWith('$argon2')
}

export async function hashPasswordServer(password: string): Promise<string> {
  try {
    const argon2 = await import('argon2')
    return argon2.default
      ? argon2.default.hash(password, ARGON2_OPTIONS as any)
      : (argon2 as any).hash(password, ARGON2_OPTIONS as any)
  } catch (error) {
    console.warn('Argon2 hash başarısız, bcrypt ile devam ediliyor:', error)
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, 12)
  }
}

export async function verifyPasswordServer(password: string, hash: string): Promise<boolean> {
  try {
    if (isArgon2Hash(hash)) {
      const argon2 = await import('argon2')
      return argon2.default
        ? argon2.default.verify(hash, password)
        : (argon2 as any).verify(hash, password)
    }
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}



