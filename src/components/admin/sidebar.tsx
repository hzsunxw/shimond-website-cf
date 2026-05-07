'use client'

import { usePathname } from 'next/navigation'
import { ADMIN_PATH, adminRoute } from '@/lib/admin-path'

const menuItems = [
  { path: '', label: '控制台' },
  { path: 'settings', label: '站点配置' },
  { path: 'pages', label: '页面管理' },
  { path: 'products', label: '产品管理' },
  { path: 'cases', label: '案例管理' },
  { path: 'news', label: '新闻管理' },
  { path: 'orders', label: '订单管理' },
  { path: 'messages', label: '留言管理' },
  { path: 'languages', label: '多语言' },
  { path: 'seo', label: 'SEO 设置' },
  { path: 'code-snippets', label: '代码注入' },
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
          const href = adminRoute(item.path)
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <a
              key={item.path}
              href={href}
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
