import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const locale = (request.headers.get('x-locale') as string) || 'zh'
    
    const products = await prisma.serviceItem.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        summary: true,
        summaryEn: true,
        coverImage: true,
        price: true,
        priceUnit: true,
        priceCurrency: true,
        priceStrategy: true,
      },
    })
    
    // Localize fields based on locale
    const localized = products.map((product: any) => ({
      ...product,
      title: locale === 'en' && product.titleEn ? product.titleEn : product.title,
      summary: locale === 'en' && product.summaryEn ? product.summaryEn : product.summary,
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
