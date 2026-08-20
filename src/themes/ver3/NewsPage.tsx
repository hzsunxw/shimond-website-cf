import Link from 'next/link'
import { getTranslation } from '@/lib/dictionary'
import { getLocalizedValue, getLocalizedArray } from '@/lib/i18n'

// Locale-aware inline maps for keys absent from dictionary.ts
const CTA_TITLE: Record<string, string> = {
  zh: '对我们的产品感兴趣？',
  en: 'Interested in our products?',
  es: '¿Interesado en nuestros productos?',
  ar: 'هل أنت مهتم بمنتجاتنا؟',
}
const CTA_DESC: Record<string, string> = {
  zh: '联系我们获取报价和定制方案。',
  en: 'Contact us for quotes and customized solutions.',
  es: 'Contáctenos para cotizaciones y soluciones personalizadas.',
  ar: 'تواصل معنا للحصول على عروض أسعار وحلول مخصصة.',
}

const fallbackNews = [
  {
    id: '1',
    title: 'New Trends in Summer Home Decor: Eco-Friendly PVC Materials Become Mainstream',
    slug: 'summer-home-decor-trends',
    summary: 'Eco-friendly PVC materials become the mainstream choice this summer.',
    coverImage: 'https://images.unsplash.com/photo-1600421468168-370690d2445c?w=600&h=400&fit=crop',
    author: 'Shimond Team',
    publishAt: new Date('2026-05-13'),
    tags: ['PVC Materials', 'Eco-Friendly', 'Home Decor'],
  },
  {
    id: '2',
    title: 'Summer Home Refresh: PVC Eco-Friendly Materials for Style & Practicality',
    slug: 'summer-home-refresh',
    summary: 'Analyzing latest trends of PVC eco-friendly materials in floor mats, tablecloths.',
    coverImage: 'https://images.unsplash.com/photo-1572280206390-dec43a8cd63e?w=600&h=400&fit=crop',
    author: 'Shimond Team',
    publishAt: new Date('2026-05-13'),
    tags: ['PVC Materials', 'Summer Refresh'],
  },
  {
    id: '3',
    title: 'Green Forest PVC Debuts New Products at 2026 Canton Fair',
    slug: 'canton-fair-2026',
    summary: 'Green Forest PVC announces participation with eco-friendly synthetic leather, floor mats.',
    coverImage: 'https://images.unsplash.com/photo-1650402268468-7526b2502a04?w=600&h=400&fit=crop',
    author: 'Shimond Team',
    publishAt: new Date('2026-05-07'),
    tags: ['Canton Fair', 'PVC Materials'],
  },
]

function formatDate(date: Date | null, locale: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsPage({ locale, news }: { locale: string; news: typeof fallbackNews }) {
  const t = (key: string) => getTranslation(locale, key)
  const display = news.length > 0 ? news : fallbackNews

  const ctaTitle = CTA_TITLE[locale] || CTA_TITLE.en
  const ctaDesc = CTA_DESC[locale] || CTA_DESC.en

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">00 / NEWS</span>
          <span className="badge badge--accent">{t('news.badge')}</span>
          <h1 className="page-title">{t('news.title')}</h1>
          <p className="page-sub">{t('news.subtitle')}</p>
        </div>
      </section>

      {/* ============================ ARTICLES ============================ */}
      <section className="section" id="articles">
        <div className="container">
          <div className="list-grid">
            {display.map((item) => {
              const title = getLocalizedValue(item, locale, 'title') || (item.title as string)
              const summary = getLocalizedValue(item, locale, 'summary') || (item.summary as string) || ''
              const author = (item.author as string | null) || null
              const publishAt = (item.publishAt as Date | null) || null
              const cover = (item.coverImage as string | null) || 'https://images.unsplash.com/photo-1600421468168-370690d2445c?w=600&h=400&fit=crop'
              const slug = item.slug as string
              const tags = getLocalizedArray(item, locale, 'tags') || []
              return (
                <Link key={item.id as string} href={`/news/${slug}`} className="news-card">
                  <div className="news-media">
                    <img src={cover} alt={title} loading="lazy" />
                  </div>
                  <div className="news-body">
                    <div className="news-meta">
                      <time dateTime={publishAt ? new Date(publishAt).toISOString() : undefined}>
                        {formatDate(publishAt, locale)}
                      </time>
                      <span>·</span>
                      <span>{author || 'Shimond Team'}</span>
                    </div>
                    <h3 className="news-title">{title}</h3>
                    <p className="news-desc">{summary}</p>
                    {tags.length > 0 && (
                      <div className="news-tags">
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="news-tag">{tag}</span>
                        ))}
                      </div>
                    )}
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
            <h2 className="cta-title">{ctaTitle}</h2>
            <p className="cta-desc">{ctaDesc}</p>
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
