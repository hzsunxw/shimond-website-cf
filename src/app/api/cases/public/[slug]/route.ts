import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const caseItem = await prisma.caseItem.findUnique({
      where: { slug: params.slug, status: 'ACTIVE' },
    })
    
    if (!caseItem) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(caseItem)
  } catch (error) {
    console.error('Get public case error:', error)
    return NextResponse.json(
      { error: 'Failed to get case' },
      { status: 500 }
    )
  }
}
