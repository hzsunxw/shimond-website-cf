import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * Generates /sitemap.xml
 *
 * Includes:
 * - Static routes (home, contact, inquiry)
 * - CMS pages (from Page model, ACTIVE status)
 * - Product detail pages (from ServiceItem, ACTIVE status)
 * - Case detail pages (from CaseItem, ACTIVE status)
 * - News detail pages (from NewsItem, ACTIVE status)
 *
 * Dynamic DB queries are wrapped in try/catch so the sitemap
 * still renders (with static routes only) if the DB is unavailable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date()

  // ── Static routes ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/products/category/pvc-foam`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/products/category/pvc-mats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/products/category/table-protector`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/products/category/soundproof-cotton`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/cases`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/shipping-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // ── CMS pages (from DB) ──────────────────────────────────────────────────
  try {
    const pages = await prisma.page.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    })
    for (const page of pages) {
      // "home" slug maps to the root URL already in staticRoutes
      if (page.slug === 'home') continue
      staticRoutes.push({
        url: `${siteUrl}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch {
    // DB unavailable — skip dynamic CMS pages
  }

  // ── Product detail pages ─────────────────────────────────────────────────
  try {
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    })
    for (const product of products) {
      staticRoutes.push({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch {
    // DB unavailable — skip dynamic product pages
  }

  // ── Case detail pages ────────────────────────────────────────────────────
  try {
    const cases = await prisma.caseItem.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    })
    for (const caseItem of cases) {
      staticRoutes.push({
        url: `${siteUrl}/cases/${caseItem.slug}`,
        lastModified: caseItem.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // DB unavailable — skip dynamic case pages
  }

  // ── News detail pages ────────────────────────────────────────────────────
  try {
    const news = await prisma.newsItem.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true, publishAt: true },
    })
    for (const newsItem of news) {
      staticRoutes.push({
        url: `${siteUrl}/news/${newsItem.slug}`,
        lastModified: newsItem.publishAt || newsItem.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // DB unavailable — skip dynamic news pages
  }

  return staticRoutes
}
