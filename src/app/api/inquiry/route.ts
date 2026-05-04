import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface InquiryItem {
  serviceItemId: string
  productName: string
  productSpec?: string
  quantity: number
  expectedPrice?: number
  expectedUnit?: string
}

interface InquiryData {
  customerName: string
  customerCompany?: string
  customerPhone?: string
  customerEmail?: string
  shippingAddress?: string
  customerNote?: string
  items: InquiryItem[]
}

function generateOrderNumber(): string {
  const now = new Date()
  const prefix = 'INQ'
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${dateStr}-${random}`
}

export async function POST(request: Request) {
  try {
    const data: InquiryData = await request.json()

    if (!data.customerName || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '缺少必要信息' },
        { status: 400 }
      )
    }

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerCompany: data.customerCompany || null,
        customerPhone: data.customerPhone || null,
        customerEmail: data.customerEmail || null,
        shippingAddress: data.shippingAddress || null,
        customerNote: data.customerNote || null,
        status: 'PENDING',
        currency: 'USD',
        items: {
          create: data.items.map((item) => ({
            productName: item.productName,
            productSpec: item.productSpec || null,
            quantity: item.quantity,
            expectedPrice: item.expectedPrice ? String(item.expectedPrice) : null,
            expectedUnit: item.expectedUnit || null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Create inquiry error:', error)
    return NextResponse.json(
      { error: '提交询盘失败，请稍后重试' },
      { status: 500 }
    )
  }
}
