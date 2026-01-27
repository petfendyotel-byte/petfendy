"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useRecaptcha } from '@/hooks/use-recaptcha'

interface RecaptchaContextType {
  executeRecaptcha: (action?: string) => Promise<string | null>
  isLoaded: boolean
  error: string | null
}

const RecaptchaContext = createContext<RecaptchaContextType | null>(null)

interface RecaptchaProviderProps {
  children: ReactNode
  siteKey: string
}

export function RecaptchaProvider({ children, siteKey }: RecaptchaProviderProps) {
  const recaptcha = useRecaptcha({ siteKey })

  return (
    <RecaptchaContext.Provider value={recaptcha}>
      {children}
    </RecaptchaContext.Provider>
  )
}

export function useRecaptchaContext() {
  const context = useContext(RecaptchaContext)
  if (!context) {
    throw new Error('useRecaptchaContext must be used within a RecaptchaProvider')
  }
  return context
}