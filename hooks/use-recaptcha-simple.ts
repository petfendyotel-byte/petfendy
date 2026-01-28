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

interface UseSimpleRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string | null>
  isLoaded: boolean
  error: string | null
}

export function useSimpleRecaptcha(siteKey: string): UseSimpleRecaptchaReturn {
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
        console.log('✅ [Simple reCAPTCHA] Loaded successfully')
      })
    }

    script.onerror = () => {
      setError('Failed to load reCAPTCHA')
      setIsLoaded(false)
      console.error('❌ [Simple reCAPTCHA] Failed to load')
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

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    console.log('🎯 [Simple reCAPTCHA] Execute called with action:', JSON.stringify(action))
    console.log('🔍 [Simple reCAPTCHA] isLoaded:', isLoaded)
    console.log('🔍 [Simple reCAPTCHA] window.grecaptcha exists:', !!window.grecaptcha)
    
    if (!isLoaded || !window.grecaptcha) {
      const errorMsg = 'reCAPTCHA is not loaded'
      console.error('❌ [Simple reCAPTCHA]', errorMsg)
      setError(errorMsg)
      return null
    }

    if (!siteKey) {
      const errorMsg = 'reCAPTCHA site key is required'
      console.error('❌ [Simple reCAPTCHA]', errorMsg)
      setError(errorMsg)
      return null
    }

    if (!action || action.trim() === '') {
      const errorMsg = 'Action is required and cannot be empty'
      console.error('❌ [Simple reCAPTCHA]', errorMsg)
      setError(errorMsg)
      return null
    }

    try {
      console.log('🔄 [Simple reCAPTCHA] Calling grecaptcha.execute with:')
      console.log('  - siteKey:', siteKey.substring(0, 15) + '...')
      console.log('  - action:', JSON.stringify(action))
      console.log('  - action type:', typeof action)
      console.log('  - action length:', action.length)
      
      const token = await window.grecaptcha.execute(siteKey, {
        action: action
      })
      
      console.log('✅ [Simple reCAPTCHA] Token generated successfully')
      console.log('🎫 [Simple reCAPTCHA] Token length:', token?.length || 0)
      console.log('🎫 [Simple reCAPTCHA] Token preview:', token?.substring(0, 50) + '...')
      
      setError(null)
      return token
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'reCAPTCHA execution failed'
      console.error('❌ [Simple reCAPTCHA] Execution error:', errorMessage)
      console.error('❌ [Simple reCAPTCHA] Full error:', err)
      setError(errorMessage)
      return null
    }
  }, [isLoaded, siteKey])

  return {
    executeRecaptcha,
    isLoaded,
    error
  }
}