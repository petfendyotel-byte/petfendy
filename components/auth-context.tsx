"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { getCurrentUser, setCurrentUser, clearAllData, getAuthToken, setAuthToken } from "@/lib/storage"

interface AuthContextType {
  user: Partial<User> | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getCurrentUser()
    const token = getAuthToken()

    if (storedUser && token) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock authentication - check if admin
      const isAdmin = email === "admin@petfendy.com" && password === "admin123"
      
      const mockUser: Partial<User> = {
        id: isAdmin ? "admin-1" : "user-" + Date.now(),
        email,
        name: isAdmin ? "Admin User" : email.split('@')[0],
        role: isAdmin ? "admin" : "user",
      }

      const token = "mock_token_" + Date.now()
      setAuthToken(token)
      setCurrentUser(mockUser)
      setUser(mockUser)
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
      // Mock registration - in production, call your API
      const mockUser: Partial<User> = {
        id: Date.now().toString(),
        email,
        name,
        role: "user",
      }

      const token = "mock_token_" + Date.now()
      setAuthToken(token)
      setCurrentUser(mockUser)
      setUser(mockUser)
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
