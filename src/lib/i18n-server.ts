'use server'

import { headers } from 'next/headers'
import { parseAcceptLanguage } from './locale-utils'

export async function getServerLocale(): Promise<string> {
  try {
    const h = await headers()

    // 1. 优先使用用户主动选择的语言（cookie）
    const cookie = h.get('cookie') || ''
    const cookieMatch = cookie.match(/(?:^|;\s*)locale=([^;]+)/)
    if (cookieMatch) return cookieMatch[1].trim()

    // 2. 根据浏览器 Accept-Language 头自动检测
    const acceptLanguage = h.get('accept-language') || ''
    const detected = parseAcceptLanguage(acceptLanguage)
    if (detected) return detected

    // 3. 兜底默认英文
    return 'en'
  } catch {
    return 'en'
  }
}
