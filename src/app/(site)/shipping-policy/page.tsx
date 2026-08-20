import { Metadata } from 'next'
import Link from 'next/link'
import { Ship, ClipboardCheck, Globe2, RotateCcw, ArrowRight } from 'lucide-react'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import SectionHeader from '@/components/site/SectionComponents'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: seo?.defaultSeoTitle || `${t('shippingPolicy')} - Shimond`,
    description: seo?.defaultSeoDescription || t('shippingPolicy.subtitle'),
    keywords: seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/shipping-policy`,
    },
  }
}

export default async function ShippingPolicyPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)

  const sections = [
    {
      icon: <Ship className="w-8 h-8" />,
      title: t('shippingPolicy.fob.title'),
      desc: t('shippingPolicy.fob.desc'),
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: t('shippingPolicy.inspection.title'),
      desc: t('shippingPolicy.inspection.desc'),
    },
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: t('shippingPolicy.markets.title'),
      desc: t('shippingPolicy.markets.desc'),
    },
    {
      icon: <RotateCcw className="w-8 h-8" />,
      title: t('shippingPolicy.return.title'),
      desc: t('shippingPolicy.return.desc'),
    },
  ]

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('shippingPolicy')}
          title={t('shippingPolicy')}
          subtitle={t('shippingPolicy.subtitle')}
        />

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white mb-6">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/inquiry"
            className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-4 rounded-full transition-colors"
          >
            <span>{t('submitInquiry')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}