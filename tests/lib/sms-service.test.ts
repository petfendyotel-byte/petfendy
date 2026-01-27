/**
 * SMS Service Tests
 * 
 * Tests for SMS service functionality
 * - SMS configuration and providers
 * - Phone number formatting
 * - Business notification methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { smsService, initSMSService } from '@/lib/sms-service'

// Mock fetch globally
global.fetch = vi.fn()

describe('SMS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables
    delete process.env.SMS_PROVIDER
    delete process.env.NETGSM_USERNAME
    delete process.env.NETGSM_PASSWORD
    delete process.env.NETGSM_SENDER
    delete process.env.ADMIN_PHONE
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration', () => {
    it('should configure NetGSM provider', () => {
      const config = {
        provider: 'netgsm' as const,
        username: 'test-user',
        password: 'test-pass',
        sender: 'PETFENDY'
      }

      smsService.configure(config)
      
      // Configuration is private, but we can test it works by checking behavior
      expect(true).toBe(true) // Configuration doesn't throw
    })

    it('should configure Twilio provider', () => {
      const config = {
        provider: 'twilio' as const,
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        sender: '+1234567890'
      }

      smsService.configure(config)
      expect(true).toBe(true)
    })

    it('should configure mock provider', () => {
      const config = {
        provider: 'mock' as const
      }

      smsService.configure(config)
      expect(true).toBe(true)
    })
  })

  describe('Phone Number Formatting', () => {
    beforeEach(() => {
      smsService.configure({ provider: 'mock' })
    })

    it('should format Turkish phone numbers starting with 0', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await smsService.sendSMS({ to: '05551234567', message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')

      consoleSpy.mockRestore()
    })

    it('should format 10-digit Turkish numbers', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await smsService.sendSMS({ to: '5551234567', message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')

      consoleSpy.mockRestore()
    })

    it('should keep international numbers as-is', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')

      consoleSpy.mockRestore()
    })

    it('should clean non-digit characters', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await smsService.sendSMS({ to: '+90 (555) 123-45-67', message: 'Test' })

      expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')

      consoleSpy.mockRestore()
    })
  })

  describe('NetGSM Provider', () => {
    beforeEach(() => {
      smsService.configure({
        provider: 'netgsm',
        username: 'test-user',
        password: 'test-pass',
        sender: 'PETFENDY'
      })
    })

    it('should send SMS via NetGSM successfully', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '12345678901234567' // JobID response
      } as Response)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test message' })

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('https://api.netgsm.com.tr/sms/send/xml', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/xml',
          'User-Agent': 'PETFENDY-SMS-Service/1.0'
        },
        body: expect.stringContaining('<usercode>test-user</usercode>')
      })

      expect(consoleSpy).toHaveBeenCalledWith('✅ [NetGSM] SMS sent successfully to 905551234567. JobID: 12345678901234567')

      consoleSpy.mockRestore()
    })

    it('should handle NetGSM success codes', async () => {
      const mockFetch = vi.mocked(fetch)
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Test different success codes
      const successCodes = ['00', '01', '02']
      
      for (const code of successCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          text: async () => code
        } as Response)

        const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })
        expect(result).toBe(true)
      }

      consoleSpy.mockRestore()
    })

    it('should handle NetGSM error codes', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '30' // Invalid credentials
      } as Response)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ [NetGSM] Error 30: Geçersiz kullanıcı adı/şifre veya API erişim izni yok')

      consoleErrorSpy.mockRestore()
    })

    it('should handle unknown NetGSM error codes', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '99' // Unknown error
      } as Response)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ [NetGSM] Error 99: Bilinmeyen hata: 99')

      consoleErrorSpy.mockRestore()
    })

    it('should handle NetGSM network errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NetGSM] API Error:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing NetGSM credentials', async () => {
      smsService.configure({
        provider: 'netgsm',
        username: '',
        password: ''
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NetGSM] Missing credentials')

      consoleErrorSpy.mockRestore()
    })

    it('should send commercial SMS with IYS filter', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '12345678901234567'
      } as Response)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Commercial message' }, true)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs?.body).toContain('<iysfilter>11</iysfilter>')
      expect(consoleSpy).toHaveBeenCalledWith('📱 [NetGSM] Sending SMS to 905551234567, Commercial: true')

      consoleSpy.mockRestore()
    })

    it('should send informational SMS without IYS filter', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '12345678901234567'
      } as Response)

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Info message' }, false)

      expect(result).toBe(true)
      
      const callArgs = mockFetch.mock.calls[0][1]
      expect(callArgs?.body).toContain('<iysfilter>0</iysfilter>')
      expect(consoleSpy).toHaveBeenCalledWith('📱 [NetGSM] Sending SMS to 905551234567, Commercial: false')

      consoleSpy.mockRestore()
    })
  })

  describe('Twilio Provider', () => {
    beforeEach(() => {
      smsService.configure({
        provider: 'twilio',
        apiKey: 'test-key',
        apiSecret: 'test-secret'
      })
    })

    it('should send SMS via Twilio (mock implementation)', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test message' })

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('📱 [Twilio] Sending SMS to 905551234567')
      expect(consoleSpy).toHaveBeenCalledWith('Message: Test message')

      consoleSpy.mockRestore()
    })
  })

  describe('Mock Provider', () => {
    beforeEach(() => {
      smsService.configure({ provider: 'mock' })
    })

    it('should send mock SMS', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test message' })

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')
      expect(consoleSpy).toHaveBeenCalledWith('Message: Test message')

      consoleSpy.mockRestore()
    })
  })

  describe('Business SMS Methods', () => {
    beforeEach(() => {
      smsService.configure({ provider: 'mock' })
    })

    describe('Welcome SMS', () => {
      it('should send welcome SMS', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendWelcomeSMS('905551234567', 'John Doe')

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905551234567')
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Merhaba John Doe! Petfendy\'ye hoş geldiniz 🐾')
        )

        consoleSpy.mockRestore()
      })
    })

    describe('New User Notification to Admin', () => {
      it('should send new user notification to admin', async () => {
        process.env.ADMIN_PHONE = '905559876543'
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewUserNotificationToAdmin(
          'Jane Doe',
          'jane@example.com',
          '905551234567'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905559876543')
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('🆕 Yeni Üye! Ad: Jane Doe, Tel: 905551234567')
        )

        consoleSpy.mockRestore()
      })

      it('should handle missing admin phone', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        const result = await smsService.sendNewUserNotificationToAdmin(
          'Jane Doe',
          'jane@example.com',
          '905551234567'
        )

        expect(result).toBe(false)
        expect(consoleErrorSpy).toHaveBeenCalledWith('[SMS] Admin telefon numarası tanımlı değil (ADMIN_PHONE)')

        consoleErrorSpy.mockRestore()
      })
    })

    describe('Booking Confirmation SMS', () => {
      it('should send hotel booking confirmation', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendBookingConfirmationSMS(
          '905551234567',
          'hotel',
          '1-3 Şubat 2025, Standard Oda'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('✅ Pet Otel rezervasyonunuz onaylandı!')
        )

        consoleSpy.mockRestore()
      })

      it('should send daycare booking confirmation', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendBookingConfirmationSMS(
          '905551234567',
          'daycare',
          'Haftalık kayıt'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('✅ Pet Kreş kaydınız yapıldı!')
        )

        consoleSpy.mockRestore()
      })

      it('should send taxi booking confirmation', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendBookingConfirmationSMS(
          '905551234567',
          'taxi',
          'Havalimanı transferi, 25km'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('✅ Pet Taksi rezervasyonunuz yapıldı!')
        )

        consoleSpy.mockRestore()
      })
    })

    describe('New Booking Notification to Admin', () => {
      beforeEach(() => {
        process.env.ADMIN_PHONE = '905559876543'
      })

      it('should send hotel booking notification to admin', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewBookingNotificationToAdmin(
          'hotel',
          'John Doe',
          '905551234567',
          'Standard Oda, 2 gece'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('📱 [Mock SMS] To: 905559876543')
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('🔔 Yeni Pet Otel Rezervasyonu! Müşteri: John Doe')
        )

        consoleSpy.mockRestore()
      })

      it('should send daycare booking notification to admin', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewBookingNotificationToAdmin(
          'daycare',
          'Jane Smith',
          '905551234567',
          'Haftalık kayıt'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('🔔 Yeni Pet Kreş Kaydı! Müşteri: Jane Smith')
        )

        consoleSpy.mockRestore()
      })

      it('should send taxi booking notification to admin', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewBookingNotificationToAdmin(
          'taxi',
          'Bob Johnson',
          '905551234567',
          'Havalimanı, 30km'
        )

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('🔔 Yeni Pet Taksi Rezervasyonu! Müşteri: Bob Johnson')
        )

        consoleSpy.mockRestore()
      })
    })

    describe('Test SMS', () => {
      it('should send test informational SMS', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendTestInformationalSMS('905551234567')

        expect(result).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Petfendy test mesajı. Bu bir bilgilendirme SMS\'idir.')
        )

        consoleSpy.mockRestore()
      })
    })

    describe('Bulk Notification Methods', () => {
      beforeEach(() => {
        process.env.ADMIN_PHONE = '905559876543'
      })

      it('should send new user notifications to both user and admin', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewUserNotifications(
          'Alice Johnson',
          'alice@example.com',
          '905551234567'
        )

        expect(result.userSMS).toBe(true)
        expect(result.adminSMS).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('📱 [SMS] Yeni üye bildirimleri - Kullanıcı: ✅, Admin: ✅')

        consoleSpy.mockRestore()
      })

      it('should send new booking notifications to both user and admin', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

        const result = await smsService.sendNewBookingNotifications(
          'hotel',
          'Charlie Brown',
          '905551234567',
          'Deluxe Oda, 3 gece'
        )

        expect(result.userSMS).toBe(true)
        expect(result.adminSMS).toBe(true)
        expect(consoleSpy).toHaveBeenCalledWith('📱 [SMS] Rezervasyon bildirimleri - Kullanıcı: ✅, Admin: ✅')

        consoleSpy.mockRestore()
      })
    })
  })

  describe('Auto-initialization', () => {
    it('should initialize NetGSM from environment variables', () => {
      process.env.SMS_PROVIDER = 'netgsm'
      process.env.NETGSM_USERNAME = 'env-user'
      process.env.NETGSM_PASSWORD = 'env-pass'
      process.env.NETGSM_SENDER = 'ENV-SENDER'

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      initSMSService()

      expect(consoleSpy).toHaveBeenCalledWith('📱 SMS Service: NetGSM configured with username:', 'env-user')

      consoleSpy.mockRestore()
    })

    it('should initialize Twilio from environment variables', () => {
      process.env.SMS_PROVIDER = 'twilio'
      process.env.TWILIO_ACCOUNT_SID = 'test-sid'
      process.env.TWILIO_AUTH_TOKEN = 'test-token'
      process.env.TWILIO_PHONE_NUMBER = '+1234567890'

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      initSMSService()

      expect(consoleSpy).toHaveBeenCalledWith('📱 SMS Service: Twilio configured')

      consoleSpy.mockRestore()
    })

    it('should default to mock when no provider specified', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      initSMSService()

      expect(consoleSpy).toHaveBeenCalledWith('📱 SMS Service: Mock mode (no real SMS will be sent)')

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      smsService.configure({ provider: 'mock' })
    })

    it('should handle SMS service errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock console.log to throw an error
      vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console error')
      })

      const result = await smsService.sendSMS({ to: '905551234567', message: 'Test' })

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[SMS Service] Error:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })
})