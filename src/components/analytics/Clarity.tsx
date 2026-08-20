'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

/**
 * Microsoft Clarity - free heatmaps and session recordings.
 *
 * - Loads Clarity script via next/script with `afterInteractive` strategy.
 * - Disabled when NEXT_PUBLIC_CLARITY_ID is not set.
 * - Excludes admin pages to keep analytics data clean.
 *
 * Configure by setting NEXT_PUBLIC_CLARITY_ID in .env
 * Get your Project ID at: https://clarity.microsoft.com
 */
export default function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_ID
  const pathname = usePathname()

  // Skip if no project ID configured
  if (!projectId) return null

  // Skip admin pages to avoid polluting analytics data
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
  const normalizedAdminPath = adminPath.startsWith('/') ? adminPath : `/${adminPath}`
  if (pathname.startsWith(normalizedAdminPath)) return null

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${projectId}");
      `}
    </Script>
  )
}
