"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/components/auth-context"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { HotelBooking } from "@/components/hotel-booking"
import { TaxiBooking } from "@/components/taxi-booking"
import { AdminDashboard } from "@/components/admin-dashboard"
import { PetManagement } from "@/components/pet-management"
import { UserProfile } from "@/components/user-profile"
import { InvoiceSystem } from "@/components/invoice-system"
import { ReportsAnalytics } from "@/components/reports-analytics"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, LayoutDashboard, PawPrint, User, FileText, BarChart3, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function Home() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)
  const [activeTab, setActiveTab] = useState("hotel")
  
  // Auto-redirect to admin panel if admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      setActiveTab("admin")
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/${locale}/home`)}>
              <div className="w-48 h-32 sm:w-56 sm:h-40">
                <Image
                  src="/petfendy-logo.svg"
                  alt="Petfendy Logo"
                  width={224}
                  height={160}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-lg p-1">
                <Image
                  src="/images/petfendy-main-logo.png"
                  alt="Petfendy Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:block text-lg md:text-xl font-bold">Petfendy</span>
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 overflow-x-auto">
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

