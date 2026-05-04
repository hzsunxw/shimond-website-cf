import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 保护后台路由
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Add locale header for API routes
  const response = NextResponse.next()
  const locale = request.cookies.get('locale')?.value || 'zh'
  response.headers.set('x-locale', locale)

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
