import { prisma } from './prisma'

export interface SiteSeoData {
  companyName: string | null
  siteTitle: string | null
  siteDescription: string | null
  defaultSeoTitle: string | null
  defaultSeoDescription: string | null
  defaultSeoKeywords: string | null
  defaultOgImage: string | null
  favicon: string | null
  address: string | null
  phone: string | null
  email: string | null
}

export async function getSiteSeo(locale: string): Promise<SiteSeoData | null> {
  try {
    const config = await prisma.siteSeoConfig.findUnique({
      where: { languageCode: locale },
    })
    if (config) {
      return {
        companyName: config.companyName,
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        defaultSeoTitle: config.defaultSeoTitle,
        defaultSeoDescription: config.defaultSeoDescription,
        defaultSeoKeywords: config.defaultSeoKeywords,
        defaultOgImage: config.defaultOgImage,
        favicon: config.favicon,
        address: config.address,
        phone: config.phone,
        email: config.email,
      }
    }
    return null
  } catch {
    return null
  }
}

export async function getFallbackSiteSeo(): Promise<SiteSeoData | null> {
  try {
    const config = await prisma.siteConfig.findFirst()
    if (config) {
      return {
        companyName: config.companyName,
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        defaultSeoTitle: config.defaultSeoTitle,
        defaultSeoDescription: config.defaultSeoDescription,
        defaultSeoKeywords: config.defaultSeoKeywords,
        defaultOgImage: config.defaultOgImage,
        favicon: config.favicon,
        address: config.address,
        phone: config.phone,
        email: config.email,
      }
    }
    return null
  } catch {
    return null
  }
}
