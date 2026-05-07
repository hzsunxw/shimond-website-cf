import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取指定语言的 SEO 配置
export async function GET(
  request: Request,
  { params }: { params: { lang: string } }
) {
  try {
    const config = await prisma.siteSeoConfig.findUnique({
      where: { languageCode: params.lang },
    })

    if (!config) {
      return NextResponse.json(
        { error: '未找到该语言的 SEO 配置' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Get site SEO config error:', error)
    return NextResponse.json(
      { error: '获取 SEO 配置失败' },
      { status: 500 }
    )
  }
}
