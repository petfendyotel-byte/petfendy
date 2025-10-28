// Secure Payment Service with PCI DSS Compliance
// Card data is encrypted and NEVER stored
// Uses tokenization for card references

import { encryptData, validateCardNumber, validateCVV, tokenizeCard, maskCardNumber, generatePaymentNonce, sanitizeForStorage } from './encryption';
import { sanitizeInput } from './security';

export interface SecurePaymentRequest {
  amount: number
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  email: string
}

export interface SecurePaymentResponse {
  success: boolean
  transactionId?: string
  cardToken?: string // Tokenized card for future reference
  message?: string
  errorCode?: string
}

export interface SecurePaymentLog {
  timestamp: Date
  transactionId: string
  amount: number
  status: 'success' | 'failed'
  maskedCard: string
  email: string
  // NO SENSITIVE DATA - PCI DSS Compliant
}

class SecurePaymentService {
  private paymentLogs: SecurePaymentLog[] = [];

  /**
   * Process payment securely with PCI DSS compliance
   * 1. Validates card data
   * 2. Encrypts sensitive information
   * 3. Never stores actual card data
   * 4. Returns tokenized card reference
   */
  async processPayment(request: SecurePaymentRequest): Promise<SecurePaymentResponse> {
    try {
      console.log("💳 [Secure Payment] Processing payment (PCI DSS MODE)...");
      
      // Sanitize inputs to prevent injection attacks
      const sanitizedEmail = sanitizeInput(request.email);
      const sanitizedHolder = sanitizeInput(request.cardHolder);
      const cleanedCard = request.cardNumber.replace(/\s/g, '');
      
      // Validate amount (prevent negative amounts and suspiciously large amounts)
      if (request.amount <= 0) {
        return {
          success: false,
          message: "Geçersiz tutar",
          errorCode: "INVALID_AMOUNT",
        };
      }

      if (request.amount > 1000000) {
        console.warn("⚠️ [Security] Suspiciously large payment amount detected");
        return {
          success: false,
          message: "Tutar limiti aşıldı",
          errorCode: "AMOUNT_LIMIT_EXCEEDED",
        };
      }

      // Validate card number using Luhn algorithm (prevents typos)
      if (!validateCardNumber(cleanedCard)) {
        console.warn("⚠️ [Security] Invalid card number detected");
        return {
          success: false,
          message: "Geçersiz kart numarası",
          errorCode: "INVALID_CARD",
        };
      }

      // Validate CVV
      if (!validateCVV(request.cvv)) {
        return {
          success: false,
          message: "Geçersiz CVV",
          errorCode: "INVALID_CVV",
        };
      }

      // Validate expiry date
      const [month, year] = request.expiryDate.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        return {
          success: false,
          message: "Geçersiz son kullanma tarihi formatı",
          errorCode: "INVALID_EXPIRY_FORMAT",
        };
      }

      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        return {
          success: false,
          message: "Kartın süresi dolmuş",
          errorCode: "CARD_EXPIRED",
        };
      }

      // Generate unique transaction ID with timestamp
      const transactionId = `TXN-${Date.now()}-${generatePaymentNonce().substring(0, 8)}`;
      
      // Tokenize card for future reference (PCI DSS: Don't store actual card)
      const cardToken = tokenizeCard(cleanedCard);
      
      // Encrypt card data before transmission to payment gateway
      const encryptedData = this.encryptPaymentData({
        cardNumber: cleanedCard,
        cvv: request.cvv,
        expiryDate: request.expiryDate,
        cardHolder: sanitizedHolder,
      });

      // In production: Send encrypted data to payment gateway
      // Example: Stripe, PayTR, İyzico, etc.
      await this.callPaymentGateway(encryptedData, request.amount, sanitizedEmail);

      // Log payment SECURELY (absolutely NO sensitive data)
      const secureLog: SecurePaymentLog = {
        timestamp: new Date(),
        transactionId,
        amount: request.amount,
        status: 'success',
        maskedCard: maskCardNumber(cleanedCard),
        email: sanitizedEmail,
      };
      
      this.paymentLogs.push(secureLog);
      
      console.log("✅ [Secure Payment] Payment successful:", transactionId);
      console.log("🔒 [Security] Card data encrypted and NOT stored");
      console.log("🎫 [Token] Card token generated:", cardToken);

