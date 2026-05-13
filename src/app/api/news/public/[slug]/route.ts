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
    const locale = (request.headers.get('x-locale') as string) || 'zh'
    
    const newsItem = await prisma.newsItem.findUnique({
      where: { slug: params.slug, status: 'ACTIVE' },
    })
    
    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }
    
    const tagField = locale === 'zh' ? 'tags' : `tags${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
    const localized = {
      ...newsItem,
      title: getLocalizedValue(newsItem, locale, 'title') || newsItem.title,
      summary: getLocalizedValue(newsItem, locale, 'summary') || newsItem.summary,
      content: getLocalizedValue(newsItem, locale, 'content') || newsItem.content,
      tags: (newsItem as Record<string, any>)[tagField] || newsItem.tags,
      seoTitle: getLocalizedValue(newsItem, locale, 'seoTitle') || newsItem.seoTitle,
      seoDescription: getLocalizedValue(newsItem, locale, 'seoDescription') || newsItem.seoDescription,
      seoKeywords: getLocalizedValue(newsItem, locale, 'seoKeywords') || newsItem.seoKeywords,
    }
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public news item error:', error)
    return NextResponse.json(
      { error: 'Failed to get news item' },
      { status: 500 }
    )
  }
}
