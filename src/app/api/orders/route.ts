import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取订单列表
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            productSpec: true,
            quantity: true,
            expectedPrice: true,
            expectedUnit: true,
          },
        },
      },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: '获取订单失败' },
      { status: 500 }
    )
  }
}

// 更新订单状态
export async function PATCH(request: Request) {
  try {
    const data = await request.json()

    if (!data.id || !data.status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: data.id },
      data: {
        status: data.status,
        adminNote: data.adminNote || undefined,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: '更新订单失败' },
      { status: 500 }
    )
  }
}
