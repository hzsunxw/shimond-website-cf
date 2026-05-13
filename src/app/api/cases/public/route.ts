import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getLocalizedValue(item: Record<string, any>, locale: string, field: string): string | null | undefined {
  if (locale === 'zh') return item[field]
  const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
  const value = item[langField]
  if (value !== null && value !== undefined && value !== '') return value as string
  return item[field]
}

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
        titleEs: true,
        titleAr: true,
        slug: true,
        clientName: true,
        coverImage: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        summaryAr: true,
      },
    })
    
    const localized = cases.map((item: any) => ({
      ...item,
      title: getLocalizedValue(item, locale, 'title') || item.title,
      summary: getLocalizedValue(item, locale, 'summary') || item.summary,
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
