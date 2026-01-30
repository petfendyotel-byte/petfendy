// Client-side storage management with security considerations
import type { User, HotelReservationData, Page, BlogPost, GalleryImage, FAQ, ContactMessage } from "./types"

const STORAGE_PREFIX = "petfendy_"
const TOKEN_KEY = `${STORAGE_PREFIX}auth_token`
const USER_KEY = `${STORAGE_PREFIX}user`
const TEMP_RESERVATION_KEY = `${STORAGE_PREFIX}temp_reservation`
const PENDING_USER_KEY = `${STORAGE_PREFIX}pending_user`
const PAGES_KEY = `${STORAGE_PREFIX}pages`
const BLOG_POSTS_KEY = `${STORAGE_PREFIX}blog_posts`
const GALLERY_KEY = `${STORAGE_PREFIX}gallery`
const FAQ_KEY = `${STORAGE_PREFIX}faqs`
const CONTACT_MESSAGES_KEY = `${STORAGE_PREFIX}contact_messages`

// Secure token storage
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

// User data storage
export function setCurrentUser(user: Partial<User>): void {
  if (typeof window !== "undefined") {
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
  }
}

export function getCurrentUser(): Partial<User> | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearCurrentUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY)
  }
}

// Temporary reservation storage
export function setTempReservation(reservation: HotelReservationData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TEMP_RESERVATION_KEY, JSON.stringify(reservation))
  }
}

export function getTempReservation(): HotelReservationData | null {
  if (typeof window !== "undefined") {
    const reservation = localStorage.getItem(TEMP_RESERVATION_KEY)
    return reservation ? JSON.parse(reservation) : null
  }
  return null
}

export function clearTempReservation(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TEMP_RESERVATION_KEY)
  }
}

// CMS Pages Management
export function getPages(): Page[] {
  if (typeof window !== "undefined") {
    const pages = localStorage.getItem(PAGES_KEY)
    return pages ? JSON.parse(pages) : []
  }
  return []
}

export function savePage(page: Page): void {
  if (typeof window !== "undefined") {
    const pages = getPages()
    const index = pages.findIndex(p => p.id === page.id)
    if (index >= 0) {
      pages[index] = page
    } else {
      pages.push(page)
    }
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages))
  }
}

export function getPageBySlug(slug: string): Page | null {
  const pages = getPages()
  return pages.find(p => p.slug === slug) || null
}

// Blog Management
export function getBlogPosts(): BlogPost[] {
  if (typeof window !== "undefined") {
    const posts = localStorage.getItem(BLOG_POSTS_KEY)
    return posts ? JSON.parse(posts) : []
  }
  return []
}

export function saveBlogPost(post: BlogPost): void {
  if (typeof window !== "undefined") {
    const posts = getBlogPosts()
    const index = posts.findIndex(p => p.id === post.id)
    if (index >= 0) {
      posts[index] = post
    } else {
      posts.push(post)
    }
    localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(posts))
  }
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getBlogPosts()
  return posts.find(p => p.slug === slug) || null
}

export function deleteBlogPost(id: string): void {
  if (typeof window !== "undefined") {
    const posts = getBlogPosts()
    const filtered = posts.filter(p => p.id !== id)
    localStorage.setItem(BLOG_POSTS_KEY, JSON.stringify(filtered))
  }
}

// Gallery Management
export function getGalleryImages(): GalleryImage[] {
  if (typeof window !== "undefined") {
    const images = localStorage.getItem(GALLERY_KEY)
    return images ? JSON.parse(images) : []
  }
  return []
}

export function saveGalleryImage(image: GalleryImage): void {
  if (typeof window !== "undefined") {
    const images = getGalleryImages()
    images.push(image)
    localStorage.setItem(GALLERY_KEY, JSON.stringify(images))
  }
}

export function deleteGalleryImage(id: string): void {
  if (typeof window !== "undefined") {
    const images = getGalleryImages()
    const filtered = images.filter(img => img.id !== id)
    localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered))
  }
}

// FAQ Management
export function getFAQs(): FAQ[] {
  if (typeof window !== "undefined") {
    const faqs = localStorage.getItem(FAQ_KEY)
    return faqs ? JSON.parse(faqs) : []
  }
  return []
}

export function saveFAQ(faq: FAQ): void {
  if (typeof window !== "undefined") {
    const faqs = getFAQs()
    const index = faqs.findIndex(f => f.id === faq.id)
    if (index >= 0) {
      faqs[index] = faq
    } else {
      faqs.push(faq)
    }
    localStorage.setItem(FAQ_KEY, JSON.stringify(faqs))
  }
}

export function deleteFAQ(id: string): void {
  if (typeof window !== "undefined") {
    const faqs = getFAQs()
    const filtered = faqs.filter(f => f.id !== id)
    localStorage.setItem(FAQ_KEY, JSON.stringify(filtered))
  }
}

// Contact Messages Management
export function getContactMessages(): ContactMessage[] {
  if (typeof window !== "undefined") {
    const messages = localStorage.getItem(CONTACT_MESSAGES_KEY)
    return messages ? JSON.parse(messages) : []
  }
  return []
}

export function saveContactMessage(message: ContactMessage): void {
  if (typeof window !== "undefined") {
    const messages = getContactMessages()
    messages.push(message)
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages))
  }
}

export function updateContactMessageStatus(id: string, status: 'new' | 'read' | 'replied'): void {
  if (typeof window !== "undefined") {
    const messages = getContactMessages()
    const message = messages.find(m => m.id === id)
    if (message) {
      message.status = status
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages))
    }
  }
}

export function clearAllData(): void {
  if (typeof window !== "undefined") {
    clearAuthToken()
    clearCurrentUser()
    clearTempReservation()
  }
}

// Pending user storage (for email verification)
export function setPendingUser(user: Partial<User>): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_USER_KEY, JSON.stringify(user))
  }
}

export function getPendingUser(): Partial<User> | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem(PENDING_USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearPendingUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_USER_KEY)
  }
}
