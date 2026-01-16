import { NextResponse } from 'next/server'

// Instagram Basic Display API - Canlı gönderi çekme
// Docs: https://developers.facebook.com/docs/instagram-basic-display-api

interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

interface InstagramResponse {
  data: InstagramPost[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
  }
}

// Cache için basit in-memory store (production'da Redis kullanılabilir)
let cachedPosts: InstagramPost[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 dakika

export async function GET() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    
    if (!accessToken) {
      console.warn('Instagram Access Token bulunamadı')
      return NextResponse.json({ 
        success: false, 
        error: 'Instagram yapılandırılmamış',
        posts: [] 
      })
    }

    // Cache kontrolü
    const now = Date.now()
    if (cachedPosts && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        success: true, 
        posts: cachedPosts,
        cached: true 
      })
    }

    // Instagram API'den son 6 gönderiyi çek
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=6&access_token=${accessToken}`
    
    const response = await fetch(url, {
      next: { revalidate: 600 } // 10 dakika cache
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Instagram API hatası:', errorData)
      
      // Token süresi dolmuş olabilir
      if (errorData.error?.code === 190) {
        return NextResponse.json({ 
          success: false, 
          error: 'Instagram token süresi dolmuş',
          posts: [] 
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Instagram gönderileri alınamadı',
        posts: [] 
      })
    }

    const data: InstagramResponse = await response.json()
    
    // Sadece resim ve carousel gönderilerini al (video hariç)
    const posts = data.data
      .filter(post => post.media_type !== 'VIDEO')
      .slice(0, 6)
      .map(post => ({
        id: post.id,
        caption: post.caption || '',
        media_type: post.media_type,
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url,
        permalink: post.permalink,
        timestamp: post.timestamp
      }))

    // Cache'e kaydet
    cachedPosts = posts
    cacheTimestamp = now

    return NextResponse.json({ 
      success: true, 
      posts,
      cached: false 
    })

  } catch (error) {
    console.error('Instagram API hatası:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Bir hata oluştu',
      posts: [] 
    })
  }
}
