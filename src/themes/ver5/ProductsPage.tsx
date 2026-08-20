import Link from 'next/link'
import { getTranslation } from '@/lib/dictionary'

interface ProductsPageProps {
  locale: string
  categories: { slug: string; labelKey: string; count: number }[]
}

export default function ProductsPage({ locale, categories }: ProductsPageProps) {
  const t = (key: string) => getTranslation(locale, key)

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">00 / PRODUCTS</span>
          <span className="badge badge--accent">{t('products.badge')}</span>
          <h1 className="page-title">{t('products.title')}</h1>
          <p className="page-sub">{t('products.subtitle')}</p>
        </div>
      </section>

      {/* ============================ CATEGORIES ============================ */}
      <section className="section" id="catalog">
        <div className="container">
          <div className="products-grid">
            {categories.map((category) => {
              const name = t(category.labelKey)
              return (
                <Link key={category.slug} href={`/products/category/${category.slug}`} className="product-card">
                  <div className="product-body">
                    <h3 className="product-title">{name}</h3>
                    <p className="product-desc">{category.count} {t('products')}</p>
                    <span className="product-link">
                      <span>{t('viewDetails')}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="section section--dark cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">{t('products.cta.title')}</h2>
            <p className="cta-desc">{t('products.cta.desc')}</p>
            <Link href="/contact" className="btn btn--accent btn--lg">
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
