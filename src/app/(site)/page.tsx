import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import { getLocalizedValue } from '@/lib/i18n'
import HeroSection from '@/components/site/HeroSection'
import ProductsSection from '@/components/site/ProductsSection'
import FeaturesSection from '@/components/site/FeaturesSection'
import AboutSection from '@/components/site/AboutSection'
import ProductionLineSection from '@/components/site/ProductionLineSection'
import GallerySection from '@/components/site/GallerySection'
import ContactSection from '@/components/site/ContactSection'
import { isVer4Theme } from '@/lib/theme'
import Ver4HomePage from '@/themes/ver4/HomePage'

const fallbackProducts = [
  {
    id: 'fallback-1',
    title: '软质PVC泡棉',
    slug: 'soft-pvc-foam',
    summary: '极佳的缓冲性能，5%压缩即可回弹防水，顺应各种复杂曲面和形状特点。',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  },
  {
    id: 'fallback-2',
    title: '硬质PVC泡棉',
    slug: 'rigid-pvc-foam',
    summary: '高强度、维保成本低，适合承重与结构支撑或耐腐蚀场景。',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
  },
  {
    id: 'fallback-3',
    title: 'PVC餐垫',
    slug: 'pvc-placemats',
    summary: '高品质PVC餐垫，防水防油，易清洁，多种纹路可选。',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=450&fit=crop',
  },
  {
    id: 'fallback-4',
    title: 'PVC防滑地垫',
    slug: 'pvc-anti-slip-mats',
    summary: '专业防滑地垫，采用环保材料，适合家庭、办公和商业空间。',
    coverImage: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=450&fit=crop',
  },
  {
    id: 'fallback-5',
    title: '桌面保护垫',
    slug: 'table-protectors',
    summary: '食品级透明PVC桌垫，无毒无味，有效保护桌面免受划伤、烫伤。',
    coverImage: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=450&fit=crop',
  },
  {
    id: 'fallback-6',
    title: '玻璃软木垫',
    slug: 'glass-cork-pads',
    summary: '专业玻璃运输保护垫，软木与PVC复合材质，防震缓冲性能卓越。',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=450&fit=crop',
  },
]

async function getHomepageData() {
  try {
    const [products, config] = await Promise.all([
      prisma.serviceItem.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { id: 'desc' },
        take: 3,
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
      }),
      prisma.siteConfig.findFirst({
        select: {
          address: true,
          phone: true,
          email: true,
          socialLinks: true,
        },
      }),
    ])
    return { products, config }
  } catch {
    return { products: [], config: null }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = seo?.siteTitle || seo?.defaultSeoTitle || `Shimond - ${t('hero.tagline')}`
  const description = seo?.siteDescription || seo?.defaultSeoDescription || t('hero.subtitle')
  const ogImage = seo?.defaultOgImage || `${siteUrl}/og-image.jpg`

  return {
    title,
    description,
    keywords: seo?.defaultSeoKeywords || undefined,
    openGraph: {
      title,
      description,
      url: siteUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: siteUrl,
    },
  }
}

export default async function HomePage() {
  const { products, config } = await getHomepageData()
  const locale = await getServerLocale()

  const displayProducts =
    products.length > 0
      ? products.map((p: {
          id: string
          title: string
          titleEn: string | null
          titleEs: string | null
          titleAr: string | null
          slug: string
          summary: string | null
          summaryEn: string | null
          summaryEs: string | null
          summaryAr: string | null
          coverImage: string | null
        }) => ({
          id: p.id,
          title: getLocalizedValue(p, locale, 'title') || p.title,
          slug: p.slug,
          summary: getLocalizedValue(p, locale, 'summary') || p.summary || '',
          coverImage: p.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
        }))
      : fallbackProducts

  if (isVer4Theme()) {
    return <Ver4HomePage locale={locale} products={products.length > 0 ? products : fallbackProducts} config={config} />
  }

  return (
    <div>
      <HeroSection />
      <ProductsSection products={displayProducts} />
      <FeaturesSection />
      <AboutSection />
      <ProductionLineSection />
      <GallerySection />
      <ContactSection
        address={config?.address}
        phone={config?.phone}
        email={config?.email}
        socialLinks={config?.socialLinks as Record<string, string> | null}
      />
    </div>
  )
}
