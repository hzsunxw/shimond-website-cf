import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const newsItem = await prisma.newsItem.findUnique({
      where: { slug: params.slug, status: 'ACTIVE' },
    })
    
    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(newsItem)
  } catch (error) {
    console.error('Get public news item error:', error)
    return NextResponse.json(
      { error: 'Failed to get news item' },
      { status: 500 }
    )
  }
}
