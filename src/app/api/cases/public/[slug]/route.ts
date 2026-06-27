import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getLocalizedValue(item: Record<string, any>, locale: string, field: string): string | null | undefined {
  if (locale === 'zh') return item[field]
  const langField = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
  const value = item[langField]
  if (value !== null && value !== undefined && value !== '') return value as string
  return item[field]
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const locale = (request.headers.get('x-locale') as string) || 'en'
    
    const caseItem = await prisma.caseItem.findUnique({
      where: { slug: params.slug, status: 'ACTIVE' },
    })
    
    if (!caseItem) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    
    const localized = {
      ...caseItem,
      title: getLocalizedValue(caseItem, locale, 'title') || caseItem.title,
      summary: getLocalizedValue(caseItem, locale, 'summary') || caseItem.summary,
      description: getLocalizedValue(caseItem, locale, 'description') || caseItem.description,
      seoTitle: getLocalizedValue(caseItem, locale, 'seoTitle') || caseItem.seoTitle,
      seoDescription: getLocalizedValue(caseItem, locale, 'seoDescription') || caseItem.seoDescription,
      seoKeywords: getLocalizedValue(caseItem, locale, 'seoKeywords') || caseItem.seoKeywords,
    }
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public case error:', error)
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    )
  }
}
