import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import AboutPageSection from '@/components/site/AboutPageSection'
import { isVer4Theme } from '@/lib/theme'
import Ver4AboutPage from '@/themes/ver4/AboutPage'

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const page = await getPage(params.slug)
  const seo = await getSiteSeo(locale)
  if (!page) {
    return { title: t('notFound') }
  }
  const pageType = (page as any).pageType || params.slug
  const displayName = locale !== 'zh' ? (pageTypeEnNames[pageType] || page.name) : page.name
  return {
    title: page.seoTitle || seo?.defaultSeoTitle || displayName,
    description: page.seoDescription || seo?.defaultSeoDescription || undefined,
    keywords: page.seoKeywords || seo?.defaultSeoKeywords || undefined,
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const page = await getPage(params.slug)

  if (!page) {
    notFound()
  }

  const pageType = (page as any).pageType || params.slug
  const displayName = locale !== 'zh' ? (pageTypeEnNames[pageType] || page.name) : page.name

  if (pageType === 'about') {
    if (isVer4Theme()) return <Ver4AboutPage locale={locale} />
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
