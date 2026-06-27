'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Globe, Menu, X, ChevronDown, ShoppingCart } from 'lucide-react'
import { setLocale } from '@/lib/i18n'
import { useLocale } from '@/components/LocaleProvider'

interface NavPage {
  slug: string
  name: string
  nameEn: string | null
  pageType: string
}

interface HeaderProps {
  siteName?: string
  pages?: NavPage[]
}

const translations = {
  zh: {
    home: '首页',
    about: '关于我们',
    products: '产品',
    cases: '案例',
    news: '新闻',
    contact: '联系我们',
    inquiry: '询盘清单',
    langLabel: '中文',
  },
  en: {
    home: 'Home',
    about: 'About Us',
    products: 'Products',
    cases: 'Cases',
    news: 'News',
    contact: 'Contact Us',
    inquiry: 'Inquiry List',
    langLabel: 'English',
  },
  es: {
    home: 'Inicio',
    about: 'Sobre Nosotros',
    products: 'Productos',
    cases: 'Casos',
    news: 'Noticias',
    contact: 'Contáctenos',
    inquiry: 'Lista de Consultas',
    langLabel: 'Español',
  },
  ar: {
    home: 'الرئيسية',
    about: 'من نحن',
    products: 'المنتجات',
    cases: 'الحالات',
    news: 'الأخبار',
    contact: 'اتصل بنا',
    inquiry: 'قائمة الاستفسارات',
    langLabel: 'العربية',
  },
}

export default function SiteHeader({ siteName = 'Shimond', pages = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const locale = useLocale()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const t = translations[locale as keyof typeof translations] || translations.zh

  const defaultNav: NavPage[] = [
    { slug: '', name: t.home, nameEn: 'Home', pageType: 'home' },
    { slug: 'products', name: t.products, nameEn: 'Products', pageType: 'products' },
    { slug: 'cases', name: t.cases, nameEn: 'Cases', pageType: 'cases' },
    { slug: 'news', name: t.news, nameEn: 'News', pageType: 'news' },
  ]

  const navPages = pages.length > 0
    ? pages.map(p => {
        const fallbackNames: Record<string, string> = {
          home: t.home,
          about: t.about,
          products: t.products,
          cases: t.cases,
          news: t.news,
          contact: t.contact,
        }
        return {
          ...p,
          name: locale !== 'zh' ? (fallbackNames[p.pageType] || p.nameEn || p.name) : p.name,
        }
      })
    : defaultNav

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="relative text-gray-700 hover:text-sky-500 font-medium transition-colors py-2 group"
              >
                {page.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/inquiry"
              className="relative text-gray-700 hover:text-sky-500 transition-colors p-2"
              title="询盘清单"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-sky-500 transition-colors px-4 py-2 rounded-lg border border-gray-200 hover:border-sky-500"
              >
                <Globe className="w-5 h-5" />
                <span>{t.langLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <button
                    onClick={() => { setLangDropdownOpen(false); setLocale('zh') }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 ${locale === 'zh' ? 'bg-sky-50 text-sky-600' : ''}`}
                  >
                    <span className="text-2xl">🇨🇳</span>
                    <span>中文</span>
                  </button>
                  <button
                    onClick={() => { setLangDropdownOpen(false); setLocale('en') }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 ${locale === 'en' ? 'bg-sky-50 text-sky-600' : ''}`}
                  >
                    <span className="text-2xl">🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => { setLangDropdownOpen(false); setLocale('es') }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 ${locale === 'es' ? 'bg-sky-50 text-sky-600' : ''}`}
                  >
                    <span className="text-2xl">🇪🇸</span>
                    <span>Español</span>
                  </button>
                  <button
                    onClick={() => { setLangDropdownOpen(false); setLocale('ar') }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 ${locale === 'ar' ? 'bg-sky-50 text-sky-600' : ''}`}
                  >
                    <span className="text-2xl">🇸🇦</span>
                    <span>العربية</span>
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/about#contact"
              className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-sky-500/30 transition-all transform hover:scale-105"
            >
              {t.contact}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-sky-500 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-sky-500 font-medium py-2"
              >
                {page.name}
              </Link>
            ))}
            <Link
              href="/inquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-gray-700 hover:text-sky-500 font-medium py-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t.inquiry}</span>
            </Link>

            {/* Mobile Language Switcher */}
            <div className="border-t border-gray-100 pt-3 mt-3">
              <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
                <Globe className="w-4 h-4" />
                <span>{t.langLabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'zh', label: '中文', flag: '🇨🇳' },
                  { code: 'en', label: 'English', flag: '🇺🇸' },
                  { code: 'es', label: 'Español', flag: '🇪🇸' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLocale(lang.code); setMobileMenuOpen(false) }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      locale === lang.code
                        ? 'bg-sky-50 text-sky-600 border border-sky-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
