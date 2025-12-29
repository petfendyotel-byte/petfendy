import type React from "react"
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WhatsAppButton } from "@/components/whatsapp-button"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const locales = ['tr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: "Ankara Pet Otel & Pet Taksi | Petfendy Hayvan Oteli",
  description: "Ankara pet otel, ankara pet taksi, ankara hayvan oteli hizmetleri. Kedi ve köpek oteli, profesyonel hayvan taksi servisi. 7/24 güvenli konaklama ve ulaşım.",
  keywords: "ankara pet otel, ankara pet taksi, ankara hayvan oteli, ankara hayvan taksi, pet otel ankara, pet taksi ankara, kedi oteli ankara, köpek oteli ankara, evcil hayvan oteli, petfendy, hayvan pansiyonu ankara, kedi pansiyonu, köpek pansiyonu",
  authors: [{ name: "Petfendy" }],
  creator: "Petfendy",
  publisher: "Petfendy",
  metadataBase: new URL('https://petfendy.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: "Ankara Pet Otel & Pet Taksi | Petfendy Hayvan Oteli",
    description: "Ankara'nın en güvenilir pet oteli ve pet taksi hizmeti. Kedi, köpek ve tüm evcil hayvanlarınız için 7/24 profesyonel bakım ve ulaşım.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    siteName: "Petfendy",
    url: "https://petfendy.com",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Petfendy - Ankara Pet Otel ve Pet Taksi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ankara Pet Otel & Pet Taksi | Petfendy",
    description: "Ankara'nın en güvenilir pet oteli ve pet taksi hizmeti. Kedi, köpek için 7/24 profesyonel bakım.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  category: 'pet services',
  classification: 'Pet Hotel, Pet Taxi, Animal Care',
}

// JSON-LD Structured Data for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://petfendy.com',
  name: 'Petfendy - Ankara Pet Otel & Pet Taksi',
  alternateName: 'Petfendy Hayvan Oteli',
  description: 'Ankara pet otel, pet taksi, hayvan oteli ve hayvan taksi hizmetleri. Kedi ve köpek pansiyonu, profesyonel evcil hayvan bakımı.',
  url: 'https://petfendy.com',
  telephone: '+905551234567', // Gerçek telefon numarası ile değiştirilecek
  email: 'info@petfendy.com',
  image: 'https://petfendy.com/images/og-image.jpg',
  logo: 'https://petfendy.com/images/petfendy-main-logo.png',
  priceRange: '₺₺',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ankara', // Gerçek adres ile değiştirilecek
    addressLocality: 'Ankara',
    addressRegion: 'Ankara',
    postalCode: '06000',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.9334, // Gerçek koordinatlar ile değiştirilecek
    longitude: 32.8597,
  },
  areaServed: {
    '@type': 'City',
    name: 'Ankara',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
  sameAs: [
    'https://www.instagram.com/petfendy/',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Petfendy Hizmetleri',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Ankara Pet Otel',
          description: 'Kedi ve köpekler için güvenli, konforlu konaklama hizmeti',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Ankara Pet Taksi',
          description: 'Evcil hayvanlarınız için güvenli ulaşım hizmeti',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Ankara Hayvan Oteli',
          description: 'Profesyonel hayvan bakım ve konaklama hizmeti',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '50',
    bestRating: '5',
    worstRating: '1',
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
            <WhatsAppButton />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