      return {
        success: true,
        transactionId,
        cardToken, // Return token for future reference
        message: "Ödeme başarılı",
      };

    } catch (error: any) {
      console.error("❌ [Secure Payment] Error:", error.message);
      
      // Log error WITHOUT sensitive data
      this.logSecureError({
        timestamp: new Date(),
        error: error.message,
        amount: request.amount,
      });

      return {
        success: false,
        message: "Ödeme işlemi başarısız oldu",
        errorCode: "PAYMENT_FAILED",
      };
    }
  }

  /**
   * Encrypt payment data before transmission
   */
  private encryptPaymentData(data: {
    cardNumber: string
    cvv: string
    expiryDate: string
    cardHolder: string
  }): string {
    const combinedData = JSON.stringify({
      card: data.cardNumber,
      cvv: data.cvv,
      exp: data.expiryDate,
      name: data.cardHolder,
      timestamp: Date.now(),
    });

    return encryptData(combinedData);
  }

  /**
   * Call payment gateway with encrypted data
   * In production: Replace with actual payment gateway API call
   */
  private async callPaymentGateway(encryptedData: string, amount: number, email: string): Promise<void> {
    console.log("🔐 [Payment Gateway] Sending encrypted payment data...");
    console.log("🔐 Encrypted payload (first 30 chars):", encryptedData.substring(0, 30) + "...");
    console.log("💰 Amount:", amount);
    console.log("📧 Email:", email);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In production, call actual payment gateway:
    /*
    const response = await fetch('https://api.payment-gateway.com/v1/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_SECRET}`,
        'X-API-Version': '2024-01',
      },
      body: JSON.stringify({
        encrypted_data: encryptedData,
        amount: amount,
        currency: 'TRY',
        email: email,
        metadata: {
          merchant_id: process.env.MERCHANT_ID,
          timestamp: Date.now(),
        }
      })
    });

    if (!response.ok) {
      throw new Error('Payment gateway error');
    }

    const result = await response.json();
    return result;
    */
  }

  /**
   * Process refund with security checks
   */
  async refundPayment(transactionId: string, amount: number, reason: string): Promise<SecurePaymentResponse> {
    console.log("🔄 [Secure Payment] Processing refund...");
    console.log("Transaction ID:", transactionId);
    console.log("Refund Amount:", amount);
    console.log("Reason:", sanitizeInput(reason));

    // Find original payment log
    const originalPayment = this.paymentLogs.find(log => log.transactionId === transactionId);
    
    if (!originalPayment) {
      return {
        success: false,
        message: "İşlem bulunamadı",
        errorCode: "TRANSACTION_NOT_FOUND",
      };
    }

    // Validate refund amount
    if (amount <= 0 || amount > originalPayment.amount) {
      return {
        success: false,
        message: "Geçersiz iade tutarı",
        errorCode: "INVALID_REFUND_AMOUNT",
      };
    }

    // Simulate refund processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Log refund securely
    const refundLog: SecurePaymentLog = {
      timestamp: new Date(),
      transactionId: `REFUND-${transactionId}`,
      amount: -amount, // Negative for refund
      status: 'success',
      maskedCard: originalPayment.maskedCard,
      email: originalPayment.email,
    };
    
    this.paymentLogs.push(refundLog);
    console.log("✅ [Secure Payment] Refund processed successfully");

    return {
      success: true,
      transactionId: refundLog.transactionId,
      message: "İade işlemi başarılı",
    };
  }

  /**
   * Get sanitized payment logs (NO sensitive data)
   */
  getPaymentLogs(): SecurePaymentLog[] {
    return this.paymentLogs.map(log => sanitizeForStorage(log));
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<{ verified: boolean; status?: string; amount?: number }> {
    const payment = this.paymentLogs.find(log => log.transactionId === transactionId);
    
    if (!payment) {
      return { verified: false };
    }

    return {
      verified: true,
      status: payment.status,
      amount: payment.amount,
    };
  }

  /**
   * Log errors securely (NO sensitive data)
   */
  private logSecureError(error: { timestamp: Date; error: string; amount: number }): void {
    console.error("❌ [Secure Payment Error]", {
      timestamp: error.timestamp.toISOString(),
      error: error.error,
      amount: error.amount,
      // NO card data, NO personal data
    });
  }
}

export const securePaymentService = new SecurePaymentService();

// Helper function for secure payment processing
export async function processPayment(request: SecurePaymentRequest): Promise<SecurePaymentResponse> {
  return securePaymentService.processPayment(request);
}

