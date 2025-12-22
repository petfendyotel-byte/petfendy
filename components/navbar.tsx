"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Menu, X } from "lucide-react"
import { useTranslations } from 'next-intl'

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const router = useRouter()
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}/hakkimda`, labelKey: 'about' },
    { href: `/${locale}/hizmetler`, labelKey: 'services' },
    { href: `/${locale}/blog`, labelKey: 'blog' },
    { href: `/${locale}/galeri`, labelKey: 'gallery' },
    { href: `/${locale}/iletisim`, labelKey: 'contact' },
    { href: `/${locale}/sss`, labelKey: 'faq' },
  ]

  // Fallback labels if translations not found
  const fallbackLabels: Record<string, string> = {
    about: locale === 'en' ? 'About Us' : 'Hakkımızda',
    services: locale === 'en' ? 'Services' : 'Hizmetler',
    blog: 'Blog',
    gallery: locale === 'en' ? 'Gallery' : 'Galeri',
    contact: locale === 'en' ? 'Contact' : 'Bize Ulaşın',
    faq: locale === 'en' ? 'FAQ' : 'SSS',
  }

  const getLabel = (key: string) => {
    try {
      return tNav(key)
    } catch {
      return fallbackLabels[key] || key
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b-2 border-orange-200/50 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={`/${locale}/home`} className="flex items-center group hover:opacity-90 transition-all duration-300">
            <div className="relative shrink-0 h-14 sm:h-16 md:h-18 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/petfendy-main-logo.png"
                alt="Petfendy"
                width={180}
                height={72}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:text-orange-600 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 dark:hover:text-orange-400 transition-all duration-300 relative group"
              >
                {getLabel(link.labelKey)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <LanguageToggle />
            <Button
              onClick={() => router.push(`/${locale}`)}
              className="gradient-orange-pink hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-xl hidden md:inline-flex px-6"
            >
              {tCommon('login')}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t-2 border-orange-200/50 dark:border-gray-800 pt-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:text-orange-600 dark:hover:from-orange-900/20 dark:hover:to-pink-900/20 dark:hover:text-orange-400 transition-all duration-300 py-3 px-4 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {getLabel(link.labelKey)}
                </Link>
              ))}
              <Button
                onClick={() => {
                  router.push(`/${locale}`)
                  setMobileMenuOpen(false)
                }}
                className="gradient-orange-pink hover:opacity-90 text-white font-semibold shadow-lg hover-scale rounded-xl w-full mt-2"
              >
                {tCommon('login')}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
