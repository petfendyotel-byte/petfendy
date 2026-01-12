/**
 * Storage Utility Testleri
 * 
 * Bu dosya lib/storage.ts içindeki tüm fonksiyonları test eder.
 * Storage fonksiyonları localStorage ve sessionStorage kullanarak
 * kullanıcı verilerini, rezervasyonları ve CMS içeriklerini yönetir.
 * 
 * Test Kategorileri:
 * 1. Auth Token Yönetimi - Oturum token'larının güvenli saklanması
 * 2. Kullanıcı Verisi - Kullanıcı bilgilerinin yönetimi
 * 3. Rezervasyon Yönetimi - Otel ve taksi rezervasyonları
 * 4. CMS Yönetimi - Sayfa, blog, galeri, SSS içerikleri
 * 5. İletişim Mesajları - Müşteri mesajlarının yönetimi
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  setCurrentUser,
  getCurrentUser,
  clearCurrentUser,
  setTempReservation,
  getTempReservation,
  clearTempReservation,
  setTempTaxiReservation,
  getTempTaxiReservation,
  clearTempTaxiReservation,
  getPages,
  savePage,
  getPageBySlug,
  getBlogPosts,
  saveBlogPost,
  getBlogPostBySlug,
  deleteBlogPost,
  getGalleryImages,
  saveGalleryImage,
  deleteGalleryImage,
  getFAQs,
  saveFAQ,
  deleteFAQ,
  getContactMessages,
  saveContactMessage,
  updateContactMessageStatus,
  clearAllData,
  setPendingUser,
  getPendingUser,
  clearPendingUser
} from '@/lib/storage'

// ============================================
// AUTH TOKEN TESTLERİ
// ============================================
describe('Auth Token Yönetimi', () => {
  /**
   * setAuthToken: Token'ı sessionStorage'a kaydeder
   * Güvenlik: sessionStorage kullanılır çünkü sekme kapandığında silinir
   */
  it('setAuthToken - token\'ı sessionStorage\'a kaydetmeli', () => {
    const token = 'test-jwt-token-12345'
    
    setAuthToken(token)
    
    expect(sessionStorage.setItem).toHaveBeenCalledWith('petfendy_auth_token', token)
  })

  /**
   * getAuthToken: Kaydedilmiş token'ı döndürür
   */
  it('getAuthToken - kaydedilmiş token\'ı döndürmeli', () => {
    const token = 'test-jwt-token-12345'
    sessionStorage.store['petfendy_auth_token'] = token
    
    const result = getAuthToken()
    
    expect(result).toBe(token)
  })

  /**
   * getAuthToken: Token yoksa null döndürür
   */
  it('getAuthToken - token yoksa null döndürmeli', () => {
    const result = getAuthToken()
    
    expect(result).toBeNull()
  })

  /**
   * clearAuthToken: Token'ı siler
   */
  it('clearAuthToken - token\'ı silmeli', () => {
    sessionStorage.store['petfendy_auth_token'] = 'some-token'
    
    clearAuthToken()
    
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('petfendy_auth_token')
  })
})

