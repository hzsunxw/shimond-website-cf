'use client'

import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/admin', label: '控制台' },
  { href: '/admin/settings', label: '站点配置' },
  { href: '/admin/pages', label: '页面管理' },
  { href: '/admin/products', label: '产品管理' },
  { href: '/admin/cases', label: '案例管理' },
  { href: '/admin/news', label: '新闻管理' },
  { href: '/admin/orders', label: '订单管理' },
  { href: '/admin/messages', label: '留言管理' },
  { href: '/admin/languages', label: '多语言' },
  { href: '/admin/seo', label: 'SEO 设置' },
  { href: '/admin/code-snippets', label: '代码注入' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Nimbus CMS</h1>
      </div>
      <nav className="px-4 pb-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
