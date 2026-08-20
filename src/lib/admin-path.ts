/**
 * Admin path helper.
 * Set NEXT_PUBLIC_ADMIN_PATH in .env to a random string (e.g. a8x9k2m).
 * If not set, falls back to /admin for local dev.
 */
const raw = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'
export const ADMIN_PATH = raw.startsWith('/') ? raw : `/${raw}`

/** Build an admin route. e.g. adminRoute('/products') -> '/a8x9k2m/products' */
export function adminRoute(path = '') {
  const base = ADMIN_PATH.replace(/\/$/, '')
  const suffix = path.replace(/^\//, '')
  return suffix ? `${base}/${suffix}` : base
}
