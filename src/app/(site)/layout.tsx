import type { Metadata } from 'next'
import SiteHeader from '@/components/site/Header'
import SiteFooter from '@/components/site/Footer'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getSiteSeo } from '@/lib/seo'

async function getSiteData() {
  try {
    const config = await prisma.siteConfig.findFirst()
    const pages = await prisma.page.findMany({
      where: { status: 'ACTIVE', showInNav: true },
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

export const metadata: Metadata = {
  title: 'Shimond - Professional PVC Products Manufacturer',
  description: 'Professional manufacturer of high-quality PVC leather, mats, and table protectors.',
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

  return (
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
  )
}
