'use client'

import { getTranslation, translations } from '@/lib/dictionary'
import { useLocale } from '@/components/LocaleProvider'

export { getTranslation, translations }

export function useTranslations() {
  const locale = useLocale()
  
  return function t(key: string) {
    return getTranslation(locale, key)
  }
}
