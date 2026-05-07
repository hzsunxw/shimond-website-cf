import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有语言的 SEO 配置
export async function GET() {
  try {
    const configs = await prisma.siteSeoConfig.findMany()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Get site SEO configs error:', error)
    return NextResponse.json(
      { error: '获取 SEO 配置失败' },
      { status: 500 }
    )
  }
}

// 批量更新 SEO 配置（按语言）
export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { languageCode, ...seoFields } = data

    if (!languageCode) {
      return NextResponse.json(
        { error: 'languageCode 是必需的' },
        { status: 400 }
      )
    }

    const config = await prisma.siteSeoConfig.upsert({
      where: { languageCode },
      update: seoFields,
      create: {
        languageCode,
        ...seoFields,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Update site SEO config error:', error)
    return NextResponse.json(
      { error: '更新 SEO 配置失败' },
      { status: 500 }
    )
  }
}
