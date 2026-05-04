import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'

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
  if (!caseItem) {
    return { title: t('notFound') }
  }
  return {
    title: `${caseItem.title} - Shimond`,
    description: caseItem.seoDescription || caseItem.summary || undefined,
  }
}

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const caseItem = await getCase(params.slug)

  if (!caseItem) {
    notFound()
  }

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-sky-500 transition-colors">{t('home')}</a>
          <ArrowRight className="w-4 h-4" />
          <a href="/cases" className="hover:text-sky-500 transition-colors">{t('cases')}</a>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{caseItem.title}</span>
        </nav>

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          {caseItem.coverImage && (
            <div className="aspect-video overflow-hidden">
              <img src={caseItem.coverImage} alt={caseItem.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{caseItem.title}</h1>
            {caseItem.clientName && (
              <p className="text-sky-500 font-medium mb-6">{t('case.client')}: {caseItem.clientName}</p>
            )}
            {caseItem.summary && <p className="text-lg text-gray-600 mb-8">{caseItem.summary}</p>}
            {caseItem.description && (
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">{caseItem.description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