// ============================================
// KULLANICI VERİSİ TESTLERİ
// ============================================
describe('Kullanıcı Verisi Yönetimi', () => {
  /**
   * setCurrentUser: Kullanıcı bilgilerini güvenli şekilde saklar
   * Sadece gerekli alanlar kaydedilir (id, email, name, role)
   */
  it('setCurrentUser - kullanıcı bilgilerini kaydetmeli', () => {
    const user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const
    }
    
    setCurrentUser(user)
    
    expect(localStorage.setItem).toHaveBeenCalled()
    const savedData = JSON.parse(localStorage.store['petfendy_user'])
    expect(savedData).toEqual(user)
  })

  /**
   * setCurrentUser: Hassas verileri filtrelemeli
   * Şifre gibi hassas veriler kaydedilmemeli
   */
  it('setCurrentUser - sadece güvenli alanları kaydetmeli', () => {
    const user = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const,
      password: 'secret123', // Bu kaydedilmemeli
      creditCard: '1234-5678' // Bu da kaydedilmemeli
    }
    
    setCurrentUser(user)
    
    const savedData = JSON.parse(localStorage.store['petfendy_user'])
    expect(savedData.password).toBeUndefined()
    expect(savedData.creditCard).toBeUndefined()
  })

  /**
   * getCurrentUser: Kaydedilmiş kullanıcıyı döndürür
   */
  it('getCurrentUser - kaydedilmiş kullanıcıyı döndürmeli', () => {
    const user = { id: 'user-123', email: 'test@example.com', name: 'Test', role: 'user' }
    localStorage.store['petfendy_user'] = JSON.stringify(user)
    
    const result = getCurrentUser()
    
    expect(result).toEqual(user)
  })

  /**
   * getCurrentUser: Kullanıcı yoksa null döndürür
   */
  it('getCurrentUser - kullanıcı yoksa null döndürmeli', () => {
    const result = getCurrentUser()
    
    expect(result).toBeNull()
  })

  /**
   * clearCurrentUser: Kullanıcı verisini siler
   */
  it('clearCurrentUser - kullanıcı verisini silmeli', () => {
    localStorage.store['petfendy_user'] = JSON.stringify({ id: '123' })
    
    clearCurrentUser()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('petfendy_user')
  })
})

// ============================================
// OTEL REZERVASYON TESTLERİ
// ============================================
describe('Otel Rezervasyon Yönetimi', () => {
  const mockReservation = {
    roomId: 'room-1',
    roomName: 'Deluxe Oda',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-20',
    totalPrice: 2500,
    petInfo: {
      name: 'Buddy',
      type: 'dog',
      breed: 'Golden Retriever',
      weight: 30
    }
  }

  /**
   * setTempReservation: Geçici rezervasyonu kaydeder
   * Checkout işlemi tamamlanana kadar saklanır
   */
  it('setTempReservation - rezervasyonu kaydetmeli', () => {
    setTempReservation(mockReservation as any)
    
    expect(localStorage.setItem).toHaveBeenCalled()
    const saved = JSON.parse(localStorage.store['petfendy_temp_reservation'])
    expect(saved.roomId).toBe('room-1')
    expect(saved.totalPrice).toBe(2500)
  })

  /**
   * getTempReservation: Kaydedilmiş rezervasyonu döndürür
   */
  it('getTempReservation - rezervasyonu döndürmeli', () => {
    localStorage.store['petfendy_temp_reservation'] = JSON.stringify(mockReservation)
    
    const result = getTempReservation()
    
    expect(result).toEqual(mockReservation)
  })

  /**
   * clearTempReservation: Rezervasyonu siler
   * Ödeme tamamlandıktan sonra çağrılır
   */
  it('clearTempReservation - rezervasyonu silmeli', () => {
    localStorage.store['petfendy_temp_reservation'] = JSON.stringify(mockReservation)
    
    clearTempReservation()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('petfendy_temp_reservation')
  })
})

