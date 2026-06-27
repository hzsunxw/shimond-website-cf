import type { Metadata } from 'next'
import SiteHeader from '@/components/site/Header'
import SiteFooter from '@/components/site/Footer'
import JsonLd from '@/components/site/JsonLd'
import { LocaleProvider } from '@/components/LocaleProvider'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getSiteSeo } from '@/lib/seo'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/structured-data'
import { isVer4Theme } from '@/lib/theme'
import Ver4Layout from '@/themes/ver4/Layout'

async function getSiteData() {
  try {
    const config = await prisma.siteConfig.findFirst()
    const pages = await prisma.page.findMany({
      where: { status: 'ACTIVE', showInNav: true, pageType: { not: 'contact' } },
      orderBy: { navSort: 'asc' },
      select: {
        id: true,
        pageType: true,
        name: true,
        nameEn: true,
        slug: true,
        navSort: true,
      },
    })
    return { config, pages }
  } catch {
    return { config: null, pages: [] }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = seo?.siteTitle || seo?.defaultSeoTitle || 'Shimond - Professional PVC Products Manufacturer'
  const description = seo?.siteDescription || seo?.defaultSeoDescription || 'Professional manufacturer of high-quality PVC leather, mats, and table protectors.'
  const ogImage = seo?.defaultOgImage || `${siteUrl}/og-image.jpg`

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | Shimond`,
    },
    description,
    keywords: seo?.defaultSeoKeywords || undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Shimond',
      title,
      description,
      url: siteUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'zh' ? 'zh_CN' : locale === 'es' ? 'es_ES' : locale === 'ar' ? 'ar_SA' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        zh: `${siteUrl}`,
        en: `${siteUrl}`,
        es: `${siteUrl}`,
        ar: `${siteUrl}`,
      },
    },
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { config, pages } = await getSiteData()
  const locale = await getServerLocale()
  const seo = await getSiteSeo(locale)
  const companyName = seo?.companyName || config?.companyName || 'Shimond'
  const address = seo?.address || config?.address
  const phone = seo?.phone || config?.phone
  const email = seo?.email || config?.email

  const navPages = pages.map((p: { slug: string; name: string; nameEn: string | null; pageType: string }) => ({
    slug: p.slug === 'home' ? '' : p.slug,
    name: p.name,
    nameEn: p.nameEn,
    pageType: p.pageType,
  }))

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const orgSchema = generateOrganizationSchema({
    siteUrl,
    seo,
    logo: config?.logo,
    socialLinks: config?.socialLinks as Record<string, string> | null,
  })
  const websiteSchema = generateWebsiteSchema({
    siteUrl,
    siteName: companyName,
    description: seo?.siteDescription || config?.siteDescription,
    locale,
  })

  return (
    <LocaleProvider locale={locale}>
      <JsonLd data={[orgSchema, websiteSchema]} />
      {isVer4Theme() ? (
        <Ver4Layout
          locale={locale}
          siteName={companyName}
          companyName={companyName}
          address={address}
          phone={phone}
          email={email}
          socialLinks={config?.socialLinks as Record<string, string> | null}
        >
          {children}
        </Ver4Layout>
      ) : (
        <div className="min-h-screen flex flex-col">
          <SiteHeader
            siteName={companyName}
            pages={navPages}
          />
          <main className="flex-1 pt-20">{children}</main>
          <SiteFooter
            siteName={companyName}
            companyName={companyName}
            address={address}
            phone={phone}
            email={email}
            socialLinks={config?.socialLinks as Record<string, string> | null}
          />
        </div>
      )}
    </LocaleProvider>
  )
}
