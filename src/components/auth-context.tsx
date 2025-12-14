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

// Initialize test admin user only in development
if (process.env.NODE_ENV === 'development') {
  // Admin credentials from environment variables (set in .env.local)
  const testAdminEmail = process.env.NEXT_PUBLIC_TEST_ADMIN_EMAIL
  const testAdminPasswordHash = process.env.NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH

  if (testAdminEmail && testAdminPasswordHash) {
    TEST_USERS_DB.set(testAdminEmail, {
      passwordHash: testAdminPasswordHash,
      user: {
        id: 'admin-1',
        email: testAdminEmail,
        name: 'Admin User',
        role: 'admin'
      }
    })
  }
}

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
      // Check if running in production without proper backend
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('Authentication backend not configured for production')
      }

      // Look up user in test database
      const userRecord = TEST_USERS_DB.get(email)

      if (!userRecord) {
        // Simulate timing to prevent user enumeration
        await new Promise(resolve => setTimeout(resolve, 500))
        throw new Error('Geçersiz email veya şifre')
      }

      // Verify password against hash
      const isValidPassword = await verifyPassword(password, userRecord.passwordHash)

      if (!isValidPassword) {
        throw new Error('Geçersiz email veya şifre')
      }

      // Generate secure JWT token
      const token = generateToken(
        userRecord.user.id!,
        userRecord.user.email!,
        userRecord.user.role
      )

      setAuthToken(token)
      setCurrentUser(userRecord.user)
      setUser(userRecord.user)
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
      // Check if running in production without proper backend
      if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('Registration backend not configured for production')
      }

      // Check if user already exists
      if (TEST_USERS_DB.has(email)) {
        throw new Error('Bu email adresi zaten kayıtlı')
      }

      // Hash password securely
      const passwordHash = await hashPassword(password)

      // Create new user
      const newUser: Partial<User> = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        role: "user",
      }

      // Store in test database (development only)
      if (process.env.NODE_ENV === 'development') {
        TEST_USERS_DB.set(email, {
          passwordHash,
          user: newUser
        })
      }

      // Generate secure JWT token
      const token = generateToken(newUser.id!, email, 'user')

      setAuthToken(token)
      setCurrentUser(newUser)
      setUser(newUser)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAllData()
    setUser(null)
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
