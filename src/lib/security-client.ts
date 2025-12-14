// Client-side password hashing using bcryptjs (browser-compatible)
import bcrypt from 'bcryptjs'

export async function hashPasswordClient(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPasswordClient(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}



