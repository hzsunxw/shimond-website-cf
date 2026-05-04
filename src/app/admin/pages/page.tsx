import { prisma } from '@/lib/prisma'

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { navSort: 'asc' },
  })

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">页面管理</h2>
      </header>
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">导航显示</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.map((page: any) => (
                <tr key={page.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.pageType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.showInNav ? '是' : '否'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.navSort}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
