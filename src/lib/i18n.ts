import { matchLocale } from './locale-utils'

// Client-side locale helper
export function getLocale(): string {
  // 1. 优先使用用户主动选择的语言（cookie）
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/locale=([^;]+)/)
    if (match) return match[1].trim()
  }

  // 2. 根据浏览器 navigator.language 自动检测
  if (typeof navigator !== 'undefined') {
    const detected = matchLocale(navigator.language)
    if (detected) return detected
  }

  // 3. 兜底默认英文
  return 'en'
}

export function setLocale(locale: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `locale=${locale};path=/;max-age=31536000`
    window.location.reload()
  }
}

// Helper to pick localized field
export function localize(
  item: Record<string, any>,
  locale: string,
  fieldMap: Record<string, string>
): Record<string, any> {
  if (locale === 'zh') return item
  const result = { ...item }
  for (const [zhField, enField] of Object.entries(fieldMap)) {
    const enValue = item[enField]
    if (enValue !== null && enValue !== undefined && enValue !== '') {
      result[zhField] = enValue
    }
  }
  return result
}

/**
 * 从多语言数据对象中读取当前语言对应的字段值。
 * 规则：如果 locale 不是 zh，优先取 `${field}${Locale}` 字段；
 * 若该字段为空/不存在，则回退到默认的 `${field}`（中文）。
 */
export function getLocalizedValue<T extends Record<string, any>>(
  item: T,
  locale: string,
  field: string
): string | null | undefined {
  if (locale === 'zh') return item[field]
  const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
  const value = item[langField]
  if (value !== null && value !== undefined && value !== '') return value as string
  return item[field]
}

/**
 * 从多语言数据对象中读取当前语言对应的数组字段值。
 * 用于 tags 等 String[] 字段。
 */
export function getLocalizedArray<T extends Record<string, any>>(
  item: T,
  locale: string,
  field: string
): any[] | undefined {
  if (locale === 'zh') return item[field]
  const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
  const value = item[langField]
  if (Array.isArray(value) && value.length > 0) return value
  return item[field]
}
