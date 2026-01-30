"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Menu, X, PawPrint } from "lucide-react"
import { useTranslations } from 'next-intl'

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const router = useRouter()
  const tCommon = useTranslations('common')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}/home`, label: 'Ana Sayfa' },
    { href: `/${locale}/hakkimda`, label: 'Hakkımızda' },
    { href: `/${locale}/hizmetler`, label: 'Hizmetler' },
    { href: `/${locale}/blog`, label: 'Blog' },
    { href: `/${locale}/galeri`, label: 'Galeri' },
    { href: `/${locale}/iletisim`, label: 'Bize Ulaşın' },
    { href: `/${locale}/sss`, label: 'SSS' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b-2 border-orange-200/50 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={`/${locale}/home`} className="flex items-center gap-3 group hover:opacity-80 transition-all duration-300">
            <div className="relative shrink-0 w-16 h-12 group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/petfendy-logo.svg"
                alt="Petfendy Logo"
                width={64}
                height={48}
                className="w-full h-full object-contain drop-shadow-md"
                priority
              />
              {/* Decorative Paw Print */}
              <PawPrint className="absolute -bottom-1 -right-1 w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-xl font-bold text-gradient bg-gradient-to-r from-orange-500 via-pink-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-pink-600 group-hover:to-orange-700 transition-all duration-300">
                PETFENDY
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block mt-0.5 font-medium">
                Evcil Hayvan Oteli
              </p>
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
                {link.label}
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
                  {link.label}
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
