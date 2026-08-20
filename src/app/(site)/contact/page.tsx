import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getServerLocale } from '@/lib/i18n-server'
import { getTranslation } from '@/lib/dictionary'
import { getSiteSeo } from '@/lib/seo'
import ContactSection from '@/components/site/ContactSection'
import { isVer5Theme } from '@/lib/theme'

async function getContactConfig() {
  try {
    return await prisma.siteConfig.findFirst({
      select: {
        address: true,
        phone: true,
        email: true,
        socialLinks: true,
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const t = (key: string) => getTranslation(locale, key)
  const seo = await getSiteSeo(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = `${t('contact.title')} | ${seo?.companyName || 'Shimond'}`
  const description = t('contact.subtitle')
  const ogImage = seo?.defaultOgImage || `${siteUrl}/og-image.png`

  return {
    title,
    description,
    keywords: seo?.defaultSeoKeywords || undefined,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/contact`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteUrl}/contact`,
      languages: {
        zh: `${siteUrl}/contact`,
        en: `${siteUrl}/contact`,
        es: `${siteUrl}/contact`,
        ar: `${siteUrl}/contact`,
      },
    },
  }
}

export default async function ContactPage() {
  const locale = await getServerLocale()

  if (isVer5Theme()) {
    const { default: Ver5ContactPage } = await import('@/themes/ver5/ContactPage')
    return <Ver5ContactPage locale={locale} />
  }

  const config = await getContactConfig()
  return (
    <div className="pt-[5rem]">
      <ContactSection
        address={config?.address}
        phone={config?.phone}
        email={config?.email}
        socialLinks={config?.socialLinks as Record<string, string> | null}
      />
    </div>
  )
}