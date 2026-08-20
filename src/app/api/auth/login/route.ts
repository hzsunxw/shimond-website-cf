import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crypto'
import { SignJWT } from 'jose'

export async function POST(request: Request) {
  console.log('🔍 [LOGIN] 收到 POST 请求');
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.adminUser.findUnique({
      where: { username },
    })

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码 (PBKDF2 via Web Crypto)
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 生成 JWT token
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'default-secret-change-me'
    )

    const token = await new SignJWT({
      sub: user.id,
      username: user.username,
      role: 'admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    // 返回 token
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    })

    // 设置 cookie（Secure 标志仅在使用 HTTPS 时开启，避免 HTTP 站点被浏览器静默拒绝）
    const isSecure = request.url.startsWith('https')
      || request.headers.get('x-forwarded-proto') === 'https'

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
