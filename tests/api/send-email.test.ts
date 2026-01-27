/**
 * Send Email API Tests
 * 
 * Tests for /api/send-email endpoint
 * - POST: Send email via multiple providers (Resend, SendGrid, Mock)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/send-email/route'

// Mock fetch globally
global.fetch = vi.fn()

describe('Send Email API', () => {
  const validEmailData = {
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Hello World</h1><p>This is a test email.</p>',
    text: 'Hello World\nThis is a test email.'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables
    delete process.env.RESEND_API_KEY
    delete process.env.SMTP_HOST
    delete process.env.SENDGRID_API_KEY
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Input Validation', () => {
    it('should require to field', async () => {
      const invalidData = { ...validEmailData, to: '' }
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: to, subject, html')
    })

    it('should require subject field', async () => {
      const invalidData = { ...validEmailData, subject: '' }
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: to, subject, html')
    })

    it('should require html field', async () => {
      const invalidData = { ...validEmailData, html: '' }
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: to, subject, html')
    })

    it('should accept valid email data', async () => {
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock') // No providers configured
    })
  })

  describe('Resend Provider', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.EMAIL_FROM = 'test@petfendy.com'
    })

    it('should send email via Resend successfully', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'resend-email-123' })
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('resend')
      expect(data.id).toBe('resend-email-123')

      expect(mockFetch).toHaveBeenCalledWith('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-resend-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'test@petfendy.com',
          to: ['test@example.com'],
          subject: 'Test Email',
          html: '<h1>Hello World</h1><p>This is a test email.</p>',
          text: 'Hello World\nThis is a test email.'
        })
      })
    })

    it('should fallback to mock when Resend fails', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Resend API error'
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock') // Fallback to mock
    })

    it('should use default sender when EMAIL_FROM not set', async () => {
      delete process.env.EMAIL_FROM

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'resend-email-123' })
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith('https://api.resend.com/emails', 
        expect.objectContaining({
          body: expect.stringContaining('"from":"Petfendy <onboarding@resend.dev>"')
        })
      )
    })

    it('should handle Resend connection errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock') // Fallback to mock
    })
  })

  describe('SendGrid Provider', () => {
    beforeEach(() => {
      process.env.SENDGRID_API_KEY = 'test-sendgrid-key'
      process.env.SENDGRID_FROM_EMAIL = 'noreply@petfendy.com'
    })

    it('should send email via SendGrid successfully', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ''
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('sendgrid')

      expect(mockFetch).toHaveBeenCalledWith('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-sendgrid-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: 'test@example.com' }] }],
          from: { 
            email: 'noreply@petfendy.com',
            name: 'Petfendy'
          },
          subject: 'Test Email',
          content: [
            { type: 'text/html', value: '<h1>Hello World</h1><p>This is a test email.</p>' },
            { type: 'text/plain', value: 'Hello World\nThis is a test email.' }
          ]
        })
      })
    })

    it('should send without text content when not provided', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ''
      } as Response)

      const dataWithoutText = { ...validEmailData }
      delete dataWithoutText.text

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(dataWithoutText)
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith('https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          body: expect.stringContaining('"content":[{"type":"text/html"')
        })
      )

      // Should not include text/plain content
      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs?.body as string)
      expect(body.content).toHaveLength(1)
      expect(body.content[0].type).toBe('text/html')
    })

    it('should use default sender when SENDGRID_FROM_EMAIL not set', async () => {
      delete process.env.SENDGRID_FROM_EMAIL

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ''
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      await POST(request)

      expect(mockFetch).toHaveBeenCalledWith('https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          body: expect.stringContaining('"email":"info@petfendy.com"')
        })
      )
    })

    it('should handle SendGrid API errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'SendGrid API error'
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock') // Fallback to mock
    })

    it('should handle SendGrid connection errors', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock') // Fallback to mock
    })
  })

  describe('Mock Provider (Fallback)', () => {
    it('should use mock when no providers configured', async () => {
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.provider).toBe('mock')
      expect(data.message).toBe('Email logged (no email service configured)')
      expect(data.to).toBe('test@example.com')
      expect(data.subject).toBe('Test Email')
    })

    it('should truncate long HTML content in mock logs', async () => {
      const longHtml = '<h1>Test</h1>' + 'x'.repeat(300)
      const dataWithLongHtml = { ...validEmailData, html: longHtml }

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(dataWithLongHtml)
      })

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HTML Preview:'),
        expect.stringContaining('...')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Provider Priority', () => {
    it('should prioritize Resend over SendGrid', async () => {
      process.env.RESEND_API_KEY = 'resend-key'
      process.env.SENDGRID_API_KEY = 'sendgrid-key'

      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'resend-123' })
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.provider).toBe('resend')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('resend'),
        expect.anything()
      )
    })

    it('should use SendGrid when Resend fails', async () => {
      process.env.RESEND_API_KEY = 'resend-key'
      process.env.SENDGRID_API_KEY = 'sendgrid-key'

      const mockFetch = vi.mocked(fetch)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          text: async () => 'Resend failed'
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => ''
        } as Response)

      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: JSON.stringify(validEmailData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.provider).toBe('sendgrid')
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/send-email', {
        method: 'POST',
        body: 'invalid-json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
      expect(data.details).toContain('Unexpected token')
    })
  })
})