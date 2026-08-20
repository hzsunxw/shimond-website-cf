'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

/**
 * Google Analytics 4 (GA4) tracking component.
 *
 * - Loads gtag.js via next/script with `afterInteractive` strategy (non-blocking).
 * - Disabled when NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.
 * - Excludes admin pages to keep analytics data clean.
 *
 * Configure by setting NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) in .env
 */
export default function GA4() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const pathname = usePathname()

  // Skip if no measurement ID configured
  if (!measurementId) return null

  // Skip admin pages to avoid polluting analytics data
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
  const normalizedAdminPath = adminPath.startsWith('/') ? adminPath : `/${adminPath}`
  if (pathname.startsWith(normalizedAdminPath)) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
