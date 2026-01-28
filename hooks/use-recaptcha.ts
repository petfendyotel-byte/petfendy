"use client"

import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface UseRecaptchaOptions {
  siteKey: string
  action?: string
}

interface UseRecaptchaReturn {
  executeRecaptcha: (action?: string) => Promise<string | null>
  isLoaded: boolean
  error: string | null
}

export function useRecaptcha({ siteKey, action = 'submit' }: UseRecaptchaOptions): UseRecaptchaReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteKey) {
      setError('reCAPTCHA site key is required')
      return
    }

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true)
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsLoaded(true)
        setError(null)
      })
    }

    script.onerror = () => {
      setError('Failed to load reCAPTCHA')
      setIsLoaded(false)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="recaptcha"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [siteKey])

  const executeRecaptcha = useCallback(async (customAction?: string): Promise<string | null> => {
    if (!isLoaded || !window.grecaptcha) {
      setError('reCAPTCHA is not loaded')
      return null
    }

    if (!siteKey) {
      setError('reCAPTCHA site key is required')
      return null
    }

    try {
      const actionToUse = customAction || action
      console.log('🎯 [reCAPTCHA Hook] Executing with action:', actionToUse)
      console.log('🔑 [reCAPTCHA Hook] Site key:', siteKey.substring(0, 15) + '...')
      
      const token = await window.grecaptcha.execute(siteKey, {
        action: actionToUse
      })
      
      console.log('🎫 [reCAPTCHA Hook] Token generated successfully, length:', token?.length || 0)
      setError(null)
      return token
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA execution failed'
      console.error('❌ [reCAPTCHA Hook] Execution error:', errorMessage)
      setError(errorMessage)
      return null
    }
  }, [isLoaded, siteKey, action])

  return {
    executeRecaptcha,
    isLoaded,
    error
  }
}