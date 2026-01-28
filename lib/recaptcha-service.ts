interface RecaptchaResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

interface RecaptchaVerificationResult {
  success: boolean
  score: number
  action: string
  error?: string
}

export class RecaptchaService {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  /**
   * Verify reCAPTCHA token with Google's API
   */
  async verifyToken(token: string, remoteip?: string): Promise<RecaptchaVerificationResult> {
    console.log('🔍 [reCAPTCHA Service] Starting token verification')
    console.log('🎫 [reCAPTCHA Service] Token length:', token?.length || 0)
    console.log('🌐 [reCAPTCHA Service] Remote IP:', remoteip || 'not provided')
    
    if (!token) {
      console.log('❌ [reCAPTCHA Service] No token provided')
      return {
        success: false,
        score: 0,
        action: '',
        error: 'Token is required'
      }
    }

    if (!this.secretKey) {
      console.log('❌ [reCAPTCHA Service] No secret key configured')
      return {
        success: false,
        score: 0,
        action: '',
        error: 'reCAPTCHA secret key is not configured'
      }
    }

    console.log('🔑 [reCAPTCHA Service] Using secret key:', this.secretKey.substring(0, 15) + '...')

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token
      })

      if (remoteip) {
        params.append('remoteip', remoteip)
      }

      console.log('📡 [reCAPTCHA Service] Making request to Google API...')
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      })

      console.log('📊 [reCAPTCHA Service] Google API response status:', response.status)

      if (!response.ok) {
        console.error('❌ [reCAPTCHA Service] HTTP error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: RecaptchaResponse = await response.json()
      console.log('📋 [reCAPTCHA Service] Google API response data:', JSON.stringify(data, null, 2))

      if (!data.success) {
        const errorCodes = data['error-codes'] || []
        const errorMessage = this.getErrorMessage(errorCodes)
        console.error('❌ [reCAPTCHA Service] Verification failed:', errorMessage, errorCodes)
        console.error('❌ [reCAPTCHA Service] Full response:', data)
        
        return {
          success: false,
          score: 0,
          action: data.action || '',
          error: errorMessage
        }
      }

      console.log('✅ [reCAPTCHA Service] Verification successful')
      console.log('📊 [reCAPTCHA Service] Score:', data.score)
      console.log('🎯 [reCAPTCHA Service] Action from Google:', JSON.stringify(data.action))
      console.log('🎯 [reCAPTCHA Service] Action length:', (data.action || '').length)

      return {
        success: true,
        score: data.score || 0,
        action: data.action || ''
      }
    } catch (error) {
      console.error('❌ [reCAPTCHA Service] Verification error:', error)
      
      return {
        success: false,
        score: 0,
        action: '',
        error: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  }

  /**
   * Check if the score meets the minimum threshold
   */
  isScoreValid(score: number, minScore: number = 0.5): boolean {
    return score >= minScore
  }

  /**
   * Validate reCAPTCHA token and score
   */
  async validateRecaptcha(
    token: string, 
    expectedAction: string,
    minScore: number = 0.5,
    remoteip?: string
  ): Promise<{ valid: boolean; error?: string; score?: number }> {
    const result = await this.verifyToken(token, remoteip)

    if (!result.success) {
      return {
        valid: false,
        error: result.error || 'reCAPTCHA verification failed'
      }
    }

    // Check if action matches
    if (result.action !== expectedAction) {
      return {
        valid: false,
        error: `Invalid action. Expected: ${expectedAction}, Got: ${result.action}`,
        score: result.score
      }
    }

    // Check score threshold
    if (!this.isScoreValid(result.score, minScore)) {
      return {
        valid: false,
        error: `Score too low. Got: ${result.score}, Required: ${minScore}`,
        score: result.score
      }
    }

    return {
      valid: true,
      score: result.score
    }
  }

  /**
   * Get human-readable error message from error codes
   */
  private getErrorMessage(errorCodes: string[]): string {
    const errorMessages: Record<string, string> = {
      'missing-input-secret': 'The secret parameter is missing',
      'invalid-input-secret': 'The secret parameter is invalid or malformed',
      'missing-input-response': 'The response parameter is missing',
      'invalid-input-response': 'The response parameter is invalid or malformed',
      'bad-request': 'The request is invalid or malformed',
      'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously'
    }

    if (errorCodes.length === 0) {
      return 'Unknown error occurred'
    }

    const messages = errorCodes.map(code => errorMessages[code] || `Unknown error: ${code}`)
    return messages.join(', ')
  }
}

// Create singleton instance
const recaptchaService = new RecaptchaService(process.env.RECAPTCHA_SECRET_KEY || '')

export { recaptchaService }