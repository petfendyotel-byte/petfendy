"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { HotelBooking } from "@/components/hotel-booking"
import { TaxiBooking } from "@/components/taxi-booking"
import { Cart } from "@/components/cart"
import { AdminDashboard } from "@/components/admin-dashboard"
import { PetManagement } from "@/components/pet-management"
import { UserProfile } from "@/components/user-profile"
import { InvoiceSystem } from "@/components/invoice-system"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, ShoppingCart, LayoutDashboard, PawPrint, User, FileText, BarChart3, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { getCart } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Home() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [activeTab, setActiveTab] = useState("hotel")
  const [cartCount, setCartCount] = useState(0)
  
  // Update cart count
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateCartCount = () => {
        setCartCount(getCart().length)
      }
      updateCartCount()
      
      // Listen for storage changes
      window.addEventListener('storage', updateCartCount)
      // Custom event for same-page cart updates
      window.addEventListener('cartUpdated', updateCartCount)
      
      return () => {
        window.removeEventListener('storage', updateCartCount)
        window.removeEventListener('cartUpdated', updateCartCount)
      }
    }
  }, [])
  
  // Auto-redirect to cart if user has items after login
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      // If admin, go to admin panel
      if (user?.role === "admin") {
        setActiveTab("admin")
      } else {
        // If user has cart items, go to cart
        const cart = getCart()
        if (cart.length > 0) {
          setActiveTab("cart")
        }
      }
    }
  }, [isAuthenticated, user?.role])
  
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/(tr|en)/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">{t('common.loading')}</p>
      </div>
    )
  }

  // Check if user has items in cart (coming from home page)
  const hasCartItems = typeof window !== 'undefined' && getCart().length > 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/${locale}/home`)}>
              <Image
                src="/petfendy-logo.svg"
                alt="Petfendy Logo"
                width={160}
                height={160}
                sizes="(max-width: 640px) 8rem, 10rem"
                className="w-32 h-32 sm:w-40 sm:h-40"
                priority
              />
            </div>
            
            {/* Language Selector */}
            <div className="flex justify-end mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" />
                    {locale === 'tr' ? 'TR' : 'EN'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => switchLocale('tr')}>
                    {t('common.turkish')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchLocale('en')}>
                    {t('common.english')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Optional Title hidden to avoid duplication with logo text */}
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              {t('common.appTagline')}
            </p>
            
            {hasCartItems && (
              <Alert className="mt-4">
                <AlertDescription>
                  Rezervasyonunuzu tamamlamak için lütfen giriş yapın veya kayıt olun
                </AlertDescription>
              </Alert>
            )}
          </div>

          {showRegister ? (
            <div className="space-y-4">
              <RegisterForm onSuccess={() => setShowRegister(false)} />
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowRegister(false)}>
                {t('common.login')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <LoginForm onSuccess={() => {}} />
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowRegister(true)}>
                {t('common.register')}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push(`/${locale}/home`)}>
                ← Ana Sayfaya Dön
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(`/${locale}/home`)}
            >
              <Image
                src="/petfendy-logo.svg"
                alt="Petfendy Logo"
                width={64}
                height={64}
                className="h-12 w-12 sm:h-16 sm:w-16"
                priority
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex gap-2 items-center">
              {/* User Welcome */}
              <div className="hidden md:block text-right mr-2">
                <p className="text-sm opacity-90">{t('home.welcomeMessage', { name: user?.name })}</p>
              </div>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">{locale === 'tr' ? 'TR' : 'EN'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => switchLocale('tr')}>
                    {t('common.turkish')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchLocale('en')}>
                    {t('common.english')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout Button */}
              <Button variant="outline" onClick={logout} className="gap-2 bg-transparent" size="sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 overflow-x-auto">
            <TabsTrigger value="hotel" className="text-xs sm:text-sm">
              {t('tabs.hotel')}
            </TabsTrigger>
            <TabsTrigger value="taxi" className="text-xs sm:text-sm">
              {t('tabs.taxi')}
            </TabsTrigger>
            <TabsTrigger value="pets" className="gap-1 text-xs sm:text-sm">
              <PawPrint className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('tabs.pets')}</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="gap-1 text-xs sm:text-sm relative">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('tabs.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('tabs.invoices')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('tabs.reports')}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1 text-xs sm:text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('tabs.profile')}</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-1 text-xs sm:text-sm">
                <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('tabs.admin')}</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="hotel" className="mt-6">
            <HotelBooking />
          </TabsContent>

          <TabsContent value="taxi" className="mt-6">
            <TaxiBooking />
          </TabsContent>

          <TabsContent value="pets" className="mt-6">
            <PetManagement />
          </TabsContent>

          <TabsContent value="cart" className="mt-6">
            <Cart />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <InvoiceSystem />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsAnalytics />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

