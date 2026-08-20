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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const locale = (request.headers.get('x-locale') as string) || 'en'
    
    const product = await prisma.serviceItem.findUnique({
      where: { slug: slug, status: 'ACTIVE' },
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    const localized = {
      ...product,
      title: getLocalizedValue(product, locale, 'title') || product.title,
      summary: getLocalizedValue(product, locale, 'summary') || product.summary,
      description: getLocalizedValue(product, locale, 'description') || product.description,
      seoTitle: getLocalizedValue(product, locale, 'seoTitle') || product.seoTitle,
      seoDescription: getLocalizedValue(product, locale, 'seoDescription') || product.seoDescription,
      seoKeywords: getLocalizedValue(product, locale, 'seoKeywords') || product.seoKeywords,
    }
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public product error:', error)
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    )
  }
}
