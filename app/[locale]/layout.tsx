import type React from "react"
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { RecaptchaProvider } from "@/components/recaptcha-provider"

const geistSans = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-geist-sans',
  adjustFontFallback: true,
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap', 
  preload: true,
  variable: '--font-geist-mono',
  adjustFontFallback: true,
})

const locales = ['tr', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: "Pet Otel Ankara | Pet Taksi Ankara | Pet Kreş Ankara - Petfendy",
  description: "Ankara'da pet otel ve pet kreş, 81 ilde pet taksi hizmeti. Kedi köpek oteli, güvenli hayvan taksi, günlük pet kreş. 7/24 profesyonel bakım. ⭐ 5 yıldızlı hizmet ⭐",
  keywords: "pet otel ankara, pet taksi ankara, pet kreş ankara, ankara pet otel, ankara pet taksi, ankara pet kreş, hayvan oteli ankara, kedi oteli ankara, köpek oteli ankara, evcil hayvan oteli ankara, hayvan taksi ankara, pet pansiyonu ankara, hayvan pansiyonu ankara, kedi pansiyonu ankara, köpek pansiyonu ankara, pet hotel ankara, animal hotel ankara, pet boarding ankara, dog hotel ankara, cat hotel ankara, pet daycare ankara, petfendy ankara, etimesgut pet otel, ankara evcil hayvan bakım, pet kuaför ankara, köpek eğitimi ankara",
  authors: [{ name: "Petfendy Pet Otel Ankara" }],
  creator: "Petfendy - Ankara Pet Otel & Pet Taksi",
  publisher: "BSG Evcil Hayvan Bakım Ltd. Şti.",
  metadataBase: new URL('https://petfendy.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  // Facebook Domain Verification
  verification: {
    facebook: 'qbbtfhzhlsy8o3ypu4m0bjz99rwnph',
    google: 'google-site-verification-code', // Gerçek kod ile değiştirilecek
  },
  openGraph: {
    title: "Pet Otel Ankara | Pet Taksi Ankara | Pet Kreş Ankara - Petfendy",
    description: "Ankara'da güvenilir pet oteli ve pet kreş, 81 ilde pet taksi hizmeti. Kedi, köpek ve tüm evcil hayvanlarınız için 7/24 profesyonel bakım. Etimesgut merkezli, Ankara geneli hizmet.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    siteName: "Petfendy - Ankara Pet Otel",
    url: "https://petfendy.com",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Petfendy - Ankara Pet Otel, Pet Taksi ve Pet Kreş Hizmetleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pet Otel Ankara | Pet Taksi Ankara | Pet Kreş Ankara - Petfendy",
    description: "Ankara'da pet otel ve pet kreş, 81 ilde pet taksi hizmeti. 7/24 profesyonel bakım, güvenli konaklama.",
    images: ["/images/og-image.jpg"],
    site: "@petfendy",
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
  classification: 'Pet Hotel Ankara, Pet Taxi Ankara, Pet Daycare Ankara, Animal Care Services',
  other: {
    'geo.region': 'TR-06',
    'geo.placename': 'Ankara',
    'geo.position': '39.9334;32.8597',
    'ICBM': '39.9334, 32.8597',
  },
}

// JSON-LD Structured Data for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://petfendy.com',
  name: 'Petfendy - Ankara Pet Otel, Pet Taksi ve Pet Kreş',
  alternateName: ['Petfendy Hayvan Oteli', 'Ankara Pet Otel', 'Ankara Pet Taksi', 'Ankara Pet Kreş'],
  description: 'Ankara\'da pet otel ve pet kreş, 81 ilde pet taksi hizmeti. Kedi köpek oteli, güvenli hayvan taksi, günlük pet kreş. Etimesgut merkezli, Ankara geneli hizmet.',
  url: 'https://petfendy.com',
  telephone: '+905323073264',
  email: 'petfendyotel@gmail.com',
  image: 'https://petfendy.com/images/petfendy-main-logo.png',
  logo: 'https://petfendy.com/images/petfendy-main-logo.png',
  priceRange: '₺₺',
  paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
  currenciesAccepted: 'TRY',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'İstasyon Mah. Şehit Hikmet Özer Cd. No:101',
    addressLocality: 'Etimesgut',
    addressRegion: 'Ankara',
    postalCode: '06790',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.9334,
    longitude: 32.8597,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Ankara',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Etimesgut',
    },
    {
      '@type': 'AdministrativeArea', 
      name: 'Çankaya',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Keçiören',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Yenimahalle',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Mamak',
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/petfendy/',
    'https://www.facebook.com/petfendy',
    'https://www.youtube.com/@petfendy',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Petfendy Ankara Pet Hizmetleri',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pet Otel Ankara',
          description: 'Ankara\'da kedi ve köpekler için güvenli, konforlu konaklama hizmeti. 7/24 profesyonel bakım.',
          serviceType: 'Pet Hotel',
          areaServed: 'Ankara',
        },
        priceRange: '₺₺',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pet Taksi Ankara',
          description: 'Ankara\'da evcil hayvanlarınız için güvenli, konforlu ulaşım hizmeti. Şehirler arası pet taksi.',
          serviceType: 'Pet Transportation',
          areaServed: 'Ankara',
        },
        priceRange: '₺₺',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pet Kreş Ankara',
          description: 'Ankara\'da günlük pet kreş hizmeti. Evcil hayvanlarınız için oyun, sosyalleşme ve profesyonel bakım.',
          serviceType: 'Pet Daycare',
          areaServed: 'Ankara',
        },
        priceRange: '₺₺',
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Ayşe K.',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: 'Ankara\'da en iyi pet otel hizmeti. Kedim çok mutlu kaldı, kesinlikle tavsiye ederim.',
      datePublished: '2024-12-15',
    },
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Mehmet Y.',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: 'Pet taksi hizmeti çok güvenli ve konforlu. Köpeğim stres yaşamadı.',
      datePublished: '2024-12-10',
    },
  ],
  potentialAction: {
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://petfendy.com/tr/booking/hotel',
    },
    result: {
      '@type': 'Reservation',
      name: 'Pet Otel Rezervasyonu',
    },
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
        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="qbbtfhzhlsy8o3ypu4m0bjz99rwnph" />
        
        {/* Local Business SEO Meta Tags */}
        <meta name="geo.region" content="TR-06" />
        <meta name="geo.placename" content="Ankara" />
        <meta name="geo.position" content="39.9334;32.8597" />
        <meta name="ICBM" content="39.9334, 32.8597" />
        <meta name="business.contact_data.locality" content="Ankara" />
        <meta name="business.contact_data.region" content="Ankara" />
        <meta name="business.contact_data.country" content="Turkey" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Petfendy Pet Otel" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          as="image"
          href="/images/slider-hotel.jpg"
          fetchPriority="high"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Additional Structured Data for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Ankara\'da pet otel hizmeti veriyor musunuz?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Evet, Petfendy olarak Ankara\'da kedi ve köpekler için 7/24 pet otel hizmeti veriyoruz. Etimesgut merkezli olarak Ankara geneline hizmet sunmaktayız.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Pet taksi hizmeti nasıl çalışıyor?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Pet taksi hizmetimiz ile evcil hayvanlarınızı güvenli araçlarımızla istediğiniz adrese ulaştırıyoruz. Ankara içi ve şehirler arası pet taksi hizmeti sunmaktayız.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Pet kreş hizmeti var mı?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Evet, günlük pet kreş hizmetimiz ile evcil hayvanlarınız oyun, sosyalleşme ve profesyonel bakım hizmeti alabilir.',
                  },
                },
              ],
            })
          }}
        />
        
        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Ana Sayfa',
                  item: 'https://petfendy.com',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Pet Otel Ankara',
                  item: 'https://petfendy.com/tr/booking/hotel',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Pet Taksi Ankara',
                  item: 'https://petfendy.com/tr/booking/taxi',
                },
              ],
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RecaptchaProvider siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <AuthProvider>{children}</AuthProvider>
              <Toaster />
              <WhatsAppButton />
            </NextIntlClientProvider>
          </RecaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

