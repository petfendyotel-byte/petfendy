"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRecaptchaContext } from "@/components/recaptcha-provider"
import { sanitizeInput, validateEmail, validatePhone } from "@/lib/security"
import { Shield, Send, CheckCircle } from "lucide-react"

interface ContactFormProps {
  locale: string
}

const content = {
  tr: {
    title: "Bize Ulaşın",
    subtitle: "Sorularınız, önerileriniz veya destek talepleriniz için formu doldurun",
    name: "Ad Soyad",
    namePlaceholder: "Adınız ve soyadınız",
    email: "E-posta",
    emailPlaceholder: "ornek@email.com",
    phone: "Telefon",
    phonePlaceholder: "+90 555 123 45 67",
    subject: "Konu",
    subjectPlaceholder: "Mesajınızın konusu",
    message: "Mesaj",
    messagePlaceholder: "Mesajınızı buraya yazın...",
    submit: "Mesaj Gönder",
    sending: "Gönderiliyor...",
    success: "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
    nameRequired: "Ad soyad gereklidir",
    emailRequired: "Geçerli bir e-posta adresi girin",
    phoneRequired: "Geçerli bir telefon numarası girin",
    subjectRequired: "Konu gereklidir",
    messageRequired: "Mesaj gereklidir",
    recaptchaError: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.",
    sendError: "Mesaj gönderilemedi. Lütfen tekrar deneyin."
  },
  en: {
    title: "Contact Us",
    subtitle: "Fill out the form for your questions, suggestions or support requests",
    name: "Full Name",
    namePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    phone: "Phone",
    phonePlaceholder: "+90 555 123 45 67",
    subject: "Subject",
    subjectPlaceholder: "Subject of your message",
    message: "Message",
    messagePlaceholder: "Write your message here...",
    submit: "Send Message",
    sending: "Sending...",
    success: "Your message has been sent successfully! We will get back to you as soon as possible.",
    nameRequired: "Full name is required",
    emailRequired: "Please enter a valid email address",
    phoneRequired: "Please enter a valid phone number",
    subjectRequired: "Subject is required",
    messageRequired: "Message is required",
    recaptchaError: "Security verification failed. Please try again.",
    sendError: "Message could not be sent. Please try again."
  }
}

export function ContactForm({ locale }: ContactFormProps) {
  const t = content[locale as keyof typeof content] || content.tr
  const { executeRecaptcha, isLoaded } = useRecaptchaContext()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    // Validation
    const newErrors: Record<string, string> = {}

    const sanitizedName = sanitizeInput(formData.name)
    if (sanitizedName.length < 2) {
      newErrors.name = t.nameRequired
    }

    const sanitizedEmail = sanitizeInput(formData.email)
    if (!validateEmail(sanitizedEmail)) {
      newErrors.email = t.emailRequired
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = t.phoneRequired
    }

    const sanitizedSubject = sanitizeInput(formData.subject)
    if (sanitizedSubject.length < 3) {
      newErrors.subject = t.subjectRequired
    }

    const sanitizedMessage = sanitizeInput(formData.message)
    if (sanitizedMessage.length < 10) {
      newErrors.message = t.messageRequired
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('contact')
      if (!recaptchaToken) {
        setErrors({ submit: t.recaptchaError })
        return
      }

      // Verify reCAPTCHA token
      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: recaptchaToken,
          action: 'contact',
          minScore: 0.5
        })
      })

      const recaptchaResult = await recaptchaResponse.json()
      if (!recaptchaResult.success) {
        setErrors({ submit: t.recaptchaError })
        return
      }

      // Send contact form
      const response = await fetch('/api/send-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedName,
          email: sanitizedEmail,
          phone: formData.phone,
          subject: sanitizedSubject,
          message: sanitizedMessage,
          recaptchaToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })

    } catch (error) {
      console.error('Contact form error:', error)
      setErrors({ submit: t.sendError })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-green-700">
            Mesajınız Gönderildi!
          </h3>
          <p className="text-muted-foreground mb-6">
            {t.success}
          </p>
          <Button 
            onClick={() => setSuccess(false)}
            variant="outline"
          >
            Yeni Mesaj Gönder
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t.name} *
              </label>
              <Input
                id="name"
                type="text"
                placeholder={t.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t.email} *
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t.phone}
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                {t.subject} *
              </label>
              <Input
                id="subject"
                type="text"
                placeholder={t.subjectPlaceholder}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={isLoading}
                required
              />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {t.message} *
            </label>
            <Textarea
              id="message"
              placeholder={t.messagePlaceholder}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={isLoading}
              rows={5}
              required
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !isLoaded}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.sending}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t.submit}
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