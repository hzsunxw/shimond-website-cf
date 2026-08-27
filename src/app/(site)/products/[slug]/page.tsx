import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue, getLocalizedArray } from '@/lib/i18n'
import AddToInquiryButton from '@/components/site/AddToInquiryButton'
import JsonLd from '@/components/site/JsonLd'
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/structured-data'

const fallbackProducts = [
  {
    id: 'fallback-1',
    title: 'PVC Leather',
    slug: 'pvc-leather',
    summary: 'Premium synthetic leather with excellent durability, water resistance, and soft touch.',
    description: 'Our PVC synthetic leather uses high-quality raw materials and precision manufacturing. It offers outstanding wear resistance, water resistance, and soft touch, widely used in furniture, automotive interiors, bags, and more.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    gallery: [],
    features: ['防水防潮', '耐磨损', '易清洁', '环保材料'],
  },
  {
    id: 'fallback-2',
    title: 'PVC Mats',
    slug: 'pvc-mats',
    summary: 'High-quality PVC floor mats and carpets with anti-slip backing.',
    description: 'Professional-grade PVC mats made with eco-friendly materials, featuring excellent anti-slip performance and wear resistance. Suitable for homes, offices, commercial spaces, and more.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
    gallery: [],
    features: ['防水防潮', '耐磨损', '易清洁', '环保材料'],
  },
  {
    id: 'fallback-3',
    title: 'Table Protector',
    slug: 'table-protector',
    summary: 'Crystal clear PVC table mats to protect your furniture from damage.',
    description: 'Transparent PVC table mats made with food-grade materials, non-toxic and odorless. Effectively protects tabletops from scratches, heat, and liquids while maintaining the aesthetics of your furniture.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=800&fit=crop',
    gallery: [],
    features: ['防水防潮', '耐磨损', '易清洁', '环保材料'],
  },
]

async function getProduct(slug: string) {
  try {
    const product = await prisma.serviceItem.findUnique({
      where: { slug, status: 'ACTIVE' },
    })
    if (product) return product
  } catch {
    // ignore
  }
  // Fallback to static data
  return fallbackProducts.find((p) => p.slug === slug) || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const product = await getProduct(slug)
  const seo = await getSiteSeo(locale)
  if (!product) {
    return { title: t('notFound') }
  }

  const p = product as typeof product & { seoTitle?: string | null; seoDescription?: string | null; seoKeywords?: string | null }
  const title = getLocalizedValue(p, locale, 'title') || product.title
  const summary = getLocalizedValue(p, locale, 'summary') || product.summary
  const seoTitle = getLocalizedValue(p, locale, 'seoTitle') || p.seoTitle
  const seoDescription = getLocalizedValue(p, locale, 'seoDescription') || p.seoDescription
  const seoKeywords = getLocalizedValue(p, locale, 'seoKeywords') || p.seoKeywords

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: seoTitle || `${title} - Shimond`,
    description: seoDescription || summary || seo?.defaultSeoDescription || undefined,
    keywords: seoKeywords || seo?.defaultSeoKeywords || undefined,
    alternates: {
      canonical: `${siteUrl}/products/${slug}`,
    },
  }
}

const defaultSpecsEn: { label: string; value: string }[] = [
  { label: 'Material', value: '100% PVC' },
  { label: 'Thickness', value: '0.6mm - 2.0mm' },
  { label: 'Width', value: '1.37m - 1.5m' },
  { label: 'Backing', value: 'TC Cloth / Knitted / Non-woven' },
  { label: 'Color', value: 'Customizable' },
  { label: 'MOQ', value: '1000 meters' },
  { label: 'Weight', value: '' },
  { label: 'Density', value: '' },
]

