import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取站点配置
export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst()
    
    // 如果没有配置，创建默认配置
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          id: 'default',
          companyName: 'Shimond',
          companyNameEn: 'Shimond Industry',
          siteTitle: 'Shimond - Professional PVC Products',
          siteDescription: 'Professional manufacturer of high-quality PVC products',
          primaryColor: '#0ea5e9',
          secondaryColor: '#f59e0b',
          accentColor: '#10b981',
          defaultLanguage: 'zh',
          phone: '+86 571 8273 8888',
          email: 'info@shimond.com',
          address: 'No. 1688 Xingye Road, Xiaoshan District, Hangzhou, China',
          socialLinks: {
            tiktok: 'https://www.tiktok.com/@shimondpvc',
            facebook: 'https://www.facebook.com/shimondpvc',
            instagram: 'https://www.instagram.com/shimondpvc',
            linkedin: 'https://www.linkedin.com/company/shimond',
            whatsapp: 'https://wa.me/8657182738888',
          },
        },
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Get site config error:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

// 更新站点配置
export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          id: 'default',
          ...data,
        },
      })
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data,
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Update site config error:', error)
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    )
  }
}
