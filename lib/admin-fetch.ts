import { getAuthToken, setAuthToken } from '@/lib/storage'

// Yönetim paneli bileşenlerinin ortak kullandığı istek yardımcıları (yalnızca tarayıcıda çalışır).

async function refreshToken(): Promise<boolean> {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem('petfendy_refresh_token') : null
  if (!refresh) return false
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    })
    if (!response.ok) return false
    const data = await response.json()
    const access = data.data?.tokens?.accessToken
    if (!access) return false
    setAuthToken(access)
    if (data.data?.tokens?.refreshToken) localStorage.setItem('petfendy_refresh_token', data.data.tokens.refreshToken)
    return true
  } catch {
    return false
  }
}

// Giriş bilgisiyle istek atar; oturum süresi dolmuşsa (401) yenileyip bir kez tekrar dener.
export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const send = () => fetch(url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${getAuthToken()}` } })
  let response = await send()
  if (response.status === 401 && (await refreshToken())) response = await send()
  return response
}

// Sunucudan gelen hata iletisini okunur hâle getirir.
export async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}))
  if (response.status === 401) return 'Oturum sona erdi. Lütfen çıkış yapıp tekrar giriş yapın.'
  return body.error ? `${body.error}` : fallback
}

// Bir resmi /api/upload ile yükler, depodaki adresini döndürür.
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('type', 'image')
  const response = await authFetch('/api/upload', { method: 'POST', body: form })
  if (!response.ok) throw new Error(await errorMessage(response, 'Yükleme başarısız'))
  const data = await response.json()
  const url = data?.file?.url
  if (!url) throw new Error('Yükleme adresi alınamadı')
  return url
}
