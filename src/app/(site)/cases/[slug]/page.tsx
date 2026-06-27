import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import JsonLd from '@/components/site/JsonLd'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/structured-data'
import Image from 'next/image'

async function getCase(slug: string) {
  try {
    const caseItem = await prisma.caseItem.findUnique({
      where: { slug, status: 'ACTIVE' },
    })
    return caseItem
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const caseItem = await getCase(params.slug)
  const seo = await getSiteSeo(locale)
  if (!caseItem) {
    return { title: t('notFound') }
  }
  const title = getLocalizedValue(caseItem, locale, 'title') || caseItem.title
  const summary = getLocalizedValue(caseItem, locale, 'summary') || caseItem.summary
  const seoTitle = getLocalizedValue(caseItem, locale, 'seoTitle') || caseItem.seoTitle
  const seoDescription = getLocalizedValue(caseItem, locale, 'seoDescription') || caseItem.seoDescription
  const seoKeywords = getLocalizedValue(caseItem, locale, 'seoKeywords') || caseItem.seoKeywords
  return {
    title: seoTitle || `${title} - Shimond`,
    description: seoDescription || summary || seo?.defaultSeoDescription || undefined,
    keywords: seoKeywords || seo?.defaultSeoKeywords || undefined,
  }
}

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const caseItem = await getCase(params.slug)

  if (!caseItem) {
    notFound()
  }

  const title = getLocalizedValue(caseItem, locale, 'title') || caseItem.title
  const summary = getLocalizedValue(caseItem, locale, 'summary') || caseItem.summary
  const description = getLocalizedValue(caseItem, locale, 'description') || caseItem.description

  // ── Structured data (JSON-LD) ──────────────────────────────────────────────
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const caseUrl = `${siteUrl}/cases/${params.slug}`
  const publisherName = seo?.companyName || 'Shimond'

  const articleSchema = generateArticleSchema({
    title,
    description: summary || description || undefined,
    image: caseItem.coverImage || undefined,
    url: caseUrl,
    datePublished: caseItem.createdAt,
    dateModified: caseItem.updatedAt,
    publisherName,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t('home'), url: siteUrl },
    { name: t('cases'), url: `${siteUrl}/cases` },
    { name: title, url: caseUrl },
  ])

  return (
    <div className="py-12">
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-sky-500 transition-colors">{t('home')}</a>
          <ArrowRight className="w-4 h-4" />
          <a href="/cases" className="hover:text-sky-500 transition-colors">{t('cases')}</a>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{title}</span>
        </nav>

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          {caseItem.coverImage && (
            <div className="aspect-video overflow-hidden relative">
              <Image fill src={caseItem.coverImage} alt={title} sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
            </div>
          )}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            {caseItem.clientName && (
              <p className="text-sky-500 font-medium mb-6">{t('case.client')}: {caseItem.clientName}</p>
            )}
            {summary && <p className="text-lg text-gray-600 mb-8">{summary}</p>}
            {description && (
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">{description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
