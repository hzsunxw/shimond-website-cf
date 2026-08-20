import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import AboutPageSection from '@/components/site/AboutPageSection'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme } from '@/lib/theme'

async function getPage(slug: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        modules: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    return page
  } catch {
    return null
  }
}

const pageTypeEnNames: Record<string, string> = {
  home: 'Home',
  about: 'About Us',
  products: 'Products',
  cases: 'Cases',
  news: 'News',
  contact: 'Contact Us',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const page = await getPage(slug)
  const seo = await getSiteSeo(locale)
  if (!page) {
    return { title: t('notFound') }
  }
  const pageType = (page as any).pageType || slug
  const displayName = locale !== 'zh' ? (pageTypeEnNames[pageType] || page.name) : page.name
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: page.seoTitle || seo?.defaultSeoTitle || displayName,
    description: page.seoDescription || seo?.defaultSeoDescription || undefined,
    keywords: page.seoKeywords || seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/${slug}`,
      languages: {
        zh: `${siteUrl}/${slug}`,
        en: `${siteUrl}/${slug}`,
        es: `${siteUrl}/${slug}`,
        ar: `${siteUrl}/${slug}`,
      },
    },
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const page = await getPage(slug)

  if (!page) {
    notFound()
  }

  const pageType = (page as any).pageType || slug
  const displayName = locale !== 'zh' ? (pageTypeEnNames[pageType] || page.name) : page.name

  if (pageType === 'about') {
    if (isVer3Theme()) { const { default: C } = await import('@/themes/ver3/AboutPage'); return <C locale={locale} /> }
    if (isVer4Theme()) { const { default: C } = await import('@/themes/ver4/AboutPage'); return <C locale={locale} /> }
    if (isVer5Theme()) { const { default: C } = await import('@/themes/ver5/AboutPage'); return <C locale={locale} /> }
    if (isVer6Theme()) { const { default: C } = await import('@/themes/ver6/AboutPage'); return <C locale={locale} /> }
    return <AboutPageSection />
  }

  return (
    <div className="pt-[5rem] pb-20" key={`about-${locale}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">{displayName}</h1>

        {page.modules && page.modules.length > 0 ? (
          <div className="space-y-12">
            {page.modules.map((module: { id: string; moduleType: string; title: string | null; subtitle: string | null; config: unknown }) => (
              <div key={module.id} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                {module.title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{module.title}</h2>}
                {module.subtitle && <p className="text-gray-600 mb-4">{module.subtitle}</p>}
                {typeof module.config === 'object' && module.config !== null && module.config !== undefined && (
                  <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(module.config, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <p className="text-gray-600 text-lg">{t('page.underConstruction')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
