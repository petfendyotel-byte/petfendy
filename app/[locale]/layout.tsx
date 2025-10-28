import type React from "react"
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const locales = ['tr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: "Petfendy - Evcil Hayvan Oteli Ve Köpek Eğitim Merkezi | Ankara",
  description: "Ankara'nın en güvenilir kedi, köpek ve evcil hayvan oteli. Profesyonel köpek eğitimi, pet taksi ve konforlu konaklama hizmetleri.",
  keywords: "petfendy, evcil hayvan oteli, köpek oteli, kedi oteli, ankara pet hotel, köpek eğitimi, pet taksi, hayvan oteli ankara",
  authors: [{ name: "Petfendy" }],
  creator: "Petfendy",
  publisher: "Petfendy",
  openGraph: {
    title: "Petfendy - Evcil Hayvan Oteli Ve Köpek Eğitim Merkezi",
    description: "Ankara'nın kedi, köpek ve evcil hayvan oteli",
    type: "website",
    locale: "tr_TR",
    siteName: "Petfendy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petfendy - Evcil Hayvan Oteli",
    description: "Ankara'nın kedi, köpek ve evcil hayvan oteli",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params in Next.js 16+
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'tr';
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages dynamically with error handling
  let messages;
  try {
    messages = (await import(`../../i18n/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to Turkish
    messages = (await import(`../../i18n/messages/tr.json`)).default;
  }

  return (
    <html lang={locale}>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}

