import { getTranslation } from '@/lib/dictionary'
import ContactForm from './ContactForm'

interface AboutPageProps {
  locale: string
}

export default function AboutPage({ locale }: AboutPageProps) {
  const t = (key: string) => getTranslation(locale, key)

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">00 / ABOUT</span>
          <span className="badge badge--accent">{t('about.badge')}</span>
          <h1 className="page-title">{t('about.title')}</h1>
          <p className="page-sub">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* ============================ CERTIFICATIONS & CAPACITY ============================ */}
      <section className="section section--dark" id="certifications">
        <div className="container">
          <div className="section-head section-head--light">
            <span className="section-num section-num--accent">01 / CERTIFICATIONS</span>
            <span className="badge badge--accent">{t('about.cert.title')}</span>
            <h2 className="section-title section-title--light">{t('about.cert.title')}</h2>
          </div>

          <div className="page-grid">
            {/* Left column: Certifications */}
            <div>
              <span
                className="section-num section-num--accent"
                style={{ display: 'block', marginBottom: '1.25rem' }}
              >
                CERTIFICATIONS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </span>
                  <span className="cert-text">{t('about.cert.iso9001')}</span>
                </div>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-4.7 17.04-8.2 17.04z" />
                      <path d="M2 22c0-7 7-12 9-12" />
                    </svg>
                  </span>
                  <span className="cert-text">{t('about.cert.iso14001')}</span>
                </div>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2H2z" />
                      <path d="M4 16V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
                      <path d="M12 7V4" />
                      <path d="M9 4h6" />
                    </svg>
                  </span>
                  <span className="cert-text">{t('about.cert.ohsas')}</span>
                </div>
              </div>
            </div>

            {/* Right column: Capacity metrics */}
            <div>
              <span
                className="section-num section-num--accent"
                style={{ display: 'block', marginBottom: '1.25rem' }}
              >
                {t('about.capacity.title')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21V8l9-4 9 4v13" />
                      <path d="M3 21h18" />
                      <path d="M9 21v-6h6v6" />
                      <path d="M7 12h2M15 12h2" />
                    </svg>
                  </span>
                  <div>
                    <strong className="cert-text" style={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
                      {t('about.capacity.area')}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.6)' }}>
                      {t('about.capacity.area.label')}
                    </span>
                  </div>
                </div>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18" />
                      <path d="M7 14l4-4 4 4 4-6" />
                    </svg>
                  </span>
                  <div>
                    <strong className="cert-text" style={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
                      {t('about.capacity.output')}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.6)' }}>
                      {t('about.capacity.output.label')}
                    </span>
                  </div>
                </div>
                <div className="cert-item">
                  <span className="cert-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" />
                    </svg>
                  </span>
                  <div>
                    <strong className="cert-text" style={{ display: 'block', fontFamily: 'var(--font-mono)' }}>
                      {t('about.capacity.auto')}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.6)' }}>
                      {t('about.capacity.auto.label')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ CONTACT ============================ */}
      <section className="section" id="contact">
        <div className="container">
          <div className="section-head">
            <span className="section-num">02 / CONTACT</span>
            <span className="badge">{t('about.contact.badge')}</span>
            <h2 className="section-title">{t('about.contact.title')}</h2>
          </div>

          <div className="contact-grid">
            {/* Left: Contact info card */}
            <div className="contact-info-card">
              <div className="hotline-label">{t('about.contact.hotline')}</div>
              <div className="hotline-num">{t('about.contact.hotlineValue')}</div>
              <div className="info-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{t('about.contact.address')}</span>
              </div>
              <div className="info-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{t('about.contact.phone')}</span>
              </div>
              <div className="info-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                <span>{t('about.contact.email')}</span>
              </div>
              <div className="info-line">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                </svg>
                <span>{t('about.contact.website')}</span>
              </div>
            </div>

            {/* Right: Contact form (client component) */}
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>
    </main>
  )
}
