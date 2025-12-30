"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useTranslations } from "next-intl"

export default function DeliveryReturnPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const t = useTranslations('deliveryReturn')

  return (
    <div className="min-h-screen bg-white">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-lg opacity-90">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">{t('section1.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section1.content')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>{t('section1.item1')}</li>
                <li>{t('section1.item2')}</li>
                <li>{t('section1.item3')}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">{t('section2.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section2.content')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section2.period')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('section2.note')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">{t('section3.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section3.content')}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>{t('section3.item1')}</li>
                <li>{t('section3.item2')}</li>
                <li>{t('section3.item3')}</li>
                <li>{t('section3.item4')}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">{t('section4.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section4.content')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('section4.process')}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">{t('section5.title')}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('section5.content')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t('section5.contact')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('section5.email')}: <a href="mailto:petfendyotel@gmail.com" className="text-orange-600 hover:underline">petfendyotel@gmail.com</a>
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                {t('lastUpdated')}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}

