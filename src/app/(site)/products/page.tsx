import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import SectionHeader from '@/components/site/SectionComponents'
import AddToInquiryButton from '@/components/site/AddToInquiryButton'

async function getProducts() {
  try {
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
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
      },
    })
    return products
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  return {
    title: seo?.defaultSeoTitle || `${t('products')} - Shimond`,
    description: seo?.defaultSeoDescription || t('products.subtitle'),
    keywords: seo?.defaultSeoKeywords || undefined,
  }
}

const fallbackProducts = [
  {
    id: '1',
    title: 'PVC Leather',
    slug: 'pvc-leather',
    summary: 'Premium synthetic leather with excellent durability, water resistance, and soft touch.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  },
  {
    id: '2',
    title: 'PVC Mats',
    slug: 'pvc-mats',
    summary: 'High-quality PVC floor mats and carpets with anti-slip backing.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
  },
  {
    id: '3',
    title: 'Table Protector',
    slug: 'table-protector',
    summary: 'Crystal clear PVC table mats to protect your furniture from damage.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=450&fit=crop',
  },
]

export default async function ProductsPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const products = await getProducts()
  const display = products.length > 0 ? products : fallbackProducts

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('products.badge')}
          title={t('products.title')}
          subtitle={t('products.subtitle')}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {display.map((product: { id: string; title: string; slug: string; summary: string | null; coverImage: string | null }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden group">
                <img
                  src={product.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{getLocalizedValue(product, locale, 'title') || product.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{getLocalizedValue(product, locale, 'summary') || product.summary || ''}</p>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center space-x-2 text-sky-500 font-semibold hover:text-sky-600 transition-colors"
                  >
                    <span>{t('viewDetails')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <AddToInquiryButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      title: getLocalizedValue(product, locale, 'title') || product.title,
                      coverImage: product.coverImage,
                      summary: getLocalizedValue(product, locale, 'summary') || product.summary,
                    }}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
