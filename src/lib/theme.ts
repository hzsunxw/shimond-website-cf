/**
 * Theme configuration — reads ACTIVE_THEME from environment variable.
 * Supported values: "default" | "ver3" | "ver4"
 * 
 * Set in .env: ACTIVE_THEME=ver4
 * Restart dev server after changing.
 */

export type ThemeName = 'default' | 'ver3' | 'ver4'

export function getTheme(): ThemeName {
  const t = process.env.ACTIVE_THEME || 'default'
  if (t === 'ver3' || t === 'ver4') return t
  return 'default'
}

export function isDefaultTheme(): boolean {
  return getTheme() === 'default'
}

export function isVer4Theme(): boolean {
  return getTheme() === 'ver4'
}

export function isVer3Theme(): boolean {
  return getTheme() === 'ver3'
}
