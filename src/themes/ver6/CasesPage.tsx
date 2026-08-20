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

type CaseItem = {
  id: string
  title: string
  titleEn: string | null
  titleEs: string | null
  titleAr: string | null
  slug: string
  clientName: string | null
  summary: string | null
  summaryEn: string | null
  summaryEs: string | null
  summaryAr: string | null
  coverImage: string | null
}

export default function CasesPage({ locale, cases }: { locale: string; cases: CaseItem[] }) {
  const t = (key: string) => getTranslation(locale, key)
  const display = cases

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
