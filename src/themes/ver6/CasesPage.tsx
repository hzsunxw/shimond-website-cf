import Link from 'next/link'
import { getTranslation } from '@/lib/dictionary'
import { getLocalizedValue } from '@/lib/i18n'

// Locale-aware inline maps for keys absent from dictionary.ts
const STAT_COUNTRIES: Record<string, string> = {
  zh: '国家客户',
  en: 'Country Clients',
  es: 'Clientes por País',
  ar: 'عملاء حسب الدولة',
}
const STAT_METERS: Record<string, string> = {
  zh: '年采购量',
  en: 'Annual Volume',
  es: 'Volumen Anual',
  ar: 'الحجم السنوي',
}
const STAT_REDUCTION: Record<string, string> = {
  zh: '成本降低',
  en: 'Cost Reduction',
  es: 'Reducción de Costos',
  ar: 'تقليل التكلفة',
}
const CTA_TITLE: Record<string, string> = {
  zh: '想成为我们的下一个成功案例？',
  en: 'Want to be our next success story?',
  es: '¿Quieres ser nuestra próxima historia de éxito?',
  ar: 'هل تريد أن تكون قصة نجاحنا التالية؟',
}

const fallbackCases = [
  {
    id: '1',
    title: 'European Furniture PVC Leather Case Study',
    slug: 'europe-furniture-leather',
    clientName: 'EuroFurn Co.',
    summary: 'EuroFurn Co. faced high costs of genuine leather. We customized PVC leather solution, annual volume 500,000+ meters, reducing costs 35% and lead time 40%.',
    coverImage: 'https://images.unsplash.com/photo-1607646175036-fdba5063cfed?w=600&h=450&fit=crop',
  },
  {
    id: '2',
    title: 'European Furniture Brand Collaboration',
    slug: 'europe-furniture',
    clientName: 'EuroFurn Co.',
    summary: 'Providing high-quality PVC synthetic leather for European furniture brands for sofa and seat manufacturing.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  },
  {
    id: '3',
    title: 'Automotive Interior Project',
    slug: 'automotive-interior',
    clientName: 'AutoTech Inc.',
    summary: 'Supplied wear-resistant, eco-friendly PVC interior materials for automotive manufacturers.',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop',
  },
  {
    id: '4',
    title: 'Commercial Flooring Project',
    slug: 'commercial-flooring',
    clientName: 'BuildRight Ltd.',
    summary: 'Large-scale commercial space PVC mat supply project covering over 5,000 square meters.',
    coverImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=450&fit=crop',
  },
]

export default function CasesPage({ locale, cases }: { locale: string; cases: typeof fallbackCases }) {
  const t = (key: string) => getTranslation(locale, key)
  const display = cases.length > 0 ? cases : fallbackCases

  const statCountries = STAT_COUNTRIES[locale] || STAT_COUNTRIES.en
  const statMeters = STAT_METERS[locale] || STAT_METERS.en
  const statReduction = STAT_REDUCTION[locale] || STAT_REDUCTION.en
  const ctaTitle = CTA_TITLE[locale] || CTA_TITLE.en

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">00 / CASES</span>
          <span className="badge badge--accent">{t('cases.badge')}</span>
          <h1 className="page-title">{t('cases.title')}</h1>
          <p className="page-sub">{t('cases.subtitle')}</p>
        </div>
      </section>

      {/* ============================ PROJECTS ============================ */}
      <section className="section" id="projects">
        <div className="container">
          <div className="list-grid">
            {display.map((item) => {
              const title = getLocalizedValue(item, locale, 'title') || (item.title as string)
              const summary = getLocalizedValue(item, locale, 'summary') || (item.summary as string) || ''
              const clientName = (item.clientName as string | null) || null
              const cover = (item.coverImage as string | null) || 'https://images.unsplash.com/photo-1607646175036-fdba5063cfed?w=600&h=450&fit=crop'
              const slug = item.slug as string
              return (
                <Link key={item.id as string} href={`/cases/${slug}`} className="case-card">
                  <div className="case-media">
                    <img src={cover} alt={title} loading="lazy" />
                  </div>
                  <div className="case-body">
                    {clientName && (
                      <div className="case-client">
                        <span>{t('case.client')}</span>: {clientName}
                      </div>
                    )}
                    <h3 className="case-title">{title}</h3>
                    <p className="case-desc">{summary}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="section section--dark" id="stats">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val">50+</div>
              <div className="stat-label">{statCountries}</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">500,000+</div>
              <div className="stat-label">{statMeters}</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">35%</div>
              <div className="stat-label">{statReduction}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="section section--dark cta-section">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">{ctaTitle}</h2>
            <Link href="/about#contact" className="btn btn--accent btn--lg">
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
