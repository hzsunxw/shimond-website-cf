'use client'

import { trackSocialClick } from '@/lib/gtag'

interface SocialLinkProps {
  href: string
  platform: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

/**
 * Social media link with GA4 click tracking.
 * Wraps an <a> tag and fires a 'social_click' event on click.
 */
export default function SocialLink({ href, platform, children, className, ariaLabel }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel || platform}
      className={className}
      onClick={() => trackSocialClick(platform)}
    >
      {children}
    </a>
  )
}
