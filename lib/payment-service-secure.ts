// Secure Payment Service with PCI DSS Compliance
//
// ⚠️ IMPORTANT: Payment Processing Architecture
//
// DEVELOPMENT/TEST MODE:
//   - Mock payment processing for testing UI flows
//   - Card data validated but NOT sent anywhere
//   - Safe for development testing
//
// PRODUCTION MODE (PayTR):
//   - Card data goes DIRECTLY to PayTR iframe (never touches our servers)
//   - We only receive payment tokens/callbacks from PayTR
//   - Full PCI DSS compliance through PayTR
//
// PayTR Integration Guide:
// 1. Use PayTR iFrame API - card data never touches your server
// 2. Server-side: Generate merchant_oid, hash, and iframe token
// 3. Client-side: Embed PayTR iframe with the token
// 4. Callback: Receive payment result via webhook

import { validateCardNumber, validateCVV, maskCardNumber, generatePaymentNonce, sanitizeForStorage } from './encryption';
import { sanitizeInput } from './security';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

export interface SecurePaymentRequest {
  amount: number
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
  email: string
}

// PayTR iframe token request (server-side only)
export interface PayTRIframeRequest {
  amount: number
  email: string
  userName: string
  userPhone: string
  userAddress: string
  basketItems: Array<{
    name: string
    price: string
    quantity: number
  }>
}

