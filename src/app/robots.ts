import type { MetadataRoute } from 'next'

/**
 * Generates /robots.txt
 * - Allows crawling of all public pages
 * - Blocks /admin/ (backend CMS) and /api/ (data endpoints)
 * - Points crawlers to the sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  // Admin path may be customized via env (defaults to /admin)
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          `/${adminPath}/`,
          '/api/',
          '/inquiry',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
