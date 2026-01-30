"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { sanitizeInput, validateEmail } from "@/lib/security"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from 'next-intl';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const t = useTranslations('auth');
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Input validation
    const sanitizedEmail = sanitizeInput(email)
    if (!validateEmail(sanitizedEmail)) {
      setError("Geçerli bir e-posta adresi girin")
      return
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır")
      return
    }

    setIsLoading(true)
    try {
      await login(sanitizedEmail, password)
      onSuccess?.()
      
      // Check if user has items in cart and redirect to cart
      if (typeof window !== 'undefined') {
        const cart = localStorage.getItem('petfendy_cart')
        if (cart && JSON.parse(cart).length > 0) {
          // User will be redirected to cart tab automatically by parent component
          console.log('User has items in cart, will be redirected to cart')
        }
      }
    } catch (err) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('loginTitle')}</CardTitle>
        <CardDescription>Petfendy hesabınıza giriş yapın</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : t('loginTitle')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
