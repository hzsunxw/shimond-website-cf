import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 创建默认管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      nickname: '管理员',
      password: adminPassword,
      status: 'ACTIVE',
    },
  })
  console.log('✅ Admin user created:', admin.username)

  // 创建默认语言
  const languages = [
    { code: 'zh', name: '中文', icon: '🇨🇳', isRtl: false, sortOrder: 1 },
    { code: 'en', name: 'English', icon: '🇺🇸', isRtl: false, sortOrder: 2 },
    { code: 'es', name: 'Español', icon: '🇪🇸', isRtl: false, sortOrder: 3 },
    { code: 'ar', name: 'العربية', icon: '🇸🇦', isRtl: true, sortOrder: 4 },
  ]

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    })
  }
  console.log('✅ Languages created:', languages.length)

  // 创建默认页面
  const pages = [
    { pageType: 'home', name: '首页', nameEn: 'Home', slug: 'home', navSort: 1 },
    { pageType: 'about', name: '关于我们', nameEn: 'About Us', slug: 'about', navSort: 2 },
    { pageType: 'products', name: '产品服务', nameEn: 'Products', slug: 'products', navSort: 3 },
    { pageType: 'cases', name: '案例展示', nameEn: 'Cases', slug: 'cases', navSort: 4 },
    { pageType: 'news', name: '新闻动态', nameEn: 'News', slug: 'news', navSort: 5 },
    { pageType: 'contact', name: '联系我们', nameEn: 'Contact Us', slug: 'contact', navSort: 6 },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
  }
  console.log('✅ Pages created:', pages.length)

  // 创建默认站点配置
  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {
      defaultLanguage: 'en',
      companyNameEs: 'Shimond Industria',
      companyNameAr: 'شيموند',
    },
    create: {
      id: 'default',
      companyName: 'Shimond',
      companyNameEn: 'Shimond Industry',
      companyNameEs: 'Shimond Industria',
      companyNameAr: 'شيموند',
      siteTitle: 'Shimond - Professional PVC Products',
      siteDescription: 'Professional manufacturer of high-quality PVC products',
      primaryColor: '#0ea5e9',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
      defaultLanguage: 'en',
      phone: '+86 571 88837923',
      email: 'shimond06@shimond.net',
      address: 'Building 22, New Material Industrial Park, Wanjiangnan Concentrated Area, Chizhou, Anhui, China',
      socialLinks: {
        tiktok: 'https://www.tiktok.com/@shimondpvc',
        facebook: 'https://www.facebook.com/shimondpvc',
        instagram: 'https://www.instagram.com/shimondpvc',
        linkedin: 'https://www.linkedin.com/company/shimond',
        whatsapp: 'https://wa.me/8618072976280',
      },
    },
  })
  console.log('✅ Site config created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
