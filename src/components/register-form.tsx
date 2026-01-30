"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { EmailVerification } from "./email-verification"
import { sanitizeInput, validateEmail, validatePassword, validatePhone } from "@/lib/security"
import { setPendingUser } from "@/lib/storage"
import { emailService } from "@/lib/email-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from 'next-intl';
import type { User } from "@/lib/types"

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register } = useAuth()
  const t = useTranslations('auth');
  const [showVerification, setShowVerification] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const sanitizedEmail = sanitizeInput(formData.email)
    if (!validateEmail(sanitizedEmail)) {
      newErrors.email = "Geçerli bir e-posta adresi girin"
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0]
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor"
    }

    const sanitizedName = sanitizeInput(formData.name)
    if (sanitizedName.length < 2) {
      newErrors.name = "Ad en az 2 karakter olmalıdır"
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Geçerli bir telefon numarası girin"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 15)

      // Store plain password temporarily - will be hashed when user completes verification
      const pendingUser: Partial<User> = {
        id: `user-${Date.now()}`,
        email: sanitizedEmail,
        name: sanitizedName,
        phone: formData.phone,
        password: formData.password, // Plain text temporarily
        role: "user",
        emailVerified: false,
        verificationCode,
        verificationCodeExpiry: expiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setPendingUser(pendingUser)

      await emailService.sendVerificationEmail(sanitizedEmail, verificationCode, sanitizedName)

      setShowVerification(true)
    } catch (err) {
      setErrors({ submit: "Kayıt başarısız. Lütfen tekrar deneyin." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSuccess = async (verifiedUser: Partial<User>) => {
    try {
      // Complete registration with verified user
      if (verifiedUser.email && verifiedUser.name && verifiedUser.phone && formData.password) {
        await register(verifiedUser.email, formData.password, verifiedUser.name, verifiedUser.phone)
        onSuccess?.()
      }
    } catch (err) {
      setErrors({ submit: "Kayıt tamamlanamadı. Lütfen giriş yapmayı deneyin." })
    }
  }

  const handleVerificationCancel = () => {
    setShowVerification(false)
  }

  if (showVerification) {
    return (
      <EmailVerification 
        onSuccess={handleVerificationSuccess} 
        onCancel={handleVerificationCancel}
      />
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('registerTitle')}</CardTitle>
        <CardDescription>Petfendy hesabı oluşturun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('name')}
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ahmet Yılmaz"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('phone')}
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+90 555 123 45 67"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isLoading}
              required
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              required
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('confirmPassword')}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Kayıt yapılıyor..." : t('registerTitle')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}