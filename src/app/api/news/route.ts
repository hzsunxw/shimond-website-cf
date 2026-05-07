import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有新闻（管理用）
export async function GET() {
  try {
    const news = await prisma.newsItem.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error('Get news error:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}

// 创建新闻
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const news = await prisma.newsItem.create({
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        titleEs: data.titleEs || null,
        titleAr: data.titleAr || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        summaryEs: data.summaryEs || null,
        summaryAr: data.summaryAr || null,
        coverImage: data.coverImage || null,
        content: data.content || null,
        contentEn: data.contentEn || null,
        contentEs: data.contentEs || null,
        contentAr: data.contentAr || null,
        author: data.author || null,
        tags: data.tags || [],
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        seoTitleEn: data.seoTitleEn || null,
        seoDescriptionEn: data.seoDescriptionEn || null,
        seoKeywordsEn: data.seoKeywordsEn || null,
        seoTitleEs: data.seoTitleEs || null,
        seoDescriptionEs: data.seoDescriptionEs || null,
        seoKeywordsEs: data.seoKeywordsEs || null,
        seoTitleAr: data.seoTitleAr || null,
        seoDescriptionAr: data.seoDescriptionAr || null,
        seoKeywordsAr: data.seoKeywordsAr || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
        schemaOrg: data.schemaOrg || undefined,
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Create news error:', error)
    return NextResponse.json(
      { error: '创建新闻失败' },
      { status: 500 }
    )
  }
}

// 更新新闻
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: '缺少新闻 ID' },
        { status: 400 }
      )
    }

    const news = await prisma.newsItem.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        titleEs: data.titleEs || null,
        titleAr: data.titleAr || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        summaryEs: data.summaryEs || null,
        summaryAr: data.summaryAr || null,
        coverImage: data.coverImage || null,
        content: data.content || null,
        contentEn: data.contentEn || null,
        contentEs: data.contentEs || null,
        contentAr: data.contentAr || null,
        author: data.author || null,
        tags: data.tags || [],
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        seoTitleEn: data.seoTitleEn || null,
        seoDescriptionEn: data.seoDescriptionEn || null,
        seoKeywordsEn: data.seoKeywordsEn || null,
        seoTitleEs: data.seoTitleEs || null,
        seoDescriptionEs: data.seoDescriptionEs || null,
        seoKeywordsEs: data.seoKeywordsEs || null,
        seoTitleAr: data.seoTitleAr || null,
        seoDescriptionAr: data.seoDescriptionAr || null,
        seoKeywordsAr: data.seoKeywordsAr || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
        schemaOrg: data.schemaOrg || undefined,
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Update news error:', error)
    return NextResponse.json(
      { error: '更新新闻失败' },
      { status: 500 }
    )
  }
}

// 删除新闻
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少新闻 ID' },
        { status: 400 }
      )
    }

    await prisma.newsItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete news error:', error)
    return NextResponse.json(
      { error: '删除新闻失败' },
      { status: 500 }
    )
  }
}
