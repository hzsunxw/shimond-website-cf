import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme } from '@/lib/theme'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { PRODUCTS_PAGE_SEO } from '@/lib/category-seo'
import SectionHeader from '@/components/site/SectionComponents'

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
        category: true,
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
  // Use keyword-optimized SEO for English
  const pageSeo = locale === 'en' ? PRODUCTS_PAGE_SEO : undefined
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: pageSeo?.title || seo?.defaultSeoTitle || `${t('products')} - Shimond`,
    description: pageSeo?.description || seo?.defaultSeoDescription || t('products.subtitle'),
    keywords: pageSeo?.keywords || seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/products`,
    },
  }
}

export default async function ProductsPage() {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const products = await getProducts()

  // Group product counts by category enum value
  const countByEnum = new Map<string, number>()
  for (const p of products) {
    if (p.category) {
      countByEnum.set(p.category, (countByEnum.get(p.category) || 0) + 1)
    }
  }

  // Build category list with counts (always show all 4 categories, 0 if empty)
  const categories = PRODUCT_CATEGORIES.map((c) => ({
    slug: c.slug,
    labelKey: c.labelKey,
    count: countByEnum.get(c.enumValue) || 0,
  }))

  if (isVer3Theme()) { const { default: C } = await import('@/themes/ver3/ProductsPage'); return <C locale={locale} categories={categories} /> }
  if (isVer4Theme()) { const { default: C } = await import('@/themes/ver4/ProductsPage'); return <C locale={locale} categories={categories} /> }
  if (isVer5Theme()) { const { default: C } = await import('@/themes/ver5/ProductsPage'); return <C locale={locale} categories={categories} /> }
  if (isVer6Theme()) { const { default: C } = await import('@/themes/ver6/ProductsPage'); return <C locale={locale} categories={categories} /> }

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('products.badge')}
          title={t('products.title')}
          subtitle={t('products.subtitle')}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products/category/${category.slug}`}
              className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t(category.labelKey)}</h3>
              <p className="text-gray-500 mb-6">{category.count} {t('products')}</p>
              <span className="mt-auto inline-flex items-center space-x-2 text-sky-500 font-semibold group-hover:text-sky-600 transition-colors">
                <span>{t('viewDetails')}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
