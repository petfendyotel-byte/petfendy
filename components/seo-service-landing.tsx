import Link from "next/link"
import { CheckCircle, Phone } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { absoluteUrl, localizedPath, serializeJsonLd } from "@/lib/seo"

export interface LandingSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LandingFaq {
  question: string
  answer: string
}

export interface LandingRelatedLink {
  path: string
  label: string
}

export interface SeoServiceLandingProps {
  locale: string
  /** Sayfanın yolu (locale öneki olmadan), ör. "ankara-kedi-oteli" */
  path: string
  eyebrow: string
  h1: string
  intro: string
  serviceName: string
  serviceType: string
  ctaPath: string
  ctaLabel: string
  highlights: string[]
  sections: LandingSection[]
  faqs: LandingFaq[]
  related: LandingRelatedLink[]
}

const BUSINESS_ID = "https://petfendy.com/tr/home#business"

export function SeoServiceLanding(props: SeoServiceLandingProps) {
  const { locale, path, eyebrow, h1, intro, serviceName, serviceType, ctaPath, ctaLabel, highlights, sections, faqs, related } = props
  const pageUrl = absoluteUrl(localizedPath(locale, path))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: serviceName,
        serviceType,
        url: pageUrl,
        areaServed: { "@type": "AdministrativeArea", name: "Ankara" },
        provider: { "@id": BUSINESS_ID },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Petfendy", item: absoluteUrl(localizedPath(locale, "home")) },
          { "@type": "ListItem", position: 2, name: h1, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <Navbar locale={locale} />

      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <p className="text-orange-600 font-semibold">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{h1}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">{intro}</p>

          <ul className="grid sm:grid-cols-2 gap-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/${ctaPath}`}
              className="inline-flex items-center justify-center rounded-2xl gradient-orange-pink text-white font-semibold shadow-lg px-8 py-4 text-lg hover:opacity-90"
            >
              {ctaLabel}
            </Link>
            <a
              href="tel:+905323073264"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-orange-400 text-orange-600 font-semibold px-8 py-4 text-lg hover:bg-orange-50"
            >
              <Phone className="w-5 h-5" />
              +90 532 307 32 64
            </a>
          </div>
        </div>
      </section>

      <article className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text} className="text-lg text-gray-700 leading-relaxed">{text}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Sık Sorulan Sorular</h2>
            {faqs.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">{faq.question}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">İlgili Sayfalar</h2>
            <ul className="flex flex-wrap gap-3">
              {related.map((link) => (
                <li key={link.path}>
                  <Link
                    href={`/${locale}/${link.path}`}
                    className="inline-block rounded-full border border-orange-300 px-4 py-2 text-orange-700 hover:bg-orange-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <Footer locale={locale} />
    </div>
  )
}

export const LANDING_RELATED: Record<string, LandingRelatedLink> = {
  petOtel: { path: "ankara-pet-otel", label: "Ankara Pet Otel" },
  kediOtel: { path: "ankara-kedi-oteli", label: "Ankara Kedi Oteli" },
  kopekOtel: { path: "ankara-kopek-oteli", label: "Ankara Köpek Oteli" },
  petTaksi: { path: "ankara-pet-taksi", label: "Ankara Pet Taksi" },
  kediTaksi: { path: "ankara-kedi-taksi", label: "Ankara Kedi Taksi" },
  kopekTaksi: { path: "ankara-kopek-taksi", label: "Ankara Köpek Taksi" },
  petKres: { path: "ankara-pet-kres", label: "Ankara Pet Kreş" },
}