// ============================================
// TAKSİ REZERVASYON TESTLERİ
// ============================================
describe('Taksi Rezervasyon Yönetimi', () => {
  const mockTaxiReservation = {
    vehicleType: 'vip' as const,
    vehicleName: 'VIP Taksi',
    pickupProvince: 'İstanbul',
    pickupDistrict: 'Kadıköy',
    pickupAddress: 'Test Mahallesi',
    dropoffProvince: 'Ankara',
    dropoffDistrict: 'Çankaya',
    dropoffAddress: 'Hedef Mahallesi',
    distance: 450,
    pricePerKm: 15,
    scheduledDate: '2024-01-15T10:00',
    totalPrice: 6750,
    petInfo: {
      name: 'Max',
      type: 'dog',
      breed: 'Labrador',
      weight: 25
    },
    guestInfo: {
      name: 'Ali Yılmaz',
      phone: '05551234567',
      email: 'ali@example.com'
    }
  }

  /**
   * setTempTaxiReservation: Taksi rezervasyonunu kaydeder
   */
  it('setTempTaxiReservation - taksi rezervasyonunu kaydetmeli', () => {
    setTempTaxiReservation(mockTaxiReservation)
    
    expect(localStorage.setItem).toHaveBeenCalled()
    const saved = JSON.parse(localStorage.store['petfendy_temp_taxi_reservation'])
    expect(saved.vehicleType).toBe('vip')
    expect(saved.totalPrice).toBe(6750)
  })

  /**
   * getTempTaxiReservation: Taksi rezervasyonunu döndürür
   */
  it('getTempTaxiReservation - rezervasyonu döndürmeli', () => {
    localStorage.store['petfendy_temp_taxi_reservation'] = JSON.stringify(mockTaxiReservation)
    
    const result = getTempTaxiReservation()
    
    expect(result?.vehicleType).toBe('vip')
    expect(result?.pickupProvince).toBe('İstanbul')
  })

  /**
   * clearTempTaxiReservation: Taksi rezervasyonunu siler
   */
  it('clearTempTaxiReservation - rezervasyonu silmeli', () => {
    localStorage.store['petfendy_temp_taxi_reservation'] = JSON.stringify(mockTaxiReservation)
    
    clearTempTaxiReservation()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('petfendy_temp_taxi_reservation')
  })
})

// ============================================
// CMS SAYFA YÖNETİMİ TESTLERİ
// ============================================
describe('CMS Sayfa Yönetimi', () => {
  const mockPage = {
    id: 'page-1',
    slug: 'hakkimizda',
    title: 'Hakkımızda',
    content: '<p>Petfendy hakkında bilgiler</p>',
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  }

  /**
   * getPages: Tüm sayfaları döndürür
   */
  it('getPages - boş dizi döndürmeli (sayfa yoksa)', () => {
    const result = getPages()
    
    expect(result).toEqual([])
  })

  /**
   * savePage: Yeni sayfa ekler
   */
  it('savePage - yeni sayfa eklemeli', () => {
    savePage(mockPage as any)
    
    const pages = JSON.parse(localStorage.store['petfendy_pages'])
    expect(pages).toHaveLength(1)
    expect(pages[0].slug).toBe('hakkimizda')
  })

  /**
   * savePage: Mevcut sayfayı günceller
   */
  it('savePage - mevcut sayfayı güncellemeli', () => {
    localStorage.store['petfendy_pages'] = JSON.stringify([mockPage])
    
    const updatedPage = { ...mockPage, title: 'Hakkımızda - Güncel' }
    savePage(updatedPage as any)
    
    const pages = JSON.parse(localStorage.store['petfendy_pages'])
    expect(pages).toHaveLength(1)
    expect(pages[0].title).toBe('Hakkımızda - Güncel')
  })

  /**
   * getPageBySlug: Slug'a göre sayfa bulur
   */
  it('getPageBySlug - doğru sayfayı döndürmeli', () => {
    localStorage.store['petfendy_pages'] = JSON.stringify([mockPage])
    
    const result = getPageBySlug('hakkimizda')
    
    expect(result?.title).toBe('Hakkımızda')
  })

  /**
   * getPageBySlug: Sayfa bulunamazsa null döndürür
   */
  it('getPageBySlug - sayfa yoksa null döndürmeli', () => {
    localStorage.store['petfendy_pages'] = JSON.stringify([mockPage])
    
    const result = getPageBySlug('olmayan-sayfa')
    
    expect(result).toBeNull()
  })
})

