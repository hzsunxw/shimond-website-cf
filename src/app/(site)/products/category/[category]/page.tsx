import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { ProductCategory } from '@prisma/client/wasm'
import { prisma } from '@/lib/prisma'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme } from '@/lib/theme'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import { getCategoryBySlug, isValidCategorySlug } from '@/lib/product-categories'
import { CATEGORY_SEO } from '@/lib/category-seo'
import SectionHeader from '@/components/site/SectionComponents'
import AddToInquiryButton from '@/components/site/AddToInquiryButton'

async function getProductsByCategory(enumValue: ProductCategory) {
  try {
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE', category: enumValue },
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

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)

  const categoryInfo = getCategoryBySlug(category)
  const categoryName = categoryInfo ? t(categoryInfo.labelKey) : category

  // Use keyword-optimized SEO for English, fall back to CMS defaults for other languages
  const categorySeo = locale === 'en' ? CATEGORY_SEO[category] : undefined
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: categorySeo?.title || seo?.defaultSeoTitle || `${categoryName} - Shimond`,
    description: categorySeo?.description || seo?.defaultSeoDescription || `${categoryName} - ${t('products.subtitle')}`,
    keywords: categorySeo?.keywords || seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/products/category/${category}`,
    },
  }
}

export default async function ProductCategoryPage({ params }: PageProps) {
  const { category } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)

  if (!isValidCategorySlug(category)) {
    notFound()
  }

  const categoryInfo = getCategoryBySlug(category)
  if (!categoryInfo) {
    notFound()
  }

  const categoryName = t(categoryInfo.labelKey)
  const products = await getProductsByCategory(categoryInfo.enumValue as ProductCategory)

  if (isVer3Theme()) { const { default: C } = await import('@/themes/ver3/ProductCategoryPage'); return <C locale={locale} categorySlug={categoryInfo.slug} categoryName={categoryName} products={products} /> }
  if (isVer4Theme()) { const { default: C } = await import('@/themes/ver4/ProductCategoryPage'); return <C locale={locale} categorySlug={categoryInfo.slug} categoryName={categoryName} products={products} /> }
  if (isVer5Theme()) { const { default: C } = await import('@/themes/ver5/ProductCategoryPage'); return <C locale={locale} categorySlug={categoryInfo.slug} categoryName={categoryName} products={products} /> }
  if (isVer6Theme()) { const { default: C } = await import('@/themes/ver6/ProductCategoryPage'); return <C locale={locale} categorySlug={categoryInfo.slug} categoryName={categoryName} products={products} /> }

  return (
    <div className="pt-[5rem] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-sky-500">{t('home')}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-sky-500">{t('products')}</Link>
          <span>/</span>
          <span className="text-gray-900">{categoryName}</span>
        </nav>

        <SectionHeader
          badge={t('products.badge')}
          title={categoryName}
          subtitle={t('products.subtitle')}
        />

        {products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const title = getLocalizedValue(product, locale, 'title') || product.title
              const summary = getLocalizedValue(product, locale, 'summary') || product.summary || ''
              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    <Image
                      fill
                      src={product.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'}
                      alt={title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{summary}</p>
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
                          title,
                          coverImage: product.coverImage,
                          summary,
                        }}
                        variant="icon"
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-16">{t('products.subtitle')}</p>
        )}
      </div>
    </div>
  )
}
