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
import { useRecaptchaContext } from "@/components/recaptcha-provider"
import { Shield } from "lucide-react"

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuth()
  const t = useTranslations('auth');
  const { executeRecaptcha, isLoaded } = useRecaptchaContext()
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
      // Execute reCAPTCHA with production keys
      if (isLoaded) {
        console.log('🔄 [Login] Executing reCAPTCHA...')
        const recaptchaToken = await executeRecaptcha('login')
        console.log('🎫 [Login] reCAPTCHA token received:', !!recaptchaToken)
        
        if (!recaptchaToken) {
          console.error('❌ [Login] No reCAPTCHA token received')
          setError("Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyin ve tekrar deneyin.")
          return
        }

        // Verify reCAPTCHA token
        console.log('🔍 [Login] Verifying reCAPTCHA token...')
        const recaptchaResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: recaptchaToken,
            action: 'login',
            minScore: 0.5
          })
        })

        console.log('📡 [Login] reCAPTCHA API response status:', recaptchaResponse.status)
        
        if (!recaptchaResponse.ok) {
          const errorText = await recaptchaResponse.text()
          console.error('❌ [Login] reCAPTCHA API error:', errorText)
          setError(`Güvenlik doğrulaması hatası (${recaptchaResponse.status}). Lütfen tekrar deneyin.`)
          return
        }

        const recaptchaResult = await recaptchaResponse.json()
        console.log('📊 [Login] reCAPTCHA result:', recaptchaResult)
        
        if (!recaptchaResult.success) {
          console.error('❌ [Login] reCAPTCHA verification failed:', recaptchaResult.error)
          setError(`Güvenlik doğrulaması başarısız: ${recaptchaResult.error || 'Bilinmeyen hata'}`)
          return
        }
        
        console.log('✅ [Login] reCAPTCHA verification successful, score:', recaptchaResult.score)
      } else {
        console.error('❌ [Login] reCAPTCHA not loaded')
        setError("Güvenlik doğrulaması yükleniyor. Lütfen bekleyin ve tekrar deneyin.")
        return
      }

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
    } catch (err: any) {
      // Show the actual error message from auth context
      const errorMessage = err?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."
      setError(errorMessage)
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
            <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </AlertDescription>
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

          <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Giriş yapılıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t('loginTitle')}
              </div>
            )}
          </Button>

          {!isLoaded && (
            <div className="text-xs text-muted-foreground text-center">
              Güvenlik doğrulaması yükleniyor...
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
