import Link from 'next/link'
import { getTranslation } from '@/lib/dictionary'
import { getLocalizedValue } from '@/lib/i18n'

interface ProductItem {
  id: string
  title: string
  slug: string
  summary: string | null
  coverImage: string | null
  titleEn?: string | null
  titleEs?: string | null
  titleAr?: string | null
  summaryEn?: string | null
  summaryEs?: string | null
  summaryAr?: string | null
}

interface ProductCategoryPageProps {
  locale: string
  categorySlug: string
  categoryName: string
  products: ProductItem[]
}

export default function ProductCategoryPage({ locale, categorySlug, categoryName, products }: ProductCategoryPageProps) {
  const t = (key: string) => getTranslation(locale, key)

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">00 / PRODUCTS</span>
          <span className="badge badge--accent">{t('products.badge')}</span>
          <h1 className="page-title">{categoryName}</h1>
          <p className="page-sub">{t('products.subtitle')}</p>
        </div>
      </section>

      {/* ============================ BREADCRUMB ============================ */}
      <section className="section" style={{ paddingTop: '2rem', paddingBottom: '0' }}>
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/" className="breadcrumb-link">{t('home')}</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/products" className="breadcrumb-link">{t('products')}</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{categoryName}</span>
          </nav>
        </div>
      </section>

      {/* ============================ CATALOG ============================ */}
      <section className="section" id="catalog">
        <div className="container">
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => {
                const title = getLocalizedValue(product, locale, 'title') || product.title
                const summary = getLocalizedValue(product, locale, 'summary') || product.summary || ''
                const cover = product.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'
                return (
                  <article key={product.id} className="product-card">
                    <div className="product-media">
                      <img src={cover} alt={title} loading="lazy" />
                    </div>
                    <div className="product-body">
                      <h3 className="product-title">{title}</h3>
                      <p className="product-desc">{summary}</p>
                      <Link href={`/products/${product.slug}`} className="product-link">
                        <span>{t('viewDetails')}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">{t('products.subtitle')}</p>
          )}
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="section section--dark cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">{t('products.cta.title')}</h2>
            <p className="cta-desc">{t('products.cta.desc')}</p>
            <Link href="/contact" className="btn btn--gradient btn--lg">
              <span>{t('contact')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
