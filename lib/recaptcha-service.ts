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
    if (!token) {
      return {
        success: false,
        score: 0,
        action: '',
        error: 'Token is required'
      }
    }

    if (!this.secretKey) {
      return {
        success: false,
        score: 0,
        action: '',
        error: 'reCAPTCHA secret key is not configured'
      }
    }

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token
      })

      if (remoteip) {
        params.append('remoteip', remoteip)
      }

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: RecaptchaResponse = await response.json()

      if (!data.success) {
        const errorCodes = data['error-codes'] || []
        const errorMessage = this.getErrorMessage(errorCodes)
        
        return {
          success: false,
          score: 0,
          action: data.action || '',
          error: errorMessage
        }
      }

      return {
        success: true,
        score: data.score || 0,
        action: data.action || ''
      }
    } catch (error) {
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