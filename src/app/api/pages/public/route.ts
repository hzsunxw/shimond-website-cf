import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const locale = (request.headers.get('x-locale') as string) || 'zh'
    
    const pages = await prisma.page.findMany({
      where: { status: 'ACTIVE', showInNav: true },
      orderBy: { navSort: 'asc' },
      select: {
        id: true,
        pageType: true,
        name: true,
        nameEn: true,
        slug: true,
        navSort: true,
      },
    })
    
    const localized = pages.map((page: any) => ({
      ...page,
      name: locale === 'en' && page.nameEn ? page.nameEn : page.name,
    }))
    
    return NextResponse.json(localized)
  } catch (error) {
    console.error('Get public pages error:', error)
    return NextResponse.json(
      { error: 'Failed to get pages' },
      { status: 500 }
    )
  }
}
