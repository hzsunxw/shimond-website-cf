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
import GallerySection from '@/components/site/GallerySection'
import ContactSection from '@/components/site/ContactSection'

async function getHomepageData() {
  try {
    const [products, config] = await Promise.all([
      prisma.serviceItem.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { sortOrder: 'asc' },
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
  return {
    title: seo?.siteTitle || seo?.defaultSeoTitle || `Shimond - ${t('hero.tagline')}`,
    description: seo?.siteDescription || seo?.defaultSeoDescription || t('hero.subtitle'),
    keywords: seo?.defaultSeoKeywords || undefined,
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
          tags: ['High Quality', 'Customizable'],
        }))
      : []

  return (
    <div>
      <HeroSection />
      <ProductsSection products={displayProducts} />
      <FeaturesSection />
      <AboutSection />
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
