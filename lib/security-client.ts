// Client-side password hashing (lightweight, no node deps)

export async function hashPasswordClient(password: string): Promise<string> {
  if (typeof crypto === 'undefined' || !('subtle' in crypto)) return password
  const enc = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  const hashArray = Array.from(new Uint8Array(digest))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPasswordClient(password: string, hash: string): Promise<boolean> {
  const h = await hashPasswordClient(password)
  return h === hash
}