// ============================================
// BLOG YÖNETİMİ TESTLERİ
// ============================================
describe('Blog Yönetimi', () => {
  const mockPost = {
    id: 'post-1',
    slug: 'kopek-bakimi',
    title: 'Köpek Bakımı Rehberi',
    content: '<p>Köpek bakımı hakkında bilgiler</p>',
    excerpt: 'Köpek bakımı özeti',
    author: 'Admin',
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10'
  }

  /**
   * getBlogPosts: Tüm blog yazılarını döndürür
   */
  it('getBlogPosts - boş dizi döndürmeli (yazı yoksa)', () => {
    const result = getBlogPosts()
    
    expect(result).toEqual([])
  })

  /**
   * saveBlogPost: Yeni blog yazısı ekler
   */
  it('saveBlogPost - yeni yazı eklemeli', () => {
    saveBlogPost(mockPost as any)
    
    const posts = JSON.parse(localStorage.store['petfendy_blog_posts'])
    expect(posts).toHaveLength(1)
    expect(posts[0].title).toBe('Köpek Bakımı Rehberi')
  })

  /**
   * getBlogPostBySlug: Slug'a göre yazı bulur
   */
  it('getBlogPostBySlug - doğru yazıyı döndürmeli', () => {
    localStorage.store['petfendy_blog_posts'] = JSON.stringify([mockPost])
    
    const result = getBlogPostBySlug('kopek-bakimi')
    
    expect(result?.title).toBe('Köpek Bakımı Rehberi')
  })

  /**
   * deleteBlogPost: Blog yazısını siler
   */
  it('deleteBlogPost - yazıyı silmeli', () => {
    localStorage.store['petfendy_blog_posts'] = JSON.stringify([mockPost])
    
    deleteBlogPost('post-1')
    
    const posts = JSON.parse(localStorage.store['petfendy_blog_posts'])
    expect(posts).toHaveLength(0)
  })
})

// ============================================
// GALERİ YÖNETİMİ TESTLERİ
// ============================================
describe('Galeri Yönetimi', () => {
  const mockImage = {
    id: 'img-1',
    url: '/images/pet1.jpg',
    title: 'Mutlu Köpek',
    description: 'Otelimizde mutlu bir köpek',
    category: 'dogs',
    createdAt: '2024-01-01'
  }

  /**
   * getGalleryImages: Tüm galeri resimlerini döndürür
   */
  it('getGalleryImages - boş dizi döndürmeli', () => {
    const result = getGalleryImages()
    
    expect(result).toEqual([])
  })

  /**
   * saveGalleryImage: Yeni resim ekler
   */
  it('saveGalleryImage - resim eklemeli', () => {
    saveGalleryImage(mockImage as any)
    
    const images = JSON.parse(localStorage.store['petfendy_gallery'])
    expect(images).toHaveLength(1)
    expect(images[0].title).toBe('Mutlu Köpek')
  })

  /**
   * deleteGalleryImage: Resmi siler
   */
  it('deleteGalleryImage - resmi silmeli', () => {
    localStorage.store['petfendy_gallery'] = JSON.stringify([mockImage])
    
    deleteGalleryImage('img-1')
    
    const images = JSON.parse(localStorage.store['petfendy_gallery'])
    expect(images).toHaveLength(0)
  })
})

// ============================================
// SSS YÖNETİMİ TESTLERİ
// ============================================
describe('SSS (FAQ) Yönetimi', () => {
  const mockFAQ = {
    id: 'faq-1',
    question: 'Rezervasyon nasıl yapılır?',
    answer: 'Online rezervasyon sistemimizi kullanabilirsiniz.',
    category: 'rezervasyon',
    order: 1,
    isPublished: true
  }

  /**
   * getFAQs: Tüm SSS'leri döndürür
   */
  it('getFAQs - boş dizi döndürmeli', () => {
    const result = getFAQs()
    
    expect(result).toEqual([])
  })

  /**
   * saveFAQ: Yeni SSS ekler
   */
  it('saveFAQ - SSS eklemeli', () => {
    saveFAQ(mockFAQ as any)
    
    const faqs = JSON.parse(localStorage.store['petfendy_faqs'])
    expect(faqs).toHaveLength(1)
    expect(faqs[0].question).toBe('Rezervasyon nasıl yapılır?')
  })

  /**
   * deleteFAQ: SSS'yi siler
   */
  it('deleteFAQ - SSS\'yi silmeli', () => {
    localStorage.store['petfendy_faqs'] = JSON.stringify([mockFAQ])
    
    deleteFAQ('faq-1')
    
    const faqs = JSON.parse(localStorage.store['petfendy_faqs'])
    expect(faqs).toHaveLength(0)
  })
})

