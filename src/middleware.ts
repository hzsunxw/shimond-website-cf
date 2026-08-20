import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { parseAcceptLanguage } from '@/lib/locale-utils'

const ADMIN_PATH = ('/' + (process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin')).replace(/\/+$/, '')
const LOGIN_PATH = `${ADMIN_PATH}/login`

function detectLocale(request: NextRequest): string {
  // 1. 优先使用用户主动选择的语言（cookie）
  const cookie = request.cookies.get('locale')?.value
  if (cookie) return cookie

  // 2. 根据浏览器 Accept-Language 头自动检测
  const acceptLanguage = request.headers.get('accept-language') || ''
  const detected = parseAcceptLanguage(acceptLanguage)
  if (detected) return detected

  // 3. 兜底默认英文
  return 'en'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security: block direct access to internal /admin paths when custom path is used
  if (ADMIN_PATH !== '/admin' && pathname.startsWith('/admin')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Protect admin routes
  if (pathname.startsWith(ADMIN_PATH) && pathname !== LOGIN_PATH) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }
  }

  // 已登录用户访问登录页，重定向到后台首页
  if (pathname === LOGIN_PATH) {
    const token = request.cookies.get('admin-token')?.value
    if (token) {
      return NextResponse.redirect(new URL(ADMIN_PATH, request.url))
    }
  }

  // Add locale header for API routes
  const response = NextResponse.next()
  const locale = detectLocale(request)
  response.headers.set('x-locale', locale)

  return response
}
