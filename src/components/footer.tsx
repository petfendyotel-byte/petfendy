"use client"

import { Instagram, Phone, Mail, MapPin, PawPrint, Heart } from "lucide-react"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-orange-950 to-pink-950 text-white py-16 px-4 overflow-hidden">
      {/* Decorative Pet Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawPrint className="absolute top-10 left-10 w-20 h-20 text-orange-500/10 animate-float" style={{ animationDelay: '0s' }} />
        <PawPrint className="absolute top-20 right-20 w-16 h-16 text-pink-500/10 animate-float" style={{ animationDelay: '1s' }} />
        <PawPrint className="absolute bottom-20 left-1/4 w-24 h-24 text-orange-400/10 animate-float" style={{ animationDelay: '2s' }} />
        <PawPrint className="absolute bottom-32 right-1/3 w-18 h-18 text-pink-400/10 animate-float" style={{ animationDelay: '1.5s' }} />
        <Heart className="absolute top-1/2 left-1/2 w-32 h-32 text-orange-500/5 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: PETFENDY */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="w-6 h-6 text-orange-400 animate-bounce-slow" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                PETFENDY
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Evcil dostlarınız için güvenli ve konforlu bir yuva
            </p>
          </div>

          {/* Column 2: Hizmetler */}
          <div>
            <h3 className="font-bold mb-4 text-orange-400">Hizmetler</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`/${locale}`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Pet Otel</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Pet Taksi</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/hakkimda`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Hakkımızda</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/blog`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Blog</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Yardım */}
          <div>
            <h3 className="font-bold mb-4 text-pink-400">Yardım</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`/${locale}/sss`} className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Sık Sorulan Sorular</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/iletisim`} className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>İletişim</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: İletişim */}
          <div>
            <h3 className="font-bold mb-4 text-orange-400">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="tel:+905323073264" 
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-start gap-2 group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+90 532 307 32 64</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:petfendyotel@gmail.com" 
                  className="text-gray-300 hover:text-orange-400 transition-colors flex items-start gap-2 group"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>petfendyotel@gmail.com</span>
                </a>
              </li>
              <li className="text-gray-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Bağlıca, Şehit Hikmet Özer Cd. No:101, Etimesgut/Ankara</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Politikalar */}
          <div>
            <h3 className="font-bold mb-4 text-pink-400">Politikalar</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Gizlilik ve Kişisel Verilerin Korunması</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>İptal ve İade Politikası</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Mesafeli Satış Politikası</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Çerez Politikası</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t-2 border-orange-500/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-orange-400" />
              <p className="text-sm text-gray-300">
                © 2025 Petfendy.com. Tüm hakları saklıdır.
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/petfendy/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-orange-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-500/20"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-pink-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink-500/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-orange-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-500/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Policy Links */}
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
                Gizlilik
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors font-medium">
                Çerezler
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