// ============================================
// İLETİŞİM MESAJLARI TESTLERİ
// ============================================
describe('İletişim Mesajları Yönetimi', () => {
  const mockMessage = {
    id: 'msg-1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '05551234567',
    subject: 'Rezervasyon Sorusu',
    message: 'Rezervasyon hakkında bilgi almak istiyorum.',
    status: 'new' as const,
    createdAt: '2024-01-15'
  }

  /**
   * getContactMessages: Tüm mesajları döndürür
   */
  it('getContactMessages - boş dizi döndürmeli', () => {
    const result = getContactMessages()
    
    expect(result).toEqual([])
  })

  /**
   * saveContactMessage: Yeni mesaj ekler
   */
  it('saveContactMessage - mesaj eklemeli', () => {
    saveContactMessage(mockMessage as any)
    
    const messages = JSON.parse(localStorage.store['petfendy_contact_messages'])
    expect(messages).toHaveLength(1)
    expect(messages[0].name).toBe('Ahmet Yılmaz')
  })

  /**
   * updateContactMessageStatus: Mesaj durumunu günceller
   */
  it('updateContactMessageStatus - durumu güncellemeli', () => {
    localStorage.store['petfendy_contact_messages'] = JSON.stringify([mockMessage])
    
    updateContactMessageStatus('msg-1', 'read')
    
    const messages = JSON.parse(localStorage.store['petfendy_contact_messages'])
    expect(messages[0].status).toBe('read')
  })
})

// ============================================
// GENEL FONKSİYONLAR TESTLERİ
// ============================================
describe('Genel Fonksiyonlar', () => {
  /**
   * clearAllData: Tüm kullanıcı verilerini temizler
   * Çıkış yapıldığında çağrılır
   */
  it('clearAllData - tüm verileri temizlemeli', () => {
    sessionStorage.store['petfendy_auth_token'] = 'token'
    localStorage.store['petfendy_user'] = JSON.stringify({ id: '123' })
    localStorage.store['petfendy_temp_reservation'] = JSON.stringify({})
    
    clearAllData()
    
    expect(sessionStorage.removeItem).toHaveBeenCalled()
    expect(localStorage.removeItem).toHaveBeenCalled()
  })

  /**
   * setPendingUser: E-posta doğrulama bekleyen kullanıcıyı saklar
   */
  it('setPendingUser - bekleyen kullanıcıyı kaydetmeli', () => {
    const user = { email: 'test@example.com', name: 'Test' }
    
    setPendingUser(user)
    
    const saved = JSON.parse(localStorage.store['petfendy_pending_user'])
    expect(saved.email).toBe('test@example.com')
  })

  /**
   * getPendingUser: Bekleyen kullanıcıyı döndürür
   */
  it('getPendingUser - bekleyen kullanıcıyı döndürmeli', () => {
    localStorage.store['petfendy_pending_user'] = JSON.stringify({ email: 'test@example.com' })
    
    const result = getPendingUser()
    
    expect(result?.email).toBe('test@example.com')
  })

  /**
   * clearPendingUser: Bekleyen kullanıcıyı siler
   */
  it('clearPendingUser - bekleyen kullanıcıyı silmeli', () => {
    localStorage.store['petfendy_pending_user'] = JSON.stringify({ email: 'test@example.com' })
    
    clearPendingUser()
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('petfendy_pending_user')
  })
})
