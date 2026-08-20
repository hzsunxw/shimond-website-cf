import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const page = await prisma.page.findUnique({
      where: { slug: slug, status: 'ACTIVE' },
      include: {
        modules: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(page)
  } catch (error) {
    console.error('Get public page error:', error)
    return NextResponse.json(
      { error: 'Failed to get page' },
      { status: 500 }
    )
  }
}
