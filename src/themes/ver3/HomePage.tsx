import Link from 'next/link'
import { getTranslation } from '@/lib/dictionary'
import { getLocalizedValue } from '@/lib/i18n'
import ContactForm from './ContactForm'

interface HomePageProps {
  locale: string
  products: Array<{ id: string; title: string; slug: string; summary: string | null; coverImage: string | null; titleEn?: string | null; titleEs?: string | null; titleAr?: string | null; summaryEn?: string | null; summaryEs?: string | null; summaryAr?: string | null }>
  config: { address?: string | null; phone?: string | null; email?: string | null; socialLinks?: Record<string, string> | null } | null
}

export default function HomePage({ locale, products, config }: HomePageProps) {
  const t = (k: string) => getTranslation(locale, k)
  const ArrowSvg = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>)

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-grid-bg" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span className="dot" /><span>{t('hero.tagline')}</span></span>
            <h1 className="hero-title"><span>{t('hero.title1')}</span><br /><span className="grad">{t('hero.title2')}</span></h1>
            <p className="hero-sub">{t('hero.subtitle')}</p>
            <div className="hero-cta-row">
              <Link href="/products" className="btn btn--gradient btn--lg"><span>{t('hero.cta1')}</span>{ArrowSvg}</Link>
              <Link href="/contact" className="btn btn--ghost-light btn--lg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg><span>{t('hero.cta2')}</span></Link>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-num">15+</div><div className="hero-stat-label">{t('hero.stats.years')}</div></div>
              <div><div className="hero-stat-num">50+</div><div className="hero-stat-label">{t('hero.stats.clients')}</div></div>
              <div><div className="hero-stat-num">1000+</div><div className="hero-stat-label">{t('hero.stats.products')}</div></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-media"><img src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&h=675&fit=crop" alt="PVC products showcase" /></div>
            <div className="cert-chip cert-chip--1"><span className="ic ic-teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></span><div><strong>{t('hero.cert.iso9001')}</strong><span>{t('hero.cert.quality')}</span></div></div>
            <div className="cert-chip cert-chip--2"><span className="ic ic-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-4.7 17.04-8.2 17.04z" /><path d="M2 22c0-7 7-12 9-12" /></svg></span><div><strong>{t('hero.cert.iso14001')}</strong><span>{t('hero.cert.environment')}</span></div></div>
            <div className="cert-chip cert-chip--3"><span className="ic ic-rose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M4 12a8 8 0 0 1 16 0M12 12v8M9 20h6" /></svg></span><div><strong>{t('hero.cert.ohsas')}</strong><span>{t('hero.cert.safety')}</span></div></div>
          </div>
        </div>
      </section>

      <div className="trust-bar" aria-hidden="true"><div className="marquee"><span>ISO 9001</span><span>ISO 14001</span><span>OHSAS 18001</span><span>EU ROHS</span><span>REACH</span><span>10M+ sqm / year</span><span>50+ countries</span><span>15+ years</span><span>ISO 9001</span><span>ISO 14001</span><span>OHSAS 18001</span><span>EU ROHS</span><span>REACH</span><span>10M+ sqm / year</span><span>50+ countries</span><span>15+ years</span></div></div>

      <section className="section bg-slate" id="products"><div className="container">
        <div className="section-head--center"><span className="eyebrow">{t('products.badge')}</span><h2 className="section-title">{t('products.title')}</h2><p className="section-sub">{t('products.subtitle')}</p></div>
        <div className="products-grid">
          {(products.length > 0 ? products : []).slice(0, 3).map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-media"><img src={p.coverImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop'} alt={getLocalizedValue(p, locale, 'title') || p.title} loading="lazy" /></div>
              <div className="product-body"><h3 className="product-title">{getLocalizedValue(p, locale, 'title') || p.title}</h3><p className="product-desc">{getLocalizedValue(p, locale, 'summary') || p.summary || ''}</p><Link href={`/products/${p.slug}`} className="product-link"><span>{t('cta.viewDetails')}</span>{ArrowSvg}</Link></div>
            </article>
          ))}
        </div>
      </div></section>
      {/* SECTIONS_INSERT_POINT */}

      <section className="section" id="features"><div className="container">
        <div className="section-head--center"><span className="eyebrow eyebrow--amber">{t('features.badge')}</span><h2 className="section-title">{t('features.title')}</h2><p className="section-sub">{t('features.subtitle')}</p></div>
        <div className="features-grid">
          <article className="feature-card"><span className="feature-num">01</span><div className="feature-ic feature-ic--teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6v4l4 7a4 4 0 0 1-3.5 6h-7A4 4 0 0 1 5 14l4-7V3z" /><path d="M9 3h6" /></svg></div><h3 className="feature-title">{t('features.tech')}</h3><p className="feature-desc">{t('features.tech.desc')}</p></article>
          <article className="feature-card"><span className="feature-num">02</span><div className="feature-ic feature-ic--amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-4.7 17.04-8.2 17.04z" /><path d="M2 22c0-7 7-12 9-12" /></svg></div><h3 className="feature-title">{t('features.eco')}</h3><p className="feature-desc">{t('features.eco.desc')}</p></article>
          <article className="feature-card"><span className="feature-num">03</span><div className="feature-ic feature-ic--rose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg></div><h3 className="feature-title">{t('features.smart')}</h3><p className="feature-desc">{t('features.smart.desc')}</p></article>
          <article className="feature-card"><span className="feature-num">04</span><div className="feature-ic feature-ic--ink"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 4-6" /></svg></div><h3 className="feature-title">{t('features.capacity')}</h3><p className="feature-desc">{t('features.capacity.desc')}</p></article>
        </div>
      </div></section>

      <section className="section bg-slate" id="about"><div className="container">
        <div className="about-grid">
          <div className="about-visual"><div className="about-media"><img src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&h=600&fit=crop" alt="Shimond production facility" loading="lazy" /></div><div className="about-experience-badge"><div className="num">15+</div><div className="lbl">{t('hero.stats.years')}</div></div></div>
          <div className="about-copy">
            <div><span className="eyebrow">{t('about.badge')}</span><h2 className="section-title">{t('about.title')}</h2><p>{t('about.desc1')}</p><p>{t('about.desc2')}</p><div style={{ marginTop: '1.75rem' }}><Link href="/contact" className="btn btn--gradient"><span>{t('about.cta')}</span>{ArrowSvg}</Link></div></div>
            <div className="culture-grid">
              <div className="culture-card"><h4>{t('about.mission')}</h4><p>{t('about.mission.text')}</p></div>
              <div className="culture-card"><h4>{t('about.purpose')}</h4><p>{t('about.purpose.text')}</p></div>
              <div className="culture-card"><h4>{t('about.values')}</h4><p>{t('about.values.text')}</p></div>
              <div className="culture-card"><h4>{t('about.philosophy')}</h4><p>{t('about.philosophy.text')}</p></div>
            </div>
          </div>
        </div>
      </div></section>

      <section className="section production"><div className="container">
        <div className="production-grid">
          <div className="production-media"><img src="/images/about/production-line.jpg" alt="PVC production line" loading="lazy" /></div>
          <div className="production-copy">
            <div><span className="eyebrow eyebrow--light">{t('production.badge')}</span><h2 className="section-title">{t('production.title')}</h2><p>{t('production.desc')}</p></div>
            <div className="metric-row">
              <div className="metric"><div className="v">{t('production.area.value')}</div><div className="l">{t('production.area')}</div></div>
              <div className="metric"><div className="v">{t('production.output.value')}</div><div className="l">{t('production.output')}</div></div>
              <div className="metric"><div className="v">4</div><div className="l">{t('production.units.title')}</div></div>
            </div>
            <div className="unit-grid">
              <div className="unit"><span className="unit-num">1</span><span className="unit-name">{t('production.unit1')}</span></div>
              <div className="unit"><span className="unit-num">2</span><span className="unit-name">{t('production.unit2')}</span></div>
              <div className="unit"><span className="unit-num">3</span><span className="unit-name">{t('production.unit3')}</span></div>
              <div className="unit"><span className="unit-num">4</span><span className="unit-name">{t('production.unit4')}</span></div>
            </div>
          </div>
        </div>
      </div></section>

      <section className="section" id="gallery"><div className="container">
        <div className="section-head--center"><span className="eyebrow">{t('gallery.scenes.badge')}</span><h2 className="section-title">{t('gallery.scenes.title')}</h2><p className="section-sub">{t('gallery.scenes.subtitle')}</p></div>
        <div className="scene-grid">
          <figure className="scene-card"><img src="/images/gallery/scenes/table-protector.png" alt={t('gallery.scenes.tableProtector')} loading="lazy" /><figcaption className="scene-overlay"><span className="scene-title">{t('gallery.scenes.tableProtector')}</span><span className="scene-sub">{t('gallery.scenes.tableProtector.sub')}</span></figcaption></figure>
          <figure className="scene-card"><img src="/images/gallery/scenes/pvc-placemat.jpg" alt={t('gallery.scenes.placemat')} loading="lazy" /><figcaption className="scene-overlay"><span className="scene-title">{t('gallery.scenes.placemat')}</span><span className="scene-sub">{t('gallery.scenes.placemat.sub')}</span></figcaption></figure>
          <figure className="scene-card"><img src="/images/gallery/scenes/pvc-anti-slip-mat.png" alt={t('gallery.scenes.antiSlip')} loading="lazy" /><figcaption className="scene-overlay"><span className="scene-title">{t('gallery.scenes.antiSlip')}</span><span className="scene-sub">{t('gallery.scenes.antiSlip.sub')}</span></figcaption></figure>
        </div>
        <div className="section-head--center" style={{ marginTop: '5rem' }}><span className="eyebrow eyebrow--amber">{t('gallery.patterns.badge')}</span><h2 className="section-title">{t('gallery.patterns.title')}</h2><p className="section-sub">{t('gallery.patterns.subtitle')}</p></div>
        <div className="pattern-grid">
          <figure className="pattern-card"><img src="/images/gallery/patterns/grid-sdy801.jpg" alt={t('gallery.patterns.grid')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.grid')}</span><span className="pattern-code">SDY-801</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/cloud-sdy802.jpg" alt={t('gallery.patterns.cloud')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.cloud')}</span><span className="pattern-code">SDY-802</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/bark-sdy803.jpg" alt={t('gallery.patterns.bark')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.bark')}</span><span className="pattern-code">SDY-803</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/cookie-sdy822.jpg" alt={t('gallery.patterns.cookie')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.cookie')}</span><span className="pattern-code">SDY-822</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/dots-sdy829.jpg" alt={t('gallery.patterns.dots')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.dots')}</span><span className="pattern-code">SDY-829</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/web-sdy830.jpg" alt={t('gallery.patterns.web')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.web')}</span><span className="pattern-code">SDY-830</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/coin-sdy822.jpg" alt={t('gallery.patterns.coin')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.coin')}</span><span className="pattern-code">SDY-822</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/willow-sdy818.jpg" alt={t('gallery.patterns.willow')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.willow')}</span><span className="pattern-code">SDY-818</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/chrysanthemum-sdy804.jpg" alt={t('gallery.patterns.chrysanthemum')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.chrysanthemum')}</span><span className="pattern-code">SDY-804</span></figcaption></figure>
          <figure className="pattern-card"><img src="/images/gallery/patterns/diamond-sdy812.jpg" alt={t('gallery.patterns.diamond')} loading="lazy" /><figcaption className="pattern-meta"><span className="pattern-name">{t('gallery.patterns.diamond')}</span><span className="pattern-code">SDY-812</span></figcaption></figure>
        </div>
      </div></section>

      <section className="section bg-slate" id="contact"><div className="container">
        <div className="section-head--center"><span className="eyebrow">{t('contact.badge')}</span><h2 className="section-title">{t('contact.title')}</h2><p className="section-sub">{t('contact.subtitle')}</p></div>
        <div className="contact-grid">
          <ContactForm locale={locale} />
          <div className="contact-info">
            <div className="info-card"><span className="info-ic info-ic--teal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></span><div><div className="label">{t('contact.address.label')}</div><div className="value">{config?.address || t('about.contact.address')}</div></div></div>
            <div className="info-card"><span className="info-ic info-ic--amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span><div><div className="label">{t('contact.phone.label')}</div><div className="value">{config?.phone || t('about.contact.phone')}</div></div></div>
            <div className="info-card"><span className="info-ic info-ic--rose"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg></span><div><div className="label">{t('contact.email.label')}</div><div className="value">{config?.email || t('about.contact.email')}</div></div></div>
            <div className="hotline-card"><div className="label">{t('about.contact.hotline')}</div><div className="num">{t('about.contact.hotlineValue')}</div></div>
          </div>
        </div>
      </div></section>
    </>
  )
}
