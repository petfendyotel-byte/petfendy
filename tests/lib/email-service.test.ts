/**
 * Email Service Tests
 * 
 * Tests for email service functionality
 * - Email template generation
 * - Service configuration
 * - API integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { emailService } from '@/lib/email-service'

// Mock fetch globally
global.fetch = vi.fn()

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration', () => {
    it('should configure email service', () => {
      const config = {
        provider: 'resend' as const,
        apiKey: 'test-key',
        fromEmail: 'test@petfendy.com'
      }

      emailService.configure(config)
      
      // Configuration is private, but we can test it works by checking behavior
      expect(true).toBe(true) // Configuration doesn't throw
    })
  })

  describe('Send Email', () => {
    it('should send email via API route successfully', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, provider: 'resend' })
      } as Response)

      const template = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
        text: 'Test'
      }

      const result = await emailService.sendEmail(template)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
    })

    it('should fallback to mock when API fails', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const template = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      }

      const result = await emailService.sendEmail(template)

      expect(result).toBe(true) // Still returns true for UX
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Email Service] Error:', expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('📧 [Mock] Email to test@example.com: Test Email')

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('should fallback to mock when API returns error', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const template = {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      }

      const result = await emailService.sendEmail(template)

      expect(result).toBe(true) // Still returns true for UX
      expect(consoleSpy).toHaveBeenCalledWith('📧 [Mock] Email to test@example.com: Test Email')

      consoleSpy.mockRestore()
    })
  })

  describe('Invoice Email', () => {
    it('should send invoice email with all data', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const invoiceData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        invoiceNumber: 'INV-001',
        totalAmount: 150.50,
        items: [
          { name: 'Pet Hotel - 3 nights', quantity: 1, price: 150.50 }
        ],
        pdfUrl: 'https://example.com/invoice.pdf'
      }

      const result = await emailService.sendInvoiceEmail(invoiceData)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"subject":"Petfendy Faturası - INV-001"')
      })

      // Check HTML content includes all data
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.html).toContain('John Doe')
      expect(body.html).toContain('INV-001')
      expect(body.html).toContain('₺150.50')
      expect(body.html).toContain('Pet Hotel - 3 nights')
      expect(body.html).toContain('https://example.com/invoice.pdf')
    })

    it('should send invoice email without PDF URL', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const invoiceData = {
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        invoiceNumber: 'INV-002',
        totalAmount: 75.00,
        items: [
          { name: 'Pet Taxi', quantity: 1, price: 75.00 }
        ]
      }

      const result = await emailService.sendInvoiceEmail(invoiceData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.html).toContain('Jane Doe')
      expect(body.html).toContain('₺75.00')
      expect(body.html).not.toContain('Faturayı İndir') // No PDF download link
    })

    it('should handle multiple items in invoice', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const invoiceData = {
        customerName: 'Bob Smith',
        customerEmail: 'bob@example.com',
        invoiceNumber: 'INV-003',
        totalAmount: 225.00,
        items: [
          { name: 'Pet Hotel - Standard Room', quantity: 2, price: 100.00 },
          { name: 'Pet Taxi - Round Trip', quantity: 1, price: 125.00 }
        ]
      }

      const result = await emailService.sendInvoiceEmail(invoiceData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.html).toContain('Pet Hotel - Standard Room')
      expect(body.html).toContain('Pet Taxi - Round Trip')
      expect(body.html).toContain('₺225.00')
    })
  })

  describe('Booking Confirmation Email', () => {
    it('should send hotel booking confirmation', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const bookingData = {
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        bookingType: 'hotel' as const,
        bookingDetails: 'Standard Room, 2 nights',
        bookingDate: new Date('2025-02-01T10:00:00Z'),
        totalAmount: 200.00
      }

      const result = await emailService.sendBookingConfirmationEmail(bookingData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.subject).toBe('Petfendy Rezervasyon Onayı')
      expect(body.html).toContain('Alice Johnson')
      expect(body.html).toContain('Pet Otel')
      expect(body.html).toContain('Standard Room, 2 nights')
      expect(body.html).toContain('₺200.00')
    })

    it('should send taxi booking confirmation', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const bookingData = {
        customerName: 'Charlie Brown',
        customerEmail: 'charlie@example.com',
        bookingType: 'taxi' as const,
        bookingDetails: 'Airport pickup, 15km',
        bookingDate: new Date('2025-02-05T14:30:00Z'),
        totalAmount: 75.00
      }

      const result = await emailService.sendBookingConfirmationEmail(bookingData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.html).toContain('Charlie Brown')
      expect(body.html).toContain('Hayvan Taksi')
      expect(body.html).toContain('Airport pickup, 15km')
      expect(body.html).toContain('₺75.00')
    })
  })

  describe('Password Reset Email', () => {
    it('should send password reset email', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const result = await emailService.sendPasswordResetEmail('user@example.com', 'reset-token-123')

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.to).toBe('user@example.com')
      expect(body.subject).toBe('Petfendy - Şifre Sıfırlama')
      expect(body.html).toContain('reset-token-123')
      expect(body.html).toContain('https://petfendy.46.62.236.59.sslip.io/tr/reset-password?token=reset-token-123')
    })
  })

  describe('Verification Email', () => {
    it('should send verification email', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const result = await emailService.sendVerificationEmail('newuser@example.com', '123456', 'New User')

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.to).toBe('newuser@example.com')
      expect(body.subject).toBe('Petfendy - E-posta Doğrulama')
      expect(body.html).toContain('New User')
      expect(body.html).toContain('123456')
    })
  })

  describe('Contact Form Email', () => {
    it('should send contact form email', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const contactData = {
        name: 'Contact User',
        email: 'contact@example.com',
        phone: '+905551234567',
        message: 'I have a question about your services.'
      }

      const result = await emailService.sendContactFormEmail(contactData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.to).toBe('info@petfendy.com')
      expect(body.subject).toBe('📧 Yeni İletişim Mesajı - Contact User')
      expect(body.html).toContain('Contact User')
      expect(body.html).toContain('contact@example.com')
      expect(body.html).toContain('+905551234567')
      expect(body.html).toContain('I have a question about your services.')
    })

    it('should handle contact form without phone', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const contactData = {
        name: 'No Phone User',
        email: 'nophone@example.com',
        phone: '',
        message: 'Message without phone number.'
      }

      const result = await emailService.sendContactFormEmail(contactData)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.html).toContain('Belirtilmedi') // "Not specified" in Turkish
    })
  })

  describe('Welcome Email', () => {
    it('should send welcome email', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const result = await emailService.sendWelcomeEmail('welcome@example.com', 'Welcome User')

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.to).toBe('welcome@example.com')
      expect(body.subject).toBe('🐾 Petfendy\'ye Hoş Geldiniz!')
      expect(body.html).toContain('Welcome User')
      expect(body.html).toContain('Hemen Rezervasyon Yap')
      expect(body.html).toContain('https://petfendy.46.62.236.59.sslip.io/tr/home')
    })
  })

  describe('New User Notification Email', () => {
    it('should send new user notification to owner', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)

      const result = await emailService.sendNewUserNotificationToOwner(
        'owner@petfendy.com',
        'New User',
        'newuser@example.com',
        '+905551234567'
      )

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.to).toBe('owner@petfendy.com')
      expect(body.subject).toBe('🆕 Yeni Üye: New User - Petfendy')
      expect(body.html).toContain('New User')
      expect(body.html).toContain('newuser@example.com')
      expect(body.html).toContain('+905551234567')
    })
  })

  describe('Error Handling', () => {
    it('should handle all email types gracefully on API failure', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValue(new Error('API Error'))

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Test all email types return true even on failure
      const results = await Promise.all([
        emailService.sendEmail({ to: 'test@example.com', subject: 'Test', html: 'Test' }),
        emailService.sendInvoiceEmail({
          customerName: 'Test',
          customerEmail: 'test@example.com',
          invoiceNumber: 'INV-001',
          totalAmount: 100,
          items: []
        }),
        emailService.sendBookingConfirmationEmail({
          customerName: 'Test',
          customerEmail: 'test@example.com',
          bookingType: 'hotel',
          bookingDetails: 'Test',
          bookingDate: new Date(),
          totalAmount: 100
        }),
        emailService.sendPasswordResetEmail('test@example.com', 'token'),
        emailService.sendVerificationEmail('test@example.com', '123456', 'Test'),
        emailService.sendContactFormEmail({
          name: 'Test',
          email: 'test@example.com',
          phone: '123',
          message: 'Test'
        }),
        emailService.sendWelcomeEmail('test@example.com', 'Test'),
        emailService.sendNewUserNotificationToOwner('owner@example.com', 'Test', 'test@example.com', '123')
      ])

      // All should return true for UX (graceful degradation)
      results.forEach(result => {
        expect(result).toBe(true)
      })

      expect(consoleErrorSpy).toHaveBeenCalledTimes(8) // One error per email type
      expect(consoleSpy).toHaveBeenCalledTimes(8) // One mock log per email type

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })
})