// CSS is loaded via <link> in src/app/(site)/layout.tsx (not imported here)
import Header from './Header'
import { getTranslation } from '@/lib/dictionary'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
  locale: string
  siteName?: string
  companyName?: string
  address?: string | null
  phone?: string | null
  email?: string | null
  socialLinks?: Record<string, string> | null
}

export default function Layout({
  children,
  locale,
  siteName = 'Shimond',
  companyName = 'Anhui Shimond New Material Technology Co., Ltd.',
  address,
  phone,
  email,
  socialLinks,
}: LayoutProps) {
  const t = (k: string) => getTranslation(locale, k)
  const year = new Date().getFullYear()

  const socialEntries = socialLinks
    ? Object.entries(socialLinks).filter(([, v]) => v && String(v).trim())
    : []

  return (
    <>
      <Header locale={locale} siteName={siteName} />
      <main>{children}</main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="logo logo--light">
                <span className="logo-mark">S</span>
                <span className="logo-text">{siteName}</span>
              </Link>
              <p className="footer-desc">{t('footer.companyDesc')}</p>
              <div className="footer-social">
                {socialEntries.map(([key]) => (
                  <a key={key} href={socialLinks![key]} target="_blank" rel="noopener noreferrer" aria-label={key}>
                    {key === 'tiktok' && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 6.3a4.8 4.8 0 0 1-3.8-4.3h-3.2v13.6a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6.1.9.2v-3.3a6.1 6.1 0 1 0 5.1 6V9.2a8 8 0 0 0 4.7 1.5V7.4c0-.4 0-.7-.1-1.1z" /></svg>}
                    {key === 'facebook' && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" /></svg>}
                    {key === 'instagram' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>}
                    {key === 'linkedin' && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.3a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM19 19h-3v-4.7c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.5V19h-3v-9h2.9v1.2a3.1 3.1 0 0 1 2.8-1.5c3 0 3.5 2 3.5 4.5V19z" /></svg>}
                    {key === 'whatsapp' && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.6.1-.2 0-.3 0-.5s-.7-1.6-1-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.3 3.5 5.5 4.9 2 .9 2.8 1 3.8.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" /><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.3 8.3 0 1 1 12 20.3z" /></svg>}
                  </a>
                ))}
              </div>
            </div>

            <div className="footer-col">
              <h4>{t('footer.products')}</h4>
              <ul>
                <li><Link href="/products">{t('footer.product.pvcLeather')}</Link></li>
                <li><Link href="/products">{t('footer.product.pvcMats')}</Link></li>
                <li><Link href="/products">{t('footer.product.tableProtector')}</Link></li>
                <li><Link href="/contact">{t('footer.customOrders')}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t('footer.links')}</h4>
              <ul>
                <li><Link href="/">{t('nav.home')}</Link></li>
                <li><Link href="/products">{t('nav.products')}</Link></li>
                <li><Link href="/cases">{t('nav.cases')}</Link></li>
<li><Link href="/news">{t('nav.news')}</Link></li>
  <li><Link href="/shipping-policy">{t('shippingPolicy')}</Link></li>
  <li><Link href="/contact">{t('nav.contact')}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t('footer.contact')}</h4>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{address || t('contact.address')}</span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span>{phone || t('contact.phone')}</span>
              </div>
              <div className="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
                <span>{email || t('contact.email')}</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {year} {companyName}. {t('footer.copyright')}</span>
            <span className="footer-version">ver6 / Light Modern Industrial</span>
          </div>
        </div>
      </footer>
    </>
  )
}
