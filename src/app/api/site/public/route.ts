import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      return NextResponse.json(
        { error: 'Site config not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Get public site config error:', error)
    return NextResponse.json(
      { error: 'Failed to get site config' },
      { status: 500 }
    )
  }
}
