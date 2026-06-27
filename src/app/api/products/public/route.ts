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
    const locale = (request.headers.get('x-locale') as string) || 'en'
    
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleEs: true,
        titleAr: true,
        slug: true,
        summary: true,
        summaryEn: true,
        summaryEs: true,
        summaryAr: true,
        coverImage: true,
        price: true,
        priceUnit: true,
        priceCurrency: true,
        priceStrategy: true,
      },
    })
    
    const localized = products.map((product: any) => ({
      ...product,
      title: getLocalizedValue(product, locale, 'title') || product.title,
      summary: getLocalizedValue(product, locale, 'summary') || product.summary,
    }))
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public products error:', error)
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    )
  }
}
