import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const [productCount, orderCount, newsCount, caseCount] = await Promise.all([
    prisma.serviceItem.count(),
    prisma.order.count(),
    prisma.newsItem.count(),
    prisma.caseItem.count(),
  ])

  const stats = [
    { label: '产品数量', value: productCount },
    { label: '订单数量', value: orderCount },
    { label: '新闻数量', value: newsCount },
    { label: '案例数量', value: caseCount },
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">控制台</h2>
      </header>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">{s.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
