'use client'

import Link from 'next/link'
import { Video, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import { useTranslations } from '@/lib/translations'

interface FooterProps {
  siteName?: string
  companyName?: string
  address?: string | null
  phone?: string | null
  email?: string | null
  socialLinks?: Record<string, string> | null
}

export default function SiteFooter({
  siteName = 'Shimond',
  companyName = 'Shimond Industry Co., Ltd.',
  address = 'No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China',
  phone = '+86 571 8273 8888',
  email = 'info@shimond.com',
  socialLinks,
}: FooterProps) {
  const t = useTranslations()
  
  const socialIcons: Record<string, React.ReactNode> = {
    tiktok: <Video className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
  }

  const socialColors: Record<string, string> = {
    tiktok: 'hover:bg-black',
    facebook: 'hover:bg-blue-600',
    instagram: 'hover:bg-pink-600',
    linkedin: 'hover:bg-blue-700',
    whatsapp: 'hover:bg-green-500',
  }

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold">{siteName}</span>
            </div>
            <p className="text-gray-400 mb-6">
              {t('footer.companyDesc')}
            </p>
            <div className="flex space-x-3">
              {socialLinks &&
                Object.entries(socialLinks)
                  .filter(([, url]) => url && String(url).trim())
                  .map(([key, url]) => (
                    <a
                      key={key}
                      href={String(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors ${
                        socialColors[key] || 'hover:bg-sky-500'
                      }`}
                    >
                      {socialIcons[key] || <span className="text-xs">{key[0].toUpperCase()}</span>}
                    </a>
                  ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-bold mb-6">{t('products')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  {t('product.pvcLeather')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  {t('product.pvcMats')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  {t('product.tableProtector')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.customOrders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">{t('links')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-gray-400 hover:text-white transition-colors">
                  {t('cases')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                  {t('news')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">{t('contact')}</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start space-x-3">
                <span className="text-sky-500 mt-0.5">📍</span>
                <span>{address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-sky-500">📞</span>
                <span>{phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-sky-500">✉️</span>
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
