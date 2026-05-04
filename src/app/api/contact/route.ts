import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: '姓名、邮箱和留言内容不能为空' },
        { status: 400 }
      )
    }

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company || null,
        product: data.product || null,
        message: data.message,
      },
    })

    return NextResponse.json({ success: true, id: message.id })
  } catch (error) {
    console.error('Save contact message error:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get contact messages error:', error)
    return NextResponse.json(
      { error: '获取留言失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: '缺少留言 ID' },
        { status: 400 }
      )
    }

    const message = await prisma.contactMessage.update({
      where: { id: data.id },
      data: {
        isRead: data.isRead ?? undefined,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Update contact message error:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少留言 ID' },
        { status: 400 }
      )
    }

    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete contact message error:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}
