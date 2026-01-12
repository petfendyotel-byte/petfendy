/**
 * Vitest Test Setup Dosyası
 * 
 * Bu dosya tüm testlerden önce çalışır ve test ortamını hazırlar.
 * - DOM testing için jsdom ortamı
 * - localStorage/sessionStorage mock'ları
 * - Global test yardımcıları
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// localStorage mock - tarayıcı ortamını simüle eder
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
  get length() {
    return Object.keys(localStorageMock.store).length
  },
  key: vi.fn((index: number) => Object.keys(localStorageMock.store)[index] || null)
}

// sessionStorage mock
const sessionStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => sessionStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    sessionStorageMock.store = {}
  }),
  get length() {
    return Object.keys(sessionStorageMock.store).length
  },
  key: vi.fn((index: number) => Object.keys(sessionStorageMock.store)[index] || null)
}

// Global window nesnesine mock'ları ekle
Object.defineProperty(global, 'localStorage', { value: localStorageMock })
Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock })

// crypto.getRandomValues mock - güvenlik fonksiyonları için
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})

// Her testten önce storage'ı temizle
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
  vi.clearAllMocks()
})

// Test sonrası temizlik
afterEach(() => {
  vi.restoreAllMocks()
})
