import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cases = await prisma.caseItem.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(cases)
  } catch (error) {
    console.error('Get cases error:', error)
    return NextResponse.json({ error: '获取案例失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.title || !data.slug) {
      return NextResponse.json({ error: '标题和 Slug 不能为空' }, { status: 400 })
    }

    const item = await prisma.caseItem.create({
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        clientName: data.clientName || null,
        coverImage: data.coverImage || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        sortOrder: data.sortOrder || 0,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        ogImage: data.ogImage || null,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Create case error:', error)
    return NextResponse.json({ error: '创建案例失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: '缺少案例 ID' }, { status: 400 })
    }

    const item = await prisma.caseItem.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        clientName: data.clientName || null,
        coverImage: data.coverImage || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        sortOrder: data.sortOrder || 0,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        ogImage: data.ogImage || null,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Update case error:', error)
    return NextResponse.json({ error: '更新案例失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少案例 ID' }, { status: 400 })
    }

    await prisma.caseItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete case error:', error)
    return NextResponse.json({ error: '删除案例失败' }, { status: 500 })
  }
}
