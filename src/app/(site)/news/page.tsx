import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme } from '@/lib/theme'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue, getLocalizedArray } from '@/lib/i18n'
import SectionHeader from '@/components/site/SectionComponents'

async function getNews() {
  try {
    const news = await prisma.newsItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { publishAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleEs: true,
        titleAr: true,
        slug: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        summaryAr: true,
        coverImage: true,
        author: true,
        publishAt: true,
        tags: true,
        tagsEn: true,
        tagsEs: true,
        tagsAr: true,
      },
    })
    return news
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  return {
    title: seo?.defaultSeoTitle || `${t('news')} - Shimond`,
    description: seo?.defaultSeoDescription || t('news.subtitle'),
    keywords: seo?.defaultSeoKeywords || undefined,
  }
}

const fallbackNews = [
  {
    id: '1',
    title: 'Shimond Receives ISO 9001 Quality Certification',
    slug: 'iso-certification',
    summary: 'We are pleased to announce that Shimond has successfully passed the ISO 9001 quality management system certification.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    author: 'Shimond Team',
    publishAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'New Eco-Friendly PVC Materials Officially Released',
    slug: 'eco-pvc-launch',
    summary: 'Launching a new series of eco-friendly PVC materials that better meet international environmental standards.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
    author: 'Product Team',
    publishAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    title: 'Participating in 2024 International Plastics Exhibition',
    slug: 'trade-show-2024',
    summary: 'Shimond will participate in the upcoming International Plastics Exhibition to showcase latest products.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop',
    author: 'Marketing Team',
    publishAt: new Date('2024-03-10'),
  },
]

function formatDate(date: Date | null, locale: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function NewsPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const news = await getNews()
  const display = news.length > 0 ? news : fallbackNews

  if (isVer3Theme()) { const { default: C } = await import('@/themes/ver3/NewsPage'); return <C locale={locale} news={display} /> }
  if (isVer4Theme()) { const { default: C } = await import('@/themes/ver4/NewsPage'); return <C locale={locale} news={display} /> }
  if (isVer5Theme()) { const { default: C } = await import('@/themes/ver5/NewsPage'); return <C locale={locale} news={display} /> }
  if (isVer6Theme()) { const { default: C } = await import('@/themes/ver6/NewsPage'); return <C locale={locale} news={display} /> }

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('news.badge')}
          title={t('news.title')}
          subtitle={t('news.subtitle')}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((item: { id: string; title: string; slug: string; summary: string | null; coverImage: string | null; author: string | null; publishAt: Date | null; tags: string[] }) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[3/2] overflow-hidden group">
                <Image
                  fill
                  src={item.coverImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop'}
                  alt={getLocalizedValue(item, locale, 'title') || item.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={item.publishAt ? new Date(item.publishAt).toISOString() : undefined}>
                    {formatDate(item.publishAt, locale)}
                  </time>
                  {item.author && <span>· {item.author}</span>}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{getLocalizedValue(item, locale, 'title') || item.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{getLocalizedValue(item, locale, 'summary') || item.summary || ''}</p>
                {(() => {
                  const itemTags = getLocalizedArray(item, locale, 'tags') || []
                  if (itemTags.length === 0) return null
                  return (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {itemTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-xs">
                          <Tag className="w-3 h-3 mr-0.5" />
                          {tag}
                        </span>
                      ))}
                      {itemTags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                          +{itemTags.length - 3}
                        </span>
                      )}
                    </div>
                  )
                })()}
                <Link
                  href={`/news/${item.slug}`}
                  className="inline-flex items-center space-x-2 text-sky-500 font-semibold hover:text-sky-600 transition-colors"
                >
                  <span>{t('readMore')}</span>
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
