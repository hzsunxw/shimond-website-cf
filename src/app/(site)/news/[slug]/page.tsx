import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'

async function getNewsItem(slug: string) {
  try {
    const newsItem = await prisma.newsItem.findUnique({
      where: { slug, status: 'ACTIVE' },
    })
    return newsItem
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const newsItem = await getNewsItem(params.slug)
  if (!newsItem) {
    return { title: t('notFound') }
  }
  return {
    title: `${newsItem.title} - Shimond`,
    description: newsItem.seoDescription || newsItem.summary || undefined,
  }
}

function formatDate(date: Date | null, locale: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const newsItem = await getNewsItem(params.slug)

  if (!newsItem) {
    notFound()
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-sky-500 transition-colors">{t('home')}</a>
          <ArrowRight className="w-4 h-4" />
          <a href="/news" className="hover:text-sky-500 transition-colors">{t('news')}</a>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{newsItem.title}</span>
        </nav>

        <article className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          {newsItem.coverImage && (
            <div className="aspect-video overflow-hidden">
              <img src={newsItem.coverImage} alt={newsItem.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8 md:p-12">
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              {newsItem.publishAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(newsItem.publishAt, locale)}</span>
                </div>
              )}
              {newsItem.author && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{newsItem.author}</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{newsItem.title}</h1>

            {newsItem.summary && <p className="text-lg text-gray-600 mb-8 font-medium">{newsItem.summary}</p>}

            {newsItem.content && (
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">{newsItem.content}</div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
