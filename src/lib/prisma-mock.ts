// 开发模式：使用内存存储代替真实数据库
// 部署时切换为 Prisma + PostgreSQL

interface MockData {
  adminUsers: any[]
  siteConfig: any[]
  siteSeoConfigs: any[]
  pages: any[]
  pageModules: any[]
  serviceItems: any[]
  caseItems: any[]
  newsItems: any[]
  languages: any[]
  translations: any[]
  codeSnippets: any[]
  orders: any[]
  orderItems: any[]
}

class MockPrismaClient {
  private data: MockData = {
    adminUsers: [
      {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        password: '$2a$10$YourHashedPasswordHere',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    siteConfig: [
      {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    pages: [
      { id: '1', pageType: 'home', name: '首页', nameEn: 'Home', slug: 'home', status: 'ACTIVE', navSort: 1, showInNav: true },
      { id: '2', pageType: 'about', name: '关于我们', nameEn: 'About Us', slug: 'about', status: 'ACTIVE', navSort: 2, showInNav: true },
      { id: '3', pageType: 'products', name: '产品服务', nameEn: 'Products', slug: 'products', status: 'ACTIVE', navSort: 3, showInNav: true },
      { id: '4', pageType: 'cases', name: '案例展示', nameEn: 'Cases', slug: 'cases', status: 'ACTIVE', navSort: 4, showInNav: true },
      { id: '5', pageType: 'news', name: '新闻动态', nameEn: 'News', slug: 'news', status: 'ACTIVE', navSort: 5, showInNav: true },
      { id: '6', pageType: 'contact', name: '联系我们', nameEn: 'Contact Us', slug: 'contact', status: 'ACTIVE', navSort: 6, showInNav: true },
    ],
    pageModules: [],
    siteSeoConfigs: [
      { id: 'seo-zh', languageCode: 'zh', companyName: 'Shimond', siteTitle: 'Shimond - 专业PVC产品制造商', siteDescription: '专业PVC产品制造商，提供人造革、地垫、桌垫保护垫等高品质产品。', defaultSeoTitle: 'Shimond - 专业PVC产品制造商', defaultSeoDescription: '专业PVC产品制造商，提供人造革、地垫、桌垫保护垫等高品质产品。15年行业经验，ISO认证，支持OEM/ODM定制。', defaultSeoKeywords: 'PVC人造革, PVC地垫, 桌垫保护垫, PVC产品制造商, 人造革厂家', defaultOgImage: null, favicon: null, address: 'Building 22, New Material Industrial Park, Wanjiangnan Concentrated Area, Chizhou, Anhui, China', phone: '+86 571 88837923', email: 'shimond06@shimond.net', createdAt: new Date(), updatedAt: new Date() },
      { id: 'seo-en', languageCode: 'en', companyName: 'Shimond', siteTitle: 'Shimond - Professional PVC Products Manufacturer', siteDescription: 'Professional manufacturer of high-quality PVC leather, mats, and table protectors.', defaultSeoTitle: 'Shimond - Professional PVC Products Manufacturer', defaultSeoDescription: 'Professional manufacturer of high-quality PVC leather, mats, and table protectors. 15+ years experience, ISO certified, OEM/ODM supported.', defaultSeoKeywords: 'PVC leather, PVC mats, table protector, PVC manufacturer, synthetic leather', defaultOgImage: null, favicon: null, address: 'Building 22, New Material Industrial Park, Wanjiangnan Concentrated Area, Chizhou, Anhui, China', phone: '+86 571 88837923', email: 'shimond06@shimond.net', createdAt: new Date(), updatedAt: new Date() },
      { id: 'seo-es', languageCode: 'es', companyName: 'Shimond', siteTitle: 'Shimond - Fabricante Profesional de Productos PVC', siteDescription: 'Fabricante profesional de cuero PVC, alfombrillas y protectores de mesa de alta calidad.', defaultSeoTitle: 'Shimond - Fabricante Profesional de Productos PVC', defaultSeoDescription: 'Fabricante profesional de cuero PVC, alfombrillas y protectores de mesa de alta calidad. Más de 15 años de experiencia, certificado ISO, OEM/ODM disponible.', defaultSeoKeywords: 'cuero PVC, alfombrillas PVC, protector de mesa, fabricante PVC, cuero sintético', defaultOgImage: null, favicon: null, address: 'Building 22, New Material Industrial Park, Wanjiangnan Concentrated Area, Chizhou, Anhui, China', phone: '+86 571 88837923', email: 'shimond06@shimond.net', createdAt: new Date(), updatedAt: new Date() },
      { id: 'seo-ar', languageCode: 'ar', companyName: 'شيموند', siteTitle: 'شيموند - مصنع منتجات PVC احترافي', siteDescription: 'شركة تصنيع احترافية لمنتجات PVC عالية الجودة.', defaultSeoTitle: 'شيموند - مصنع منتجات PVC احترافي', defaultSeoDescription: 'شركة تصنيع احترافية لمنتجات PVC عالية الجودة. أكثر من 15 عامًا من الخبرة، معتمدة ISO، OEM/ODM مدعوم.', defaultSeoKeywords: 'جلد PVC, سجاد PVC, حماية الطاولة, مصنع PVC, جلد صناعي', defaultOgImage: null, favicon: null, address: 'Building 22, New Material Industrial Park, Wanjiangnan Concentrated Area, Chizhou, Anhui, China', phone: '+86 571 88837923', email: 'shimond06@shimond.net', createdAt: new Date(), updatedAt: new Date() },
    ],
    serviceItems: [],
    caseItems: [],
    newsItems: [],
    languages: [
      { id: '1', code: 'zh', name: '中文', isRtl: false, isActive: true, sortOrder: 1 },
      { id: '2', code: 'en', name: 'English', isRtl: false, isActive: true, sortOrder: 2 },
      { id: '3', code: 'es', name: 'Español', isRtl: false, isActive: true, sortOrder: 3 },
      { id: '4', code: 'ar', name: 'العربية', isRtl: true, isActive: true, sortOrder: 4 },
    ],
    translations: [],
    codeSnippets: [],
    orders: [],
    orderItems: [],
  }

  // SiteConfig operations
  siteConfig = {
    findFirst: async () => this.data.siteConfig[0],
    create: async (args: any) => {
      const item = { ...args.data, id: Date.now().toString() }
      this.data.siteConfig.push(item)
      return item
    },
    update: async (args: any) => {
      const index = this.data.siteConfig.findIndex(item => item.id === args.where.id)
      if (index === -1) throw new Error('Not found')
      this.data.siteConfig[index] = { ...this.data.siteConfig[index], ...args.data }
      return this.data.siteConfig[index]
    },
  }

  // SiteSeoConfig operations
  siteSeoConfig = this.createModelOperations('siteSeoConfigs')

  // AdminUser operations
  adminUser = {
    findUnique: async (args: any) => {
      return this.data.adminUsers.find(u => u.username === args.where.username)
    },
    findFirst: async () => this.data.adminUsers[0],
  }

  // Generic operations for other models
  private createModelOperations(modelName: keyof MockData) {
    return {
      findMany: async () => this.data[modelName],
      findUnique: async (args: any) => {
        const items = this.data[modelName] as any[]
        return items.find(item => {
          for (const key in args.where) {
            if (item[key] !== args.where[key]) return false
          }
          return true
        })
      },
      findFirst: async () => (this.data[modelName] as any[])[0],
      create: async (args: any) => {
        const items = this.data[modelName] as any[]
        const item = { ...args.data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
        items.push(item)
        return item
      },
      update: async (args: any) => {
        const items = this.data[modelName] as any[]
        const index = items.findIndex(item => item.id === args.where.id)
        if (index === -1) throw new Error('Not found')
        items[index] = { ...items[index], ...args.data, updatedAt: new Date() }
        return items[index]
      },
      delete: async (args: any) => {
        const items = this.data[modelName] as any[]
        const index = items.findIndex(item => item.id === args.where.id)
        if (index === -1) throw new Error('Not found')
        const deleted = items[index]
        items.splice(index, 1)
        return deleted
      },
      upsert: async (args: any) => {
        const items = this.data[modelName] as any[]
        const existing = items.find(item => {
          for (const key in args.where) {
            if (item[key] !== args.where[key]) return false
          }
          return true
        })
        
        if (existing) {
          const index = items.indexOf(existing)
          items[index] = { ...items[index], ...args.update, updatedAt: new Date() }
          return items[index]
        } else {
          const item = { ...args.create, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
          items.push(item)
          return item
        }
      },
    }
  }

  page = this.createModelOperations('pages')
  pageModule = this.createModelOperations('pageModules')
  serviceItem = this.createModelOperations('serviceItems')
  caseItem = this.createModelOperations('caseItems')
  newsItem = this.createModelOperations('newsItems')
  language = this.createModelOperations('languages')
  translation = this.createModelOperations('translations')
  codeSnippet = this.createModelOperations('codeSnippets')
  order = this.createModelOperations('orders')
  orderItem = this.createModelOperations('orderItems')

  $connect = async () => {
    console.log('📦 Mock database connected (development mode)')
  }

  $disconnect = async () => {
    console.log('📦 Mock database disconnected')
  }
}

// Export singleton
export const prisma = new MockPrismaClient()
