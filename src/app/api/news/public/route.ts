import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const locale = (request.headers.get('x-locale') as string) || 'zh'
    
    const news = await prisma.newsItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { publishAt: 'desc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        summary: true,
        summaryEn: true,
        coverImage: true,
        author: true,
        tags: true,
        publishAt: true,
      },
    })
    
    const localized = news.map((item: any) => ({
      ...item,
      title: locale === 'en' && item.titleEn ? item.titleEn : item.title,
      summary: locale === 'en' && item.summaryEn ? item.summaryEn : item.summary,
    }))
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public news error:', error)
    return NextResponse.json(
      { error: 'Failed to get news' },
      { status: 500 }
    )
  }
}
