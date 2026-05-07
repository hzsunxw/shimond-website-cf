import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle, Download } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import AddToInquiryButton from '@/components/site/AddToInquiryButton'

const fallbackProducts = [
  {
    id: 'fallback-1',
    title: 'PVC Leather',
    slug: 'pvc-leather',
    summary: 'Premium synthetic leather with excellent durability, water resistance, and soft touch.',
    description: 'Our PVC synthetic leather uses high-quality raw materials and precision manufacturing. It offers outstanding wear resistance, water resistance, and soft touch, widely used in furniture, automotive interiors, bags, and more.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    gallery: [],
  },
  {
    id: 'fallback-2',
    title: 'PVC Mats',
    slug: 'pvc-mats',
    summary: 'High-quality PVC floor mats and carpets with anti-slip backing.',
    description: 'Professional-grade PVC mats made with eco-friendly materials, featuring excellent anti-slip performance and wear resistance. Suitable for homes, offices, commercial spaces, and more.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
    gallery: [],
  },
  {
    id: 'fallback-3',
    title: 'Table Protector',
    slug: 'table-protector',
    summary: 'Crystal clear PVC table mats to protect your furniture from damage.',
    description: 'Transparent PVC table mats made with food-grade materials, non-toxic and odorless. Effectively protects tabletops from scratches, heat, and liquids while maintaining the aesthetics of your furniture.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=800&fit=crop',
    gallery: [],
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const product = await getProduct(params.slug)
  const seo = await getSiteSeo(locale)
  if (!product) {
    return { title: t('notFound') }
  }

  // 根据 locale 读取对应多语言 SEO 字段
  const getSeoField = (field: 'seoTitle' | 'seoDescription' | 'seoKeywords') => {
    if (locale === 'zh') return (product as Record<string, unknown>)[field] as string | null
    const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
    return (product as Record<string, unknown>)[langField] as string | null
  }

  // 根据 locale 读取产品标题
  const getProductTitle = () => {
    if (locale === 'zh') return product.title
    const titleField = `title${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
    return ((product as Record<string, unknown>)[titleField] as string | null) || product.title
  }

  return {
    title: getSeoField('seoTitle') || `${getProductTitle()} - Shimond`,
    description: getSeoField('seoDescription') || product.summary || seo?.defaultSeoDescription || undefined,
    keywords: getSeoField('seoKeywords') || seo?.defaultSeoKeywords || undefined,
  }
}

const defaultFeaturesEn = ['Waterproof', 'Wear-resistant', 'Easy to clean', 'Eco-friendly', 'Rich colors', 'Customizable size']
const defaultFeaturesZh = ['防水防潮', '耐磨损', '易清洁', '环保材料', '色彩丰富', '可定制尺寸']

const defaultSpecsEn = [
  { label: 'Material', value: '100% PVC' },
  { label: 'Thickness', value: '0.6mm - 2.0mm' },
  { label: 'Width', value: '1.37m - 1.5m' },
  { label: 'Backing', value: 'TC Cloth / Knitted / Non-woven' },
  { label: 'Color', value: 'Customizable' },
  { label: 'MOQ', value: '1000 meters' },
]

const defaultSpecsZh = [
  { label: '材质', value: '100% PVC' },
  { label: '厚度', value: '0.6mm - 2.0mm' },
  { label: '宽度', value: '1.37m - 1.5m' },
  { label: '背衬', value: 'TC布 / 针织布 / 无纺布' },
  { label: '颜色', value: '可定制' },
  { label: '最小起订量', value: '1000米' },
]

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  // 根据 locale 读取多语言内容
  const getLocalizedField = (field: 'title' | 'summary' | 'description') => {
    if (locale === 'zh') return (product as Record<string, unknown>)[field] as string | null
    const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
    return ((product as Record<string, unknown>)[langField] as string | null) || (product as Record<string, unknown>)[field] as string | null
  }

  const productTitle = getLocalizedField('title') || product.title
  const productSummary = getLocalizedField('summary')
  const productDescription = getLocalizedField('description')

  const gallery = Array.isArray(product.gallery) ? (product.gallery as string[]) : []
  const mainImage = product.coverImage || gallery[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop'
  const defaultFeatures = locale !== 'zh' ? defaultFeaturesEn : defaultFeaturesZh
  const defaultSpecs = locale !== 'zh' ? defaultSpecsEn : defaultSpecsZh

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <a href="/" className="hover:text-sky-500 transition-colors">{t('home')}</a>
          <ArrowRight className="w-4 h-4" />
          <a href="/products" className="hover:text-sky-500 transition-colors">{t('products')}</a>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sky-500 font-medium">{productTitle}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <img src={mainImage} alt={productTitle} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-100">
                    <img src={img} alt={`${productTitle} ${index + 1}`} className="w-full h-full object-cover" />
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

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('product.specs')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {defaultSpecs.map((spec) => (
                  <div key={spec.label}>
                    <span className="text-gray-500 text-sm">{spec.label}</span>
                    <p className="font-medium text-gray-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {defaultFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
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
              <button className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>{t('product.download')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product.details')}</h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">{product.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}
