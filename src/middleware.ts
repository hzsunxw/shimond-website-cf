import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin').replace(/\/$/, '')
const LOGIN_PATH = `${ADMIN_PATH}/login`

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

  // Add locale header for API routes
  const response = NextResponse.next()
  const locale = request.cookies.get('locale')?.value || 'zh'
  response.headers.set('x-locale', locale)

  return response
}

export const config = {
  matcher: ['/admin/:path*', `${ADMIN_PATH}/:path*`],
}
