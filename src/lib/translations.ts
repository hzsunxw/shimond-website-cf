'use client'

import { useState, useEffect } from 'react'
import { getTranslation, translations } from '@/lib/dictionary'

export { getTranslation, translations }

export function useTranslations() {
  const [locale, setLocale] = useState('zh')
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/locale=([^;]+)/)
      if (match) setLocale(match[1].trim())
    }
  }, [])
  
  return function t(key: string) {
    return getTranslation(locale, key)
  }
}
