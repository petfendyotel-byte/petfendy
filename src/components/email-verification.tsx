"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { emailService } from "@/lib/email-service"
import { getPendingUser, clearPendingUser } from "@/lib/storage"
import type { User } from "@/lib/types"

interface EmailVerificationProps {
  onSuccess: (user: Partial<User>) => void
  onCancel: () => void
}

export function EmailVerification({ onSuccess, onCancel }: EmailVerificationProps) {
  const t = useTranslations('auth');
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Lütfen 6 haneli doğrulama kodunu girin")
      return
    }

    setIsLoading(true)
    try {
      const pendingUser = getPendingUser()
      
      if (!pendingUser || !pendingUser.verificationCode) {
        setError("Doğrulama bilgileri bulunamadı. Lütfen tekrar kayıt olun.")
        return
      }

      // Check expiry
      if (pendingUser.verificationCodeExpiry && new Date(pendingUser.verificationCodeExpiry) < new Date()) {
        setError("Doğrulama kodu süresi doldu. Lütfen yeni kod isteyin.")
        return
      }

      // Verify code
      if (pendingUser.verificationCode === verificationCode) {
        const verifiedUser = { 
          ...pendingUser, 
          emailVerified: true,
          verificationCode: undefined,
          verificationCodeExpiry: undefined
        }
        clearPendingUser()
        setSuccess(t('emailVerified'))
        setTimeout(() => {
          onSuccess(verifiedUser)
        }, 1000)
      } else {
        setError(t('invalidCode'))
      }
    } catch (err) {
      setError("Doğrulama başarısız. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const pendingUser = getPendingUser()
      
      if (!pendingUser || !pendingUser.email || !pendingUser.name) {
        setError("Kullanıcı bilgileri bulunamadı")
        return
      }

      // Generate new verification code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 15)

      const updatedUser = {
        ...pendingUser,
        verificationCode: newCode,
        verificationCodeExpiry: expiry
      }

      // Save to storage
      localStorage.setItem('petfendy_pending_user', JSON.stringify(updatedUser))

      // Send email
      await emailService.sendVerificationEmail(pendingUser.email, newCode, pendingUser.name)
      setSuccess("Yeni doğrulama kodu gönderildi!")
    } catch (err) {
      setError("Kod gönderilemedi. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('emailVerification')}</CardTitle>
        <CardDescription>{t('verificationSent')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              {t('verificationCode')}
            </label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              disabled={isLoading}
              required
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              E-posta adresinize gönderilen 6 haneli kodu girin
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Doğrulanıyor..." : t('verify')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResendCode}
              disabled={isLoading}
            >
              {t('resendCode')}
            </Button>

            <Button 
              type="button" 
              variant="ghost" 
              className="w-full" 
              onClick={onCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

