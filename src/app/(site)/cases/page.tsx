import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme } from '@/lib/theme'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import SectionHeader from '@/components/site/SectionComponents'

async function getCases() {
  try {
    const cases = await prisma.caseItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleEs: true,
        titleAr: true,
        slug: true,
        clientName: true,
        coverImage: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        summaryAr: true,
      },
    })
    return cases
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: seo?.defaultSeoTitle || `${t('cases')} - Shimond`,
    description: seo?.defaultSeoDescription || t('cases.subtitle'),
    keywords: seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/cases`,
    },
  }
}

export default async function CasesPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const cases = await getCases()
  const display = cases

  if (isVer3Theme()) { const { default: C } = await import('@/themes/ver3/CasesPage'); return <C locale={locale} cases={display} /> }
  if (isVer4Theme()) { const { default: C } = await import('@/themes/ver4/CasesPage'); return <C locale={locale} cases={display} /> }
  if (isVer5Theme()) { const { default: C } = await import('@/themes/ver5/CasesPage'); return <C locale={locale} cases={display} /> }
  if (isVer6Theme()) { const { default: C } = await import('@/themes/ver6/CasesPage'); return <C locale={locale} cases={display} /> }

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('cases.badge')}
          title={t('cases.title')}
          subtitle={t('cases.subtitle')}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((item: { id: string; title: string; slug: string; clientName: string | null; summary: string | null; coverImage: string | null }) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden group">
                <Image
                  fill
                  src={item.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'}
                  alt={item.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{getLocalizedValue(item, locale, 'title') || item.title}</h3>
                {item.clientName && <p className="text-sm text-sky-500 mb-2">{item.clientName}</p>}
                <p className="text-gray-600 mb-4 line-clamp-2">{getLocalizedValue(item, locale, 'summary') || item.summary || ''}</p>
                <Link
                  href={`/cases/${item.slug}`}
                  className="inline-flex items-center space-x-2 text-sky-500 font-semibold hover:text-sky-600 transition-colors"
                >
                  <span>{t('viewDetails')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
