import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const locale = (request.headers.get('x-locale') as string) || 'zh'
    
    const cases = await prisma.caseItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        clientName: true,
        coverImage: true,
        summary: true,
        summaryEn: true,
      },
    })
    
    const localized = cases.map((item: any) => ({
      ...item,
      title: locale === 'en' && item.titleEn ? item.titleEn : item.title,
      summary: locale === 'en' && item.summaryEn ? item.summaryEn : item.summary,
    }))
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public cases error:', error)
    return NextResponse.json(
      { error: 'Failed to get cases' },
      { status: 500 }
    )
  }
}
