import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      total: languages.length,
      languages: languages.map((l: any) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        icon: l.icon || null,
        isRtl: l.isRtl,
        isActive: l.isActive,
        sortOrder: l.sortOrder,
      })),
    })
  } catch (error) {
    console.error('Debug languages error:', error)
    return NextResponse.json(
      { error: '查询语言数据失败' },
      { status: 500 }
    )
  }
}
