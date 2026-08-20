/**
 * GA4 event tracking helpers.
 *
 * These functions safely call gtag if available (production with GA4 configured),
 * and no-op in development or when GA4 is not loaded.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Track a custom GA4 event.
 * @param action - Event name (e.g. 'generate_lead', 'add_to_cart')
 * @param params - Additional event parameters
 */
export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params)
  }
}

/**
 * Track a lead conversion (contact form submit, WhatsApp inquiry, etc.)
 * @param method - How the lead was generated (e.g. 'contact_form', 'whatsapp')
 */
export function trackLead(method: string = 'contact_form') {
  trackEvent('generate_lead', { method })
}

/**
 * Track an inquiry cart action (add product to inquiry list)
 * @param productId - Product identifier
 * @param productName - Product name for reporting
 */
export function trackAddToInquiry(productId: string, productName: string) {
  trackEvent('add_to_cart', {
    items: [
      {
        item_id: productId,
        item_name: productName,
      },
    ],
  })
}

/**
 * Track a social media link click.
 * @param platform - Social platform (e.g. 'whatsapp', 'linkedin', 'facebook')
 */
export function trackSocialClick(platform: string) {
  trackEvent('social_click', { platform })
}
