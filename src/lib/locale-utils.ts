// 支持的语言列表
export const SUPPORTED_LOCALES = ['zh', 'en', 'es', 'ar'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/**
 * 将浏览器语言标记映射到支持的 locale 代码
 * 例如: "zh-CN" → "zh", "en-US" → "en", "es-ES" → "es"
 * 如果无法匹配则返回 null
 */
export function matchLocale(lang: string): string | null {
  const base = lang.split(/[-_]/)[0].toLowerCase()
  if (SUPPORTED_LOCALES.includes(base as Locale)) return base
  return null
}

/**
 * 解析 Accept-Language 请求头，返回第一个匹配支持语言的 locale
 * 例如: "zh-CN,zh;q=0.9,en;q=0.8" → "zh"
 * 例如: "fr-FR,fr;q=0.9,en;q=0.8" → "en"
 * 无匹配时返回 null
 */
export function parseAcceptLanguage(acceptLanguage: string): string | null {
  const tags = acceptLanguage.split(',')
  for (const tag of tags) {
    const [langTag] = tag.trim().split(';')
    const matched = matchLocale(langTag)
    if (matched) return matched
  }
  return null
}