// PayTR iframe response
export interface PayTRIframeResponse {
  success: boolean
  iframeToken?: string
  error?: string
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
   * ⚠️ DEVELOPMENT/TEST MODE ONLY
   *
   * This method processes mock payments for testing UI flows.
   * In production, use PayTR iframe - card data should NEVER touch our servers!
   */
  async processPayment(request: SecurePaymentRequest): Promise<SecurePaymentResponse> {
    // 🚨 BLOCK in production - use PayTR iframe instead!
    if (isProduction) {
      console.error("❌ [SECURITY] Direct card processing blocked in production!");
      console.error("❌ Use PayTR iframe API instead - see generatePayTRIframeToken()");
      return {
        success: false,
        message: "Bu ödeme yöntemi production ortamında kullanılamaz. Lütfen PayTR iframe kullanın.",
        errorCode: "PRODUCTION_BLOCKED",
      };
    }

    try {
      console.log("💳 [TEST MODE] Processing mock payment...");
      console.warn("⚠️ This is TEST MODE - no real payment processing!");

      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(request.email);
      const sanitizedHolder = sanitizeInput(request.cardHolder);
      const cleanedCard = request.cardNumber.replace(/\s/g, '');

      // Validate amount
      if (request.amount <= 0) {
        return {
          success: false,
          message: "Geçersiz tutar",
          errorCode: "INVALID_AMOUNT",
        };
      }

      if (request.amount > 1000000) {
        return {
          success: false,
          message: "Tutar limiti aşıldı",
          errorCode: "AMOUNT_LIMIT_EXCEEDED",
        };
      }

      // Validate card number using Luhn algorithm
      if (!validateCardNumber(cleanedCard)) {
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

      // Generate mock transaction ID
      const transactionId = `TEST-${Date.now()}-${generatePaymentNonce().substring(0, 8)}`;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log payment (NO sensitive data)
      const secureLog: SecurePaymentLog = {
        timestamp: new Date(),
        transactionId,
        amount: request.amount,
        status: 'success',
        maskedCard: maskCardNumber(cleanedCard),
        email: sanitizedEmail,
      };

      this.paymentLogs.push(secureLog);

      console.log("✅ [TEST MODE] Mock payment successful:", transactionId);

      return {
        success: true,
        transactionId,
        message: "Ödeme başarılı (TEST MODE)",
      };

    } catch (error: any) {
      console.error("❌ [TEST MODE] Error:", error.message);
      return {
        success: false,
        message: "Ödeme işlemi başarısız oldu",
        errorCode: "PAYMENT_FAILED",
      };
    }
  }

  /**
   * 🔐 PRODUCTION: Generate PayTR iFrame Token
   *
   * This should be called from a SERVER-SIDE API route only!
   * The token is used to embed PayTR's secure payment iframe.
   * Card data is entered directly into PayTR's iframe - never touches our servers.
   */
  async generatePayTRIframeToken(request: PayTRIframeRequest): Promise<PayTRIframeResponse> {
    // Validate environment
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error("❌ PayTR credentials not configured!");
      return {
        success: false,
        error: "Ödeme sistemi yapılandırılmamış",
      };
    }

    try {
      // Generate unique order ID
      const merchantOid = `ORDER-${Date.now()}-${generatePaymentNonce().substring(0, 8)}`;

      // Prepare basket items for PayTR
      const userBasket = btoa(JSON.stringify(request.basketItems.map(item => [
        item.name,
        item.price,
        item.quantity
      ])));

      // Amount in kuruş (TRY cents)
      const paymentAmount = Math.round(request.amount * 100);

      // Required fields
      const userIp = "127.0.0.1"; // Get from request in actual implementation
      const noInstallment = "1"; // No installment
      const maxInstallment = "0";
      const currency = "TL";
      const testMode = isProduction ? "0" : "1";

      // Callback URLs
      const merchantOkUrl = process.env.PAYTR_SUCCESS_URL || "https://petfendy.com/payment/success";
      const merchantFailUrl = process.env.PAYTR_FAIL_URL || "https://petfendy.com/payment/fail";

      // Create hash string (PayTR specific format)
      const hashStr = `${merchantId}${userIp}${merchantOid}${request.email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;

      // Generate HMAC hash
      const crypto = await import('crypto');
      const paytrToken = crypto
        .createHmac('sha256', merchantKey)
        .update(hashStr + merchantSalt)
        .digest('base64');

      // Call PayTR API to get iframe token
      const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          merchant_id: merchantId,
          user_ip: userIp,
          merchant_oid: merchantOid,
          email: request.email,
          payment_amount: paymentAmount.toString(),
          paytr_token: paytrToken,
          user_basket: userBasket,
          debug_on: testMode,
          no_installment: noInstallment,
          max_installment: maxInstallment,
          user_name: sanitizeInput(request.userName),
          user_address: sanitizeInput(request.userAddress),
          user_phone: sanitizeInput(request.userPhone),
          merchant_ok_url: merchantOkUrl,
          merchant_fail_url: merchantFailUrl,
          timeout_limit: "30",
          currency: currency,
          test_mode: testMode,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        console.log("✅ [PayTR] iFrame token generated successfully");
        return {
          success: true,
          iframeToken: result.token,
        };
      } else {
        console.error("❌ [PayTR] Token generation failed:", result.reason);
        return {
          success: false,
          error: result.reason || "PayTR token oluşturulamadı",
        };
      }

    } catch (error: any) {
      console.error("❌ [PayTR] API Error:", error.message);
      return {
        success: false,
        error: "Ödeme sistemi bağlantı hatası",
      };
    }
  }

  /**
   * 🔐 PRODUCTION: Verify PayTR Callback (Webhook)
   *
   * Called by PayTR when payment is complete.
   * Validates the hash to ensure callback is authentic.
   */
  async verifyPayTRCallback(callbackData: {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
  }): Promise<{ verified: boolean; status: 'success' | 'failed' }> {
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      console.error("❌ PayTR credentials not configured for callback verification!");
      return { verified: false, status: 'failed' };
    }

    try {
      const crypto = await import('crypto');

      // Recreate hash to verify authenticity
      const hashStr = `${callbackData.merchant_oid}${merchantSalt}${callbackData.status}${callbackData.total_amount}`;
      const expectedHash = crypto
        .createHmac('sha256', merchantKey)
        .update(hashStr)
        .digest('base64');

      if (expectedHash !== callbackData.hash) {
        console.error("❌ [PayTR] Invalid callback hash - possible tampering!");
        return { verified: false, status: 'failed' };
      }

      const isSuccess = callbackData.status === 'success';

      // Log the verified payment
      const log: SecurePaymentLog = {
        timestamp: new Date(),
        transactionId: callbackData.merchant_oid,
        amount: parseInt(callbackData.total_amount) / 100, // Convert from kuruş
        status: isSuccess ? 'success' : 'failed',
        maskedCard: '****', // PayTR doesn't send card info in callback
        email: '', // Would need to look up from order
      };
      this.paymentLogs.push(log);

      console.log(`${isSuccess ? '✅' : '❌'} [PayTR] Payment ${callbackData.merchant_oid}: ${callbackData.status}`);

      return {
        verified: true,
        status: isSuccess ? 'success' : 'failed',
      };

    } catch (error: any) {
      console.error("❌ [PayTR] Callback verification error:", error.message);
      return { verified: false, status: 'failed' };
    }
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