const defaultSpecsZh: { label: string; value: string }[] = [
  { label: '材质', value: '100% PVC' },
  { label: '厚度', value: '0.6mm - 2.0mm' },
  { label: '宽度', value: '1.37m - 1.5m' },
  { label: '背衬', value: 'TC布 / 针织布 / 无纺布' },
  { label: '颜色', value: '可定制' },
  { label: '最小起订量', value: '1000米' },
  { label: '克重', value: '' },
  { label: '密度', value: '' },
]

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const productTitle = getLocalizedValue(product, locale, 'title') || product.title
  const productSummary = getLocalizedValue(product, locale, 'summary')
  const productDescription = getLocalizedValue(product, locale, 'description')

  const gallery = Array.isArray(product.gallery) ? (product.gallery as string[]) : []
  const mainImage = product.coverImage || gallery[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'
  const productSpecs = (() => {
    const localized = getLocalizedArray(product, locale, 'specs')
    if (Array.isArray(localized) && localized.length > 0) {
      return localized as { label: string; value: string }[]
    }
    return locale !== 'zh' ? defaultSpecsEn : defaultSpecsZh
  })()

  const productFeatures = getLocalizedArray(product, locale, 'features') || (product.features as string[]) || []

  const categoryNames: Record<string, { zh: string; en: string; es: string; ar: string }> = {
    PVC_FOAM: { zh: 'PVC发泡材料', en: 'PVC Foam Material', es: 'Material de Espuma PVC', ar: 'مادة رغوة PVC' },
    PVC_MATS: { zh: 'PVC地垫', en: 'PVC Mats', es: 'Alfombrillas PVC', ar: 'سجاد PVC' },
    TABLE_PROTECTOR: { zh: '桌垫保护垫', en: 'Table Protector', es: 'Protector de Mesa', ar: 'حماية الطاولات' },
    SOUNDCOTTON: { zh: '隔音棉', en: 'Soundproof Cotton', es: 'Algodón Insonorizado', ar: 'قطن عازل للصوت' },
  }

  const categorySlugs: Record<string, string> = {
    PVC_FOAM: 'pvc-foam',
    PVC_MATS: 'pvc-mats',
    TABLE_PROTECTOR: 'table-protector',
    SOUNDCOTTON: 'soundproof-cotton',
  }

  const productWithCategory = product as { category?: string | null }
  const productCategory = productWithCategory.category ?? null
  const categoryName = productCategory ? (categoryNames[productCategory]?.[locale as 'zh' | 'en' | 'es' | 'ar'] || null) : null
  const categorySlug = productCategory ? (categorySlugs[productCategory] || null) : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const productUrl = `${siteUrl}/products/${slug}`

  // Price info only available on DB products (not fallbacks)
  const hasPriceInfo = 'priceStrategy' in product
  const productSchema = generateProductSchema({
    name: productTitle,
    description: productSummary || productDescription || undefined,
    image: mainImage,
    images: gallery.length > 0 ? gallery : undefined,
    url: productUrl,
    brand: 'Shimond',
    sku: product.id,
    offers: hasPriceInfo
      ? {
          price: 'price' in product && product.price != null ? Number(product.price) : null,
          priceCurrency: ('priceCurrency' in product ? product.priceCurrency : null) || 'USD',
          priceStrategy: 'priceStrategy' in product ? product.priceStrategy : 'CONTACT',
        }
      : undefined,
  })

  const breadcrumbItems = [
    { name: t('home'), url: siteUrl },
    { name: t('products'), url: `${siteUrl}/products` },
  ]
  if (categoryName && categorySlug) {
    breadcrumbItems.push({ name: categoryName, url: `${siteUrl}/products/category/${categorySlug}` })
  }
  breadcrumbItems.push({ name: productTitle, url: productUrl })

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems)

  return (
    <div className="page-body pb-12">
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-sky-500 transition-colors">{t('home')}</a>
          <ArrowRight className="w-4 h-4" />
          <a href="/products" className="hover:text-sky-500 transition-colors">{t('products')}</a>
          {categoryName && categorySlug && (
            <>
              <ArrowRight className="w-4 h-4" />
              <a href={`/products/category/${categorySlug}`} className="hover:text-sky-500 transition-colors">{categoryName}</a>
            </>
          )}
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{productTitle}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg relative">
              <Image fill src={mainImage} alt={productTitle} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-100 relative">
                    <Image fill src={img} alt={`${productTitle} ${index + 1}`} sizes="(max-width: 768px) 25vw, 100px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">{t('product.hot')}</span>
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">{t('product.inStock')}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{productTitle}</h1>

            <p className="text-lg text-gray-600 mb-6">{productSummary || productDescription || t('product.defaultDesc')}</p>

            {/* Product Features */}
            {productFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {productFeatures.map((feature: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-sm font-medium border border-sky-100">
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('product.specs')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {productSpecs.map((spec) => (
                  <div key={spec.label}>
                    <span className="text-gray-500 text-sm">{spec.label}</span>
                    <p className="font-medium text-gray-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToInquiryButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  coverImage: product.coverImage,
                  summary: product.summary,
                }}
                variant="primary"
              />

            </div>
          </div>
        </div>

        {/* Description */}
        {productDescription && (
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product.details')}</h2>
            {(() => {
              const isHtml = /<[a-z][\s\S]*>/i.test(productDescription)
              return isHtml ? (
                <div
                  className="prose max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: productDescription }}
                />
              ) : (
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">{productDescription}</div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
