import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerLocale } from '@/lib/i18n-server'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nimbus Site CMS',
  description: 'Enterprise Website Management System',
}

const LOCALE_TO_LANG: Record<string, string> = {
  zh: 'zh-CN',
  en: 'en',
  es: 'es',
  ar: 'ar',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getServerLocale()
  const lang = LOCALE_TO_LANG[locale] || 'en'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={lang} dir={dir}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
