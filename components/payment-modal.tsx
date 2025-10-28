"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { processPayment } from "@/lib/payment-service-secure"
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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate card number using Luhn algorithm (industry standard)
    const cardDigits = formData.cardNumber.replace(/\s/g, '')
    if (!validateCardNumber(cardDigits)) {
      newErrors.cardNumber = "Geçersiz kart numarası"
    }

    // Validate card holder (prevent special characters)
    const cardHolderRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/
    if (formData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Kart sahibi adı en az 3 karakter olmalıdır"
    } else if (!cardHolderRegex.test(formData.cardHolder)) {
      newErrors.cardHolder = "Kart sahibi adı sadece harf içermelidir"
    }

    // Validate expiry date (MM/YY)
    const expiryParts = formData.expiryDate.split('/')
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiryDate = "Son kullanma tarihi geçersiz (AA/YY)"
    } else {
      const month = parseInt(expiryParts[0])
      const year = parseInt(expiryParts[1])
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = "Geçersiz ay"
      }
      
      // Check if card is expired
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = "Kartın süresi dolmuş"
      }
    }

    // Validate CVV using secure validation
    if (!validateCVV(formData.cvv)) {
      newErrors.cvv = "CVV geçersiz (3-4 hane)"
    }

    // Validate invoice information based on type
    if (invoiceType === "individual") {
      if (!invoiceInfo.individualName.trim()) {
        newErrors.individualName = "Ad alanı zorunludur"
      }
      if (!invoiceInfo.individualSurname.trim()) {
        newErrors.individualSurname = "Soyad alanı zorunludur"
      }
      if (!invoiceInfo.individualTcNo.trim()) {
        newErrors.individualTcNo = "TC Kimlik No zorunludur"
      } else if (!/^\d{11}$/.test(invoiceInfo.individualTcNo)) {
        newErrors.individualTcNo = "TC Kimlik No 11 haneli olmalıdır"
      }
    } else {
      if (!invoiceInfo.corporateName.trim()) {
        newErrors.corporateName = "Şirket adı zorunludur"
      }
      if (!invoiceInfo.corporateTaxNo.trim()) {
        newErrors.corporateTaxNo = "Vergi No zorunludur"
      } else if (!/^\d{10}$/.test(invoiceInfo.corporateTaxNo)) {
        newErrors.corporateTaxNo = "Vergi No 10 haneli olmalıdır"
      }
      if (!invoiceInfo.corporateAddress.trim()) {
        newErrors.corporateAddress = "Şirket adresi zorunludur"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    try {
      const paymentResult = await processPayment({
        amount: totalAmount,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        email: userEmail,
      })

      if (paymentResult.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          // Reset form
          setFormData({
            cardNumber: "",
            cardHolder: "",
            expiryDate: "",
            cvv: "",
          })
          setSuccess(false)
        }, 2000)
      } else {
        setErrors({ submit: paymentResult.message || t('paymentFailed') })
      }
    } catch (err) {
      setErrors({ submit: t('paymentFailed') })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            Güvenli ödeme - Tüm bilgileriniz şifrelenir
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {t('paymentSuccess')}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="cardNumber" className="text-sm font-medium">
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
                  className="pl-10"
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="cardHolder" className="text-sm font-medium">
                {t('cardHolder')}
              </label>
              <Input
                id="cardHolder"
                type="text"
                placeholder="AD SOYAD"
                value={formData.cardHolder}
                onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                disabled={isProcessing}
                required
              />
              {errors.cardHolder && <p className="text-sm text-destructive">{errors.cardHolder}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiryDate" className="text-sm font-medium">
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
                />
                {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="cvv" className="text-sm font-medium flex items-center gap-1">
                  {t('cvv')}
                  <Lock className="w-3 h-3" />
                </label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                  disabled={isProcessing}
                  required
                  maxLength={3}
                />
                {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
              </div>
            </div>

            {/* Invoice Type Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fatura Türü</label>
                <Select value={invoiceType} onValueChange={(value: "individual" | "corporate") => setInvoiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Bireysel Fatura
                      </div>
                    </SelectItem>
                    <SelectItem value="corporate">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Kurumsal Fatura
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Individual Invoice Form */}
              {invoiceType === "individual" && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Bireysel Fatura Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Ad</label>
                      <Input
                        placeholder="Adınız"
                        value={invoiceInfo.individualName}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualName: e.target.value })}
                        disabled={isProcessing}
                      />
                      {errors.individualName && <p className="text-xs text-destructive">{errors.individualName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Soyad</label>
                      <Input
                        placeholder="Soyadınız"
                        value={invoiceInfo.individualSurname}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualSurname: e.target.value })}
                        disabled={isProcessing}
                      />
                      {errors.individualSurname && <p className="text-xs text-destructive">{errors.individualSurname}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">TC Kimlik No</label>
                    <Input
                      placeholder="12345678901"
                      value={invoiceInfo.individualTcNo}
                      onChange={(e) => setInvoiceInfo({ ...invoiceInfo, individualTcNo: e.target.value.replace(/\D/g, '').substring(0, 11) })}
                      disabled={isProcessing}
                      maxLength={11}
                    />
                    {errors.individualTcNo && <p className="text-xs text-destructive">{errors.individualTcNo}</p>}
                  </div>
                </div>
              )}

              {/* Corporate Invoice Form */}
              {invoiceType === "corporate" && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Kurumsal Fatura Bilgileri</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Şirket Adı</label>
                      <Input
                        placeholder="Şirket Adı"
                        value={invoiceInfo.corporateName}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateName: e.target.value })}
                        disabled={isProcessing}
                      />
                      {errors.corporateName && <p className="text-xs text-destructive">{errors.corporateName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Vergi No</label>
                      <Input
                        placeholder="1234567890"
                        value={invoiceInfo.corporateTaxNo}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateTaxNo: e.target.value.replace(/\D/g, '').substring(0, 10) })}
                        disabled={isProcessing}
                        maxLength={10}
                      />
                      {errors.corporateTaxNo && <p className="text-xs text-destructive">{errors.corporateTaxNo}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Şirket Adresi</label>
                      <Input
                        placeholder="Şirket adresi"
                        value={invoiceInfo.corporateAddress}
                        onChange={(e) => setInvoiceInfo({ ...invoiceInfo, corporateAddress: e.target.value })}
                        disabled={isProcessing}
                      />
                      {errors.corporateAddress && <p className="text-xs text-destructive">{errors.corporateAddress}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('totalAmount')}:</span>
                <span className="text-2xl font-bold text-primary">₺{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                İptal
              </Button>
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? t('processing') : t('payNow')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

