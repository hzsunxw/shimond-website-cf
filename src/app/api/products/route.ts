import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有产品（管理用）
export async function GET() {
  try {
    const products = await prisma.serviceItem.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: '获取产品失败' },
      { status: 500 }
    )
  }
}

// 创建产品
export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: '标题和 Slug 不能为空' },
        { status: 400 }
      )
    }

    const product = await prisma.serviceItem.create({
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        coverImage: data.coverImage || null,
        gallery: data.gallery || [],
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        price: data.price ? String(data.price) : null,
        priceUnit: data.priceUnit || null,
        priceCurrency: data.priceCurrency || 'USD',
        priceStrategy: data.priceStrategy || 'CONTACT',
        sortOrder: data.sortOrder || 0,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        ogImage: data.ogImage || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: '创建产品失败' },
      { status: 500 }
    )
  }
}

// 更新产品
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: '缺少产品 ID' },
        { status: 400 }
      )
    }

    const product = await prisma.serviceItem.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        titleEn: data.titleEn || null,
        summary: data.summary || null,
        summaryEn: data.summaryEn || null,
        coverImage: data.coverImage || null,
        gallery: data.gallery || [],
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        price: data.price ? String(data.price) : null,
        priceUnit: data.priceUnit || null,
        priceCurrency: data.priceCurrency || 'USD',
        priceStrategy: data.priceStrategy || 'CONTACT',
        sortOrder: data.sortOrder || 0,
        status: data.status || 'ACTIVE',
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        ogImage: data.ogImage || null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: '更新产品失败' },
      { status: 500 }
    )
  }
}

// 删除产品
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少产品 ID' },
        { status: 400 }
      )
    }

    await prisma.serviceItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: '删除产品失败' },
      { status: 500 }
    )
  }
}
