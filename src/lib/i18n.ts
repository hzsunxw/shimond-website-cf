// Client-side locale helper
export function getLocale(): string {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/locale=([^;]+)/)
  return match ? match[1].trim() : 'en'
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
