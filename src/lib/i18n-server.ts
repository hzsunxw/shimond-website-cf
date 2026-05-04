'use server'

import { headers } from 'next/headers'

export async function getServerLocale(): Promise<string> {
  try {
    const h = await headers()
    const cookie = h.get('cookie') || ''
    const match = cookie.match(/locale=([^;]+)/)
    return match ? match[1].trim() : 'zh'
  } catch {
    return 'zh'
  }
}
