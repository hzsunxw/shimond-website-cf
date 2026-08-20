import { getTranslation } from '@/lib/dictionary'
import ContactForm from './ContactForm'

interface ContactPageProps {
  locale: string
}

export default function ContactPage({ locale }: ContactPageProps) {
  const t = (key: string) => getTranslation(locale, key)

  return (
    <main>
      {/* ============================ PAGE HERO ============================ */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container">
          <span className="section-num section-num--accent">CONTACT</span>
          <span className="badge badge--accent">{t('contact.badge')}</span>
          <h1 className="page-title">{t('contact.title')}</h1>
          <p className="page-sub">{t('contact.subtitle')}</p>
        </div>
      </section>

      {/* ============================ CONTACT ============================ */}
      <section className="section" id="contact">
        <div className="container">
          <div className="section-head">
            <span className="section-num">01 / CONTACT</span>
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