// Client-side storage management with security considerations
import type { User, CartItem } from "./types"

const STORAGE_PREFIX = "petfendy_"
const TOKEN_KEY = `${STORAGE_PREFIX}auth_token`
const USER_KEY = `${STORAGE_PREFIX}user`
const CART_KEY = `${STORAGE_PREFIX}cart`
const PENDING_USER_KEY = `${STORAGE_PREFIX}pending_user`

// Secure token storage
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

// User data storage
export function setCurrentUser(user: Partial<User>): void {
  if (typeof window !== "undefined") {
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
  }
}

export function getCurrentUser(): Partial<User> | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearCurrentUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY)
  }
}

// Cart management
export function getCart(): CartItem[] {
  if (typeof window !== "undefined") {
    const cart = localStorage.getItem(CART_KEY)
    return cart ? JSON.parse(cart) : []
  }
  return []
}

export function setCart(items: CartItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }
}

export function clearCart(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_KEY)
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existingItem = cart.find((i) => i.type === item.type && i.itemId === item.itemId)

  if (existingItem) {
    existingItem.quantity += item.quantity
  } else {
    cart.push(item)
  }

  setCart(cart)
  
  // Dispatch custom event for cart updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

export function removeFromCart(itemId: string): void {
  const cart = getCart()
  const filtered = cart.filter((item) => item.id !== itemId)
  setCart(filtered)
  
  // Dispatch custom event for cart updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

export function clearAllData(): void {
  if (typeof window !== "undefined") {
    clearAuthToken()
    clearCurrentUser()
    clearCart()
  }
}

// Pending user storage (for email verification)
export function setPendingUser(user: Partial<User>): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_USER_KEY, JSON.stringify(user))
  }
}

export function getPendingUser(): Partial<User> | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem(PENDING_USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearPendingUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_USER_KEY)
  }
}
