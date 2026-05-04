import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import SectionHeader from '@/components/site/SectionComponents'

async function getCases() {
  try {
    const cases = await prisma.caseItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        clientName: true,
        coverImage: true,
        summary: true,
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
  return {
    title: `${t('cases')} - Shimond`,
    description: t('cases.subtitle'),
  }
}

const fallbackCases = [
  {
    id: '1',
    title: 'European Furniture Brand Partnership',
    slug: 'europe-furniture',
    clientName: 'EuroFurn Co.',
    summary: 'Provided high-quality PVC synthetic leather for sofas and seating manufacturing.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  },
  {
    id: '2',
    title: 'Automotive Interior Project',
    slug: 'automotive-interior',
    clientName: 'AutoTech Inc.',
    summary: 'Supplied wear-resistant, eco-friendly PVC interior materials for automotive manufacturers.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
  },
  {
    id: '3',
    title: 'Commercial Flooring Project',
    slug: 'commercial-flooring',
    clientName: 'BuildRight Ltd.',
    summary: 'Large-scale commercial space PVC mat supply project covering over 5,000 square meters.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=450&fit=crop',
  },
]

export default async function CasesPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const cases = await getCases()
  const display = cases.length > 0 ? cases : fallbackCases

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
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden group">
                <img
                  src={item.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                {item.clientName && <p className="text-sm text-sky-500 mb-2">{item.clientName}</p>}
                <p className="text-gray-600 mb-4 line-clamp-2">{item.summary || ''}</p>
                <Link
                  href={`/cases/${item.slug}`}
                  className="inline-flex items-center space-x-2 text-sky-500 font-semibold hover:text-sky-600 transition-colors"
                >
                  <span>{t('viewDetails')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
