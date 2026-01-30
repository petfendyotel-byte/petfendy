"use client"

import { useState, useRef } from "react"
import { useTranslations } from 'next-intl';
import { sanitizeString, sanitizeNumber, createSubmissionGuard } from "@/lib/input-sanitizer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processIyzicoPayment } from "@/lib/iyzico-service"
import { validateCardNumber, validateCVV } from "@/lib/encryption"
import { CreditCard, Lock, User, Building2 } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  cartItems: CartItem[]
  totalAmount: number
  userEmail: string
}

export function PaymentModal({ isOpen, onClose, onSuccess, cartItems, totalAmount, userEmail }: PaymentModalProps) {
  const t = useTranslations('payment');
  
  // Security guards
  const submissionGuard = useRef(createSubmissionGuard())
  
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })
  const [invoiceType, setInvoiceType] = useState<"individual" | "corporate">("individual")
  const [invoiceInfo, setInvoiceInfo] = useState({
    individualName: "",
    individualSurname: "",
    individualTcNo: "",
    corporateName: "",
    corporateTaxNo: "",
    corporateAddress: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Enhanced input formatters with sanitization
  const formatCardNumber = (value: string) => {
    const sanitized = sanitizeString(value)
    const cleaned = sanitized.replace(/\D/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const sanitized = sanitizeString(value)
    const cleaned = sanitized.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData({ ...formData, cardNumber: formatted })
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setFormData({ ...formData, expiryDate: formatted })
  }

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeString(e.target.value).toUpperCase()
    // Only allow letters, spaces, and Turkish characters
    const filtered = sanitized.replace(/[^A-ZÇĞİÖŞÜ\s]/g, '')
    setFormData({ ...formData, cardHolder: filtered })
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeString(e.target.value)
    const cleaned = sanitized.replace(/\D/g, '').substring(0, 4)
    setFormData({ ...formData, cvv: cleaned })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Sanitize all inputs before validation
    const sanitizedCardNumber = sanitizeString(formData.cardNumber)
    const sanitizedCardHolder = sanitizeString(formData.cardHolder)
    const sanitizedExpiryDate = sanitizeString(formData.expiryDate)
    const sanitizedCVV = sanitizeString(formData.cvv)

    // Validate card number using Luhn algorithm (industry standard)
    const cardDigits = sanitizedCardNumber.replace(/\s/g, '')
    if (!validateCardNumber(cardDigits)) {
      newErrors.cardNumber = "Geçersiz kart numarası"
    }

    // Enhanced card holder validation
    if (sanitizedCardHolder.trim().length < 3) {
      newErrors.cardHolder = "Kart sahibi adı en az 3 karakter olmalıdır"
    } else if (sanitizedCardHolder.trim().length > 50) {
      newErrors.cardHolder = "Kart sahibi adı en fazla 50 karakter olabilir"
    } else if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(sanitizedCardHolder)) {
      newErrors.cardHolder = "Kart sahibi adı sadece harf içermelidir"
    }

    // Enhanced expiry date validation
    const expiryParts = sanitizedExpiryDate.split('/')
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiryDate = "Son kullanma tarihi geçersiz (AA/YY)"
    } else {
      const month = parseInt(expiryParts[0])
      const year = parseInt(expiryParts[1])
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = "Geçersiz ay (01-12)"
      }
      
      if (year < 0 || year > 99) {
        newErrors.expiryDate = "Geçersiz yıl"
      }
      
      // Check if card is expired
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = "Kartın süresi dolmuş"
      }
      
      // Check if expiry is too far in future (more than 10 years)
      const fullYear = year < 50 ? 2000 + year : 1900 + year
      const maxYear = new Date().getFullYear() + 10
      if (fullYear > maxYear) {
        newErrors.expiryDate = "Son kullanma tarihi çok uzak gelecekte"
      }
    }

    // Enhanced CVV validation
    if (!validateCVV(sanitizedCVV)) {
      newErrors.cvv = "CVV geçersiz (3-4 hane)"
    }

    // Enhanced invoice information validation
    if (invoiceType === "individual") {
      const sanitizedName = sanitizeString(invoiceInfo.individualName)
      const sanitizedSurname = sanitizeString(invoiceInfo.individualSurname)
      const sanitizedTcNo = sanitizeString(invoiceInfo.individualTcNo)

      if (!sanitizedName.trim() || sanitizedName.length < 2) {
        newErrors.individualName = "Ad en az 2 karakter olmalıdır"
      }
      if (!sanitizedSurname.trim() || sanitizedSurname.length < 2) {
        newErrors.individualSurname = "Soyad en az 2 karakter olmalıdır"
      }
      if (!sanitizedTcNo.trim()) {
        newErrors.individualTcNo = "TC Kimlik No zorunludur"
      } else if (!/^\d{11}$/.test(sanitizedTcNo)) {
        newErrors.individualTcNo = "TC Kimlik No 11 haneli olmalıdır"
      } else {
        // Basic TC Kimlik No validation algorithm
        const digits = sanitizedTcNo.split('').map(Number)
        const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
        const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
        const check1 = (sum1 * 7 - sum2) % 10
        const check2 = (sum1 + sum2 + digits[9]) % 10
        
        if (check1 !== digits[9] || check2 !== digits[10]) {
          newErrors.individualTcNo = "Geçersiz TC Kimlik No"
        }
      }
    } else {
      const sanitizedCompanyName = sanitizeString(invoiceInfo.corporateName)
      const sanitizedTaxNo = sanitizeString(invoiceInfo.corporateTaxNo)
      const sanitizedAddress = sanitizeString(invoiceInfo.corporateAddress)

      if (!sanitizedCompanyName.trim() || sanitizedCompanyName.length < 2) {
        newErrors.corporateName = "Şirket adı en az 2 karakter olmalıdır"
      }
      if (!sanitizedTaxNo.trim()) {
        newErrors.corporateTaxNo = "Vergi No zorunludur"
      } else if (!/^\d{10}$/.test(sanitizedTaxNo)) {
        newErrors.corporateTaxNo = "Vergi No 10 haneli olmalıdır"
      }
      if (!sanitizedAddress.trim() || sanitizedAddress.length < 10) {
        newErrors.corporateAddress = "Şirket adresi en az 10 karakter olmalıdır"
      }
    }

    // Validate total amount
    const sanitizedAmount = sanitizeNumber(totalAmount)
    if (sanitizedAmount <= 0 || sanitizedAmount > 1000000) {
      newErrors.submit = "Geçersiz ödeme tutarı"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    const formId = `payment-${Date.now()}`
    if (!submissionGuard.current.canSubmit(formId)) {
      setErrors({ submit: "İşlem devam ediyor, lütfen bekleyin" })
      return
    }

    setErrors({})
    setSuccess(false)

    if (!validateForm()) {
      submissionGuard.current.reset(formId)
      return
    }

    setIsProcessing(true)
    
    try {
      // Sanitize all payment data before processing
      const sanitizedPaymentData = {
        amount: sanitizeNumber(totalAmount),
        cardNumber: sanitizeString(formData.cardNumber).replace(/\s/g, ''),
        cardHolder: sanitizeString(formData.cardHolder),
        expiryDate: sanitizeString(formData.expiryDate),
        cvv: sanitizeString(formData.cvv),
        email: sanitizeString(userEmail),
      }

      // Additional security checks
      if (sanitizedPaymentData.amount <= 0 || sanitizedPaymentData.amount > 1000000) {
        throw new Error("Geçersiz ödeme tutarı")
      }

      if (sanitizedPaymentData.cardNumber.length < 13 || sanitizedPaymentData.cardNumber.length > 19) {
        throw new Error("Geçersiz kart numarası uzunluğu")
      }

      const paymentResult = await processIyzicoPayment(sanitizedPaymentData)

      if (paymentResult.success) {
        setSuccess(true)
        
        // Clear sensitive data from memory
        setFormData({
          cardNumber: "",
          cardHolder: "",
          expiryDate: "",
          cvv: "",
        })
        
        setTimeout(() => {
          onSuccess()
          onClose()
          setSuccess(false)
        }, 2000)
      } else {
        submissionGuard.current.reset(formId)
        setErrors({ submit: paymentResult.message || t('paymentFailed') })
      }
    } catch (err: any) {
      submissionGuard.current.reset(formId)
      console.error('Payment error:', err)
      setErrors({ submit: err.message || t('paymentFailed') })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Güvenli ödeme - Tüm bilgileriniz şifrelenir
          </DialogDescription>
        </DialogHeader>

        {/* Test Card Info */}
        <Alert className="border-blue-200 bg-blue-50 py-2">
          <AlertDescription className="text-blue-800 text-xs sm:text-sm">
            <strong>Test Kartı (İyzico):</strong><br />
            Kart: 5528 7900 0000 0004<br />
            Tarih: 12/30 | CVV: 123
          </AlertDescription>
        </Alert>

        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {t('paymentSuccess')}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="cardNumber" className="text-xs sm:text-sm font-medium">
                {t('cardNumber')}
              </label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  disabled={isProcessing}
                  required
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label htmlFor="cardHolder" className="text-xs sm:text-sm font-medium">
                {t('cardHolder')}
              </label>
              <Input
                id="cardHolder"
                type="text"
                placeholder="AD SOYAD"
                value={formData.cardHolder}
                onChange={handleCardHolderChange}
                disabled={isProcessing}
                required
                className="h-9 sm:h-10 text-sm"
              />
              {errors.cardHolder && <p className="text-xs text-destructive">{errors.cardHolder}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="expiryDate" className="text-xs sm:text-sm font-medium">
                  {t('expiryDate')}
                </label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleExpiryDateChange}
                  disabled={isProcessing}
                  required
                  maxLength={5}
                  className="h-9 sm:h-10 text-sm"
                />
                {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate}</p>}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="cvv" className="text-xs sm:text-sm font-medium flex items-center gap-1">
                  {t('cvv')}
                  <Lock className="w-3 h-3" />
                </label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleCVVChange}
                  disabled={isProcessing}
                  required
                  maxLength={3}
                  className="h-9 sm:h-10 text-sm"
                />
                {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
              </div>
            </div>

            {/* Invoice Type Selection */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Fatura Türü</label>
                <Select value={invoiceType} onValueChange={(value: "individual" | "corporate") => setInvoiceType(value)}>
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        Bireysel Fatura
                      </div>
                    </SelectItem>
                    <SelectItem value="corporate">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4" />
                        Kurumsal Fatura
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Individual Invoice Form */}
              {invoiceType === "individual" && (
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-xs sm:text-sm">Bireysel Fatura Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Ad</label>
                      <Input
                        placeholder="Adınız"
                        value={invoiceInfo.individualName}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualName: sanitizeString(e.target.value) })}
                        disabled={isProcessing}
                        maxLength={50}
                        className="h-8 sm:h-9 text-sm"
                      />
                      {errors.individualName && <p className="text-xs text-destructive">{errors.individualName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Soyad</label>
                      <Input
                        placeholder="Soyadınız"
                        value={invoiceInfo.individualSurname}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualSurname: sanitizeString(e.target.value) })}
                        disabled={isProcessing}
                        maxLength={50}
                        className="h-8 sm:h-9 text-sm"
                      />
                      {errors.individualSurname && <p className="text-xs text-destructive">{errors.individualSurname}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">TC Kimlik No</label>
                    <Input
                      placeholder="12345678901"
                      value={invoiceInfo.individualTcNo}
                      onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualTcNo: sanitizeString(e.target.value).replace(/\D/g, '').substring(0, 11) })}
                      disabled={isProcessing}
                      maxLength={11}
                      className="h-8 sm:h-9 text-sm"
                    />
                    {errors.individualTcNo && <p className="text-xs text-destructive">{errors.individualTcNo}</p>}
                  </div>
                </div>
              )}

              {/* Corporate Invoice Form */}
              {invoiceType === "corporate" && (
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-xs sm:text-sm">Kurumsal Fatura Bilgileri</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Şirket Adı</label>
                      <Input
                        placeholder="Şirket Adı"
                        value={invoiceInfo.corporateName}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateName: sanitizeString(e.target.value) })}
                        disabled={isProcessing}
                        maxLength={100}
                        className="h-8 sm:h-9 text-sm"
                      />
                      {errors.corporateName && <p className="text-xs text-destructive">{errors.corporateName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Vergi No</label>
                      <Input
                        placeholder="1234567890"
                        value={invoiceInfo.corporateTaxNo}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateTaxNo: sanitizeString(e.target.value).replace(/\D/g, '').substring(0, 10) })}
                        disabled={isProcessing}
                        maxLength={10}
                        className="h-8 sm:h-9 text-sm"
                      />
                      {errors.corporateTaxNo && <p className="text-xs text-destructive">{errors.corporateTaxNo}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Şirket Adresi</label>
                      <Input
                        placeholder="Şirket adresi"
                        value={invoiceInfo.corporateAddress}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateAddress: sanitizeString(e.target.value) })}
                        disabled={isProcessing}
                        maxLength={200}
                        className="h-8 sm:h-9 text-sm"
                      />
                      {errors.corporateAddress && <p className="text-xs text-destructive">{errors.corporateAddress}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted p-3 sm:p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm sm:text-base">{t('totalAmount')}:</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">₺{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 h-10 sm:h-11 text-sm"
              >
                İptal
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1 h-10 sm:h-11 text-sm">
                {isProcessing ? t('processing') : t('payNow')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

