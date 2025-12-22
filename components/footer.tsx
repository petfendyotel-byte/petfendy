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
            <div className="flex items-center gap-4">
              {/* Visa */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="32" viewBox="0 0 16 16" width="32">
                <path clipRule="evenodd" d="m11.6681 5.64333c-.2787-.11-.7634-.23-1.148-.23-1.31138 0-2.23405.654-2.24538 1.62867-.00927.75629.67749 1.13563 1.1728 1.40921l.00987.00545c.496.27334.63201.38334.62931.60467-.0033.31133-.38265.49-.82465.49-.48266 0-.722-.07533-1.28666-.312l-.23467 1.08337c.55467.1966.8.254 1.48.264 1.49068 0 2.19738-.82604 2.20598-1.66337.008-.40333-.076-.77467-.7153-1.188-.1603-.1038-.3193-.19159-.4645-.27183-.36234-.20011-.63951-.35319-.63951-.59017 0-.204.31333-.41667.82001-.42533.3487-.00467.7633.132 1.0153.23333zm-5.61077-.13733-1.35066-.00133-1.354 3.38933-.12969-.69063c-.2101-1.11883-.34438-1.83395-.40365-2.14537-.07-.37067-.288-.55133-.66133-.55133h-2.158v.13666c.528.16334.904667.28334 1.13067.36134.254.08733.386.272.45266.536.33528 1.32465.67484 2.64821 1.01867 3.97063l1.36733.0014zm8.75737 5.006-.15-.75h-1.676l-.2667.7447-1.3433.0026c.6395-1.53788 1.2804-3.07521 1.9227-4.61197.1093-.26067.3033-.39333.5893-.392.2187.002.5753.002 1.0707.00067l1.0386 5.004zm-1.4486-1.77734h1.08l-.4034-1.88zm-5.45271-3.22866-1.068 5.0053-1.28534-.0013 1.06667-5.00533z" className="fill-gray-300" fillRule="evenodd"></path>
              </svg>
              {/* Mastercard */}
              <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="32" height="32" viewBox="0 0 256.000000 256.000000" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,256.000000) scale(0.100000,-0.100000)" className="fill-gray-300" stroke="none">
                  <path d="M666 1934 c-345 -83 -566 -443 -491 -798 48 -225 235 -426 460 -496 198 -60 431 -21 592 101 l53 40 43 -34 c137 -112 350 -161 535 -123 149 30 265 96 370 211 254 278 222 715 -70 963 -122 103 -261 152 -433 152 -151 0 -279 -41 -396 -126 -26 -19 -49 -34 -53 -34 -3 0 -27 16 -53 36 -112 86 -236 124 -393 123 -58 0 -131 -7 -164 -15z"></path>
                </g>
              </svg>
              {/* Troy */}
              <svg xmlns="http://www.w3.org/2000/svg" className="fill-gray-300" width="32" height="32" viewBox="0 -6 36 36">
                <path d="m33.6 24h-31.2c-1.325 0-2.4-1.075-2.4-2.4v-19.2c0-1.325 1.075-2.4 2.4-2.4h31.2c1.325 0 2.4 1.075 2.4 2.4v19.2c0 1.325-1.075 2.4-2.4 2.4zm-8.689-15.321c-.07-.002-.151-.004-.233-.004-.213 0-.424.01-.632.028l.027-.002c-.01.03.542 1.996 1.066 3.83l.064.224c1.114 3.896 1.114 3.896.937 4.274-.153.313-.392.565-.686.729l-.008.004-.231.116-.994.019c-.96.02-.998.024-1.12.111-.228.164-.315.425-.489 1.467-.09.55-.16.982-.16 1.006.148.031.318.049.492.049.084 0 .167-.004.249-.012l-.01.001c.214 0 .48 0 .812-.006.17.016.367.025.566.025.484 0 .956-.054 1.409-.157l-.043.008c1.072-.313 1.958-.975 2.55-1.852l.01-.016c.197-.286 5.257-9.732 5.257-9.814-.167-.024-.359-.038-.555-.038-.09 0-.178.003-.267.009l.012-.001h-.594l-1.4.011-.266.132c-.149.071-.277.163-.385.274-.067.08-.528 1.088-1.12 2.445-.344.887-.691 1.622-1.083 2.33l.049-.096c-.022-.046-.218-1.266-.378-2.282-.187-1.218-.366-2.27-.4-2.346-.065-.168-.191-.3-.349-.372l-.004-.002c-.151-.08-.223-.08-1.539-.095h-.553z"></path>
              </svg>
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
