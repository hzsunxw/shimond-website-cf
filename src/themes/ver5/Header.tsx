'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { setLocale } from '@/lib/i18n'
import { getTranslation } from '@/lib/dictionary'

const navLinks = [
  { href: '/', key: 'nav.home' },
  { href: '/about', key: 'nav.about' },
  { href: '/products', key: 'nav.products' },
  { href: '/cases', key: 'nav.cases' },
  { href: '/news', key: 'nav.news' },
]

const productCategories = [
  { href: '/products/category/pvc-foam', labelKey: 'product.category.pvcFoam' },
  { href: '/products/category/pvc-mats', labelKey: 'product.category.pvcMats' },
  { href: '/products/category/table-protector', labelKey: 'product.category.tableProtector' },
  { href: '/products/category/soundproof-cotton', labelKey: 'product.category.soundproofCotton' },
]

const langs = [
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', key: 'lang.zh' },
  { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', key: 'lang.en' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', key: 'lang.es' },
  { code: 'ar', flag: '\u{1F1F8}\u{1F1E6}', key: 'lang.ar' },
]

// Pages with a dark hero section where the transparent header is appropriate.
// All other pages (detail pages, inquiry, generic CMS) get a solid header.
const HERO_PAGES = ['/', '/products', '/cases', '/news', '/about']

export default function Header({ locale, siteName = 'Shimond' }: { locale: string; siteName?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const pathname = usePathname()
  const t = (k: string) => getTranslation(locale, k)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Force solid header on pages without a dark hero
  const solid = scrolled || !HERO_PAGES.includes(pathname)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const pickLang = (code: string) => {
    setLocale(code)
    setLangOpen(false)
    setMobileOpen(false)
  }

  const ArrowIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  )

  return (
    <>
      <header className={`site-header${solid ? ' is-scrolled' : ''}`} id="siteHeader">
        <div className="header-inner">
          <Link href="/" className="logo" aria-label={`${siteName} home`}>
            <span className="logo-mark">S</span>
            <span className="logo-text">{siteName}</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            {navLinks.map((l) => {
              if (l.href === '/products') {
                return (
                  <div key={l.href} style={{ position: 'relative' }} onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
                    <Link href={l.href} className={`nav-link${isActive(l.href) ? ' is-active' : ''}`}>
                      {t(l.key)}
                    </Link>
                    {productsOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '8px', padding: '8px 0', zIndex: 100 }}>
                        {productCategories.map((cat) => (
                          <Link key={cat.href} href={cat.href} style={{ display: 'block', padding: '10px 20px', color: '#333', fontSize: '14px', textDecoration: 'none' }} onClick={() => setProductsOpen(false)}>
                            {t(cat.labelKey)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link key={l.href} href={l.href} className={`nav-link${isActive(l.href) ? ' is-active' : ''}`}>
                  {t(l.key)}
                </Link>
              )
            })}
          </nav>

          <div className="header-actions">
            <Link href="/inquiry" className="icon-btn" aria-label={t('nav.inquiry')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            </Link>

            <div className={`lang-switch${langOpen ? ' is-open' : ''}`}>
              <button className="lang-trigger" aria-haspopup="true" aria-expanded={langOpen} onClick={() => setLangOpen(v => !v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
                <span>{t('lang.label')}</span>
                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <div className="lang-menu" role="menu">
                {langs.map((l) => (
                    <button key={l.code} className={`lang-option${locale === l.code ? ' is-active' : ''}`} role="menuitem" onClick={() => pickLang(l.code)}>
                      <span className="lang-flag">{l.flag}</span>
                      <span>{t(l.key)}</span>
                    </button>
                  ))}
              </div>
            </div>

            <Link href="/contact" className="btn btn--accent">{t('nav.contact')}</Link>
          </div>

          <button className={`menu-toggle${mobileOpen ? ' is-open' : ''}`} aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav is-open">
          <div className="mobile-nav-inner">
            {navLinks.map((l) => {
              if (l.href === '/products') {
                return (
                  <div key={l.href}>
                    <button
                      className={`nav-link${isActive(l.href) ? ' is-active' : ''}`}
                      onClick={() => setMobileProductsOpen(v => !v)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                    >
                      {t(l.key)}
                      <span style={{ fontSize: '12px' }}>{mobileProductsOpen ? '\u2212' : '+'}</span>
                    </button>
                    {mobileProductsOpen && (
                      <div style={{ paddingLeft: '16px' }}>
                        {productCategories.map((cat) => (
                          <Link key={cat.href} href={cat.href} className="nav-link" style={{ display: 'block', fontSize: '13px', opacity: '0.8' }} onClick={() => { setMobileOpen(false); setMobileProductsOpen(false) }}>
                            {t(cat.labelKey)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link key={l.href} href={l.href} className={`nav-link${isActive(l.href) ? ' is-active' : ''}`} onClick={() => setMobileOpen(false)}>
                  {t(l.key)}
                </Link>
              )
            })}
            <div className="mobile-lang-grid">
              {langs.map((l) => (
                <button key={l.code} className={`lang-option${locale === l.code ? ' is-active' : ''}`} onClick={() => pickLang(l.code)}>
                  <span className="lang-flag">{l.flag}</span>
                  <span>{t(l.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
