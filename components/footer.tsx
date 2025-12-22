"use client"

import { Instagram, Phone, Mail, MapPin, PawPrint, Heart } from "lucide-react"
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')
  
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
              {t('slogan')}
            </p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="font-bold mb-4 text-orange-400">{t('services')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`/${locale}/booking/hotel`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('petHotel')}</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/booking/taxi`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('petTaxi')}</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/hakkimda`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('aboutUs')}</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/blog`} className="text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('blog')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="font-bold mb-4 text-pink-400">{t('help')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`/${locale}/sss`} className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('faq')}</span>
                </a>
              </li>
              <li>
                <a href={`/${locale}/iletisim`} className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('contact')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold mb-4 text-orange-400">{t('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+905323073264" className="text-gray-300 hover:text-orange-400 transition-colors flex items-start gap-2 group">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+90 532 307 32 64</span>
                </a>
              </li>
              <li>
                <a href="mailto:petfendyotel@gmail.com" className="text-gray-300 hover:text-orange-400 transition-colors flex items-start gap-2 group">
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

          {/* Column 5: Policies */}
          <div>
            <h3 className="font-bold mb-4 text-pink-400">{t('policies')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('privacy')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('refund')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('distance')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors flex items-center gap-2 group">
                  <PawPrint className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{t('cookies')}</span>
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
              <p className="text-sm text-gray-300">{t('copyright')}</p>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-3">
              {/* Visa */}
              <div className="bg-white rounded-md px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 750 471">
                  <g fill="none" fillRule="evenodd">
                    <rect width="750" height="471" fill="#0E4595" rx="40"/>
                    <path fill="#fff" d="M278.198 334.228l33.36-195.763h53.358l-33.384 195.763h-53.334zm246.11-191.54c-10.57-3.966-27.135-8.222-47.822-8.222-52.725 0-89.863 26.551-90.18 64.604-.297 28.129 26.514 43.821 46.754 53.185 20.77 9.597 27.752 15.716 27.652 24.283-.133 13.123-16.586 19.116-31.924 19.116-21.355 0-32.701-2.967-50.225-10.274l-6.878-3.111-7.487 43.822c12.463 5.467 35.508 10.199 59.438 10.445 56.09 0 92.502-26.248 92.916-66.884.199-22.27-14.016-39.216-44.801-53.188-18.65-9.056-30.072-15.099-29.951-24.269 0-8.137 9.668-16.838 30.56-16.838 17.446-.271 30.089 3.527 39.936 7.496l4.781 2.26 7.231-42.425zm137.31-4.223h-41.23c-12.773 0-22.332 3.486-27.941 16.234l-79.244 179.402h56.031s9.16-24.121 11.232-29.418c6.123 0 60.555.084 68.336.084 1.596 6.854 6.492 29.334 6.492 29.334h49.512l-43.188-195.636zm-65.418 126.408c4.414-11.279 21.26-54.724 21.26-54.724-.314.521 4.381-11.334 7.074-18.684l3.607 16.878s10.217 46.729 12.352 56.53h-44.293zM209.394 138.465l-52.24 133.496-5.565-27.129c-9.726-31.274-40.025-65.157-73.898-82.12l47.767 171.204 56.455-.064 84.004-195.387h-56.523"/>
                  </g>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white rounded-md px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 750 471">
                  <g fill="none" fillRule="evenodd">
                    <rect width="750" height="471" fill="#000" rx="40"/>
                    <circle cx="250" cy="235" r="150" fill="#EB001B"/>
                    <circle cx="500" cy="235" r="150" fill="#F79E1B"/>
                    <path fill="#FF5F00" d="M375 119.5c38.5 31.5 63 79.5 63 133.5s-24.5 102-63 133.5c-38.5-31.5-63-79.5-63-133.5s24.5-102 63-133.5z"/>
                  </g>
                </svg>
              </div>
              {/* Troy */}
              <div className="bg-white rounded-md px-2 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 750 471">
                  <g fill="none" fillRule="evenodd">
                    <rect width="750" height="471" fill="#004B93" rx="40"/>
                    <path fill="#fff" d="M200 180h50v110h-50zM280 180h120l-35 110h-50zM430 180h70l50 55-50 55h-70zM530 180h70v110h-70z"/>
                    <text fill="#fff" fontFamily="Arial" fontSize="60" fontWeight="bold" x="375" y="300" textAnchor="middle">TROY</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/petfendy/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-500/20">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink-500/20">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-orange-400 hover:scale-110 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-500/20">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Policy Links */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-gray-400">
              <span>© 2025 PetFendy.com</span>
              <span className="hidden sm:inline">·</span>
              <a href={`/${locale}/gizlilik-politikasi`} className="hover:text-orange-400 transition-colors">Gizlilik ve Kişisel Verilerin Korunması Politikası</a>
              <span className="hidden sm:inline">·</span>
              <a href={`/${locale}/iptal-iade`} className="hover:text-orange-400 transition-colors">İptal ve İade Politikası</a>
              <span className="hidden sm:inline">·</span>
              <a href={`/${locale}/mesafeli-satis`} className="hover:text-orange-400 transition-colors">Mesafeli Satış Politikası</a>
              <span className="hidden sm:inline">·</span>
              <a href={`/${locale}/on-bilgilendirme`} className="hover:text-orange-400 transition-colors">Ön Bilgilendirme Formu</a>
              <span className="hidden sm:inline">·</span>
              <a href={`/${locale}/cerez-politikasi`} className="hover:text-orange-400 transition-colors">Çerez Politikası</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
