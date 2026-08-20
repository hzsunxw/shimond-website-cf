import type { SiteSeoData } from './seo'

// ─── Types ──────────────────────────────────────────────────────────────────

interface JsonLdObject {
  '@context': string
  '@type': string
  [key: string]: unknown
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface OrganizationParams {
  siteUrl: string
  seo: SiteSeoData | null
  logo?: string | null
  socialLinks?: Record<string, string> | null
}

interface WebsiteParams {
  siteUrl: string
  siteName: string
  description?: string | null
  locale?: string
}

interface ProductParams {
  name: string
  description?: string | null
  image?: string | null
  images?: string[]
  url: string
  brand?: string
  sku?: string
  category?: string
  offers?: {
    price?: number | string | null
    priceCurrency?: string | null
    priceStrategy?: string
    availability?: string
  }
}

interface ArticleParams {
  title: string
  description?: string | null
  image?: string | null
  url: string
  datePublished?: string | Date | null
  dateModified?: string | Date | null
  author?: string | null
  publisherName?: string
  publisherLogo?: string | null
  keywords?: string[] | string | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDate(date: string | Date | null | undefined): string | undefined {
  if (!date) return undefined
  return new Date(date).toISOString()
}

// ─── Schema Generators ──────────────────────────────────────────────────────

/**
 * Generates Organization schema for the company.
 * Includes name, URL, logo, contact points, address, and social profiles.
 */
export function generateOrganizationSchema(params: OrganizationParams): JsonLdObject {
  const { siteUrl, seo, logo, socialLinks } = params
  const name = seo?.companyName || 'Shimond'

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
  }

  if (logo) {
    schema.logo = `${siteUrl}${logo}`
    schema.image = `${siteUrl}${logo}`
  }

  // Contact points
  const contactPoints: Record<string, unknown>[] = []
  if (seo?.phone) {
    contactPoints.push({
      '@type': 'ContactPoint',
      telephone: seo.phone,
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    })
  }
  if (seo?.email) {
    contactPoints.push({
      '@type': 'ContactPoint',
      email: seo.email,
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    })
  }
  if (contactPoints.length > 0) {
    schema.contactPoint = contactPoints
  }

  // Address
  if (seo?.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: seo.address,
    }
  }

  // Social profiles (sameAs)
  if (socialLinks) {
    const sameAs = Object.values(socialLinks).filter(Boolean)
    if (sameAs.length > 0) {
      schema.sameAs = sameAs
    }
  }

  // ─── Trading policy (B2B, verified against actual business practice) ─────
  // FOB (Free On Board) terms: the seller does not charge shipping (buyer
  // arranges freight), and goods are inspected before shipment, so there is
  // no return-on-remorse. Quality issues are handled per commercial agreement.
  const exportCountries = ['US', 'GB', 'DE', 'FR', 'ES', 'CA', 'AU']

  schema.hasMerchantReturnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: exportCountries,
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    merchantReturnLink: `${siteUrl}/shipping-policy`,
  }

  schema.hasShippingService = {
    '@type': 'ShippingService',
    name: 'FOB shipping',
    description: 'FOB (Free On Board) — buyer arranges and pays for freight',
    shippingConditions: {
      '@type': 'ShippingConditions',
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: exportCountries,
      },
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 0,
        currency: 'USD',
      },
    },
  }

  return schema
}

/**
 * Generates WebSite schema with potential search action.
 */
export function generateWebsiteSchema(params: WebsiteParams): JsonLdObject {
  const { siteUrl, siteName, description, locale } = params

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
  }

  if (description) {
    schema.description = description
  }

  if (locale) {
    schema.inLanguage = locale
  }

  // Potential search action (enables sitelinks search box in Google)
  schema.potentialAction = {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  }

  return schema
}

/**
 * Generates BreadcrumbList schema from path segments.
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generates Product schema for product detail pages.
 */
export function generateProductSchema(params: ProductParams): JsonLdObject {
  const { name, description, image, images, url, brand, sku, category, offers } = params

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
  }

  if (description) {
    schema.description = description
  }

  // Image(s)
  const allImages = [image, ...(images || [])].filter(Boolean) as string[]
  if (allImages.length === 1) {
    schema.image = allImages[0]
  } else if (allImages.length > 1) {
    schema.image = allImages
  }

  if (brand) {
    schema.brand = {
      '@type': 'Brand',
      name: brand,
    }
  }

  if (sku) {
    schema.sku = sku
  }

  if (category) {
    schema.category = category
  }

  // Offers — only emitted when an exact price is available.
  // Google requires Offer.price (or priceSpecification.price); emitting an Offer
  // without a price triggers a severe "must specify price" structured data error,
  // and fabricating prices violates Google Merchant policies. B2B contact/ranged
  // pricing therefore omits the offers block entirely.
  if (offers?.priceStrategy === 'EXACT' && offers.price != null) {
    schema.offers = {
      '@type': 'Offer',
      url,
      price: String(offers.price),
      priceCurrency: offers.priceCurrency || 'USD',
      availability: offers.availability
        ? `https://schema.org/${offers.availability}`
        : 'https://schema.org/InStock',
    }
  }

  return schema
}

/**
 * Generates Article schema for news/case detail pages.
 */
export function generateArticleSchema(params: ArticleParams): JsonLdObject {
  const {
    title,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author,
    publisherName,
    publisherLogo,
    keywords,
  } = params

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    url,
  }

  if (description) {
    schema.description = description
  }

  if (image) {
    schema.image = image
  }

  const published = toDate(datePublished)
  if (published) {
    schema.datePublished = published
  }

  const modified = toDate(dateModified)
  if (modified) {
    schema.dateModified = modified
  }

  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author,
    }
  }

  if (publisherName) {
    schema.publisher = {
      '@type': 'Organization',
      name: publisherName,
      ...(publisherLogo ? { logo: { '@type': 'ImageObject', url: publisherLogo } } : {}),
    }
  }

  if (keywords) {
    schema.keywords = Array.isArray(keywords) ? keywords.join(', ') : keywords
  }

  return schema
}
