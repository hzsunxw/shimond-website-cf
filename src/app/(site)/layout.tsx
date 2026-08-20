import type { Metadata } from 'next'
import SiteHeader from '@/components/site/Header'
import SiteFooter from '@/components/site/Footer'
import JsonLd from '@/components/site/JsonLd'
import { LocaleProvider } from '@/components/LocaleProvider'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getSiteSeo } from '@/lib/seo'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/structured-data'
import { isVer4Theme, isVer3Theme, isVer5Theme, isVer6Theme, getTheme } from '@/lib/theme'

// Theme Layout components are imported dynamically (await import) below so that
// only the active theme's code is loaded. Theme CSS is served as static files
// from /public/themes/<name>/styles.css and loaded via <link> to avoid Next.js
// App Router bundling all themes' CSS together.

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
  const ogImage = seo?.defaultOgImage || `${siteUrl}/og-image.png`

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

  const themeProps = {
    locale,
    siteName: companyName,
    companyName,
    address,
    phone,
    email,
    socialLinks: config?.socialLinks as Record<string, string> | null,
  }

  // Dynamically import only the active theme's Layout component.
  // CSS is loaded separately via <link> above (see themeCss) from /public/themes/.
  let ThemeLayout: React.ComponentType<typeof themeProps & { children: React.ReactNode }> | null = null
  if (isVer3Theme()) ThemeLayout = (await import('@/themes/ver3/Layout')).default
  else if (isVer4Theme()) ThemeLayout = (await import('@/themes/ver4/Layout')).default
  else if (isVer5Theme()) ThemeLayout = (await import('@/themes/ver5/Layout')).default
  else if (isVer6Theme()) ThemeLayout = (await import('@/themes/ver6/Layout')).default

  const themeName = getTheme()
  const themeCss = themeName !== 'default' ? (
    <link rel="stylesheet" href={`/themes/${themeName}/styles.css`} />
  ) : null

  if (ThemeLayout) {
    return (
      <LocaleProvider locale={locale}>
        {themeCss}
        <JsonLd data={[orgSchema, websiteSchema]} />
        <ThemeLayout {...themeProps}>{children}</ThemeLayout>
      </LocaleProvider>
    )
  }

  return (
    <LocaleProvider locale={locale}>
      {themeCss}
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
    </LocaleProvider>
  )
}
