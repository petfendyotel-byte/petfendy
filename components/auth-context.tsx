"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { getCurrentUser, setCurrentUser, clearAllData, getAuthToken, setAuthToken } from "@/lib/storage"
import { generateToken, verifyToken, verifyPassword, hashPassword } from "@/lib/security"

interface AuthContextType {
  user: Partial<User> | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Test users database - In production, this should be in a secure backend database
// WARNING: This is for DEVELOPMENT/TEST environment only
const TEST_USERS_DB: Map<string, { passwordHash: string; user: Partial<User> }> = new Map()

// Initialize test admin user (works in both dev and production for demo purposes)
// HARDCODED for reliability - environment variables with $ characters cause issues
const testAdminEmail = 'petfendyotel@gmail.com'
// Password: ErikUzum52707+.
const testAdminPasswordHash = '$2b$12$1nEZKNLzKANQ7AfOKWzBueUBIRTMYQcoOwjILo7a1pbqetqJzMHbG'

// Always initialize admin user
TEST_USERS_DB.set(testAdminEmail, {
  passwordHash: testAdminPasswordHash,
  user: {
    id: 'admin-1',
    email: testAdminEmail,
    name: 'Admin User',
    role: 'admin'
  }
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in and token is valid
    const storedUser = getCurrentUser()
    const token = getAuthToken()

    if (storedUser && token) {
      // Verify token is still valid
      const { valid } = verifyToken(token)
      if (valid) {
        setUser(storedUser)
      } else {
        // Token expired or invalid, clear data
        clearAllData()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email ve şifre gereklidir')
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Geçerli bir email adresi giriniz')
      }

      // Get reCAPTCHA token if available (optional)
      const recaptchaToken = (window as any).lastRecaptchaToken || undefined

      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(recaptchaToken && { recaptchaToken }) // Only include if available
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız')
      }

      if (!data.success) {
        throw new Error(data.error || 'Giriş başarısız')
      }

      // Store tokens and user data
      if (data.tokens) {
        setAuthToken(data.tokens.accessToken)
        // Store refresh token securely (in production, use httpOnly cookies)
        localStorage.setItem('petfendy_refresh_token', data.tokens.refreshToken)
      }

      setCurrentUser(data.user)
      setUser(data.user)

      console.log(`✅ User logged in: ${email} (${data.user.role})`)
      
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, phone: string) => {
    setIsLoading(true)
    try {
      // Input validation
      if (!email || !password || !name) {
        throw new Error('Email, şifre ve isim gereklidir')
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Geçerli bir email adresi giriniz')
      }

      // Name validation
      if (name.length < 2 || name.length > 50) {
        throw new Error('İsim 2-50 karakter arasında olmalıdır')
      }

      // Phone validation (if provided)
      if (phone && !/^(\+90|0)?[1-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
        throw new Error('Geçerli bir telefon numarası giriniz')
      }

      // Password strength validation
      if (password.length < 8) {
        throw new Error('Şifre en az 8 karakter olmalıdır')
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
      }

      // Get reCAPTCHA token if available (optional)
      const recaptchaToken = (window as any).lastRecaptchaToken || undefined

      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          ...(recaptchaToken && { recaptchaToken }) // Only include if available
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt başarısız')
      }

      if (!data.success) {
        throw new Error(data.error || 'Kayıt başarısız')
      }

      // Store tokens and user data
      if (data.tokens) {
        setAuthToken(data.tokens.accessToken)
        // Store refresh token securely (in production, use httpOnly cookies)
        localStorage.setItem('petfendy_refresh_token', data.tokens.refreshToken)
      }

      setCurrentUser(data.user)
      setUser(data.user)

      console.log(`✅ New user registered: ${email}`)
      
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear all authentication data
    clearAllData()
    setUser(null)
    
    // Clear any cached login attempts
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('login_attempts_')) {
        localStorage.removeItem(key)
      }
    })
    
    // Log logout (for security monitoring)
    console.log('✅ User logged out')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
