import { prisma } from '@/lib/prisma'

export default async function LanguagesPage() {
  const languages = await prisma.language.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">多语言管理</h2>
      </header>
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">语言代码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图标</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">激活</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {languages.map((lang: any) => (
                <tr key={lang.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lang.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lang.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lang.icon || '--'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lang.isRtl ? '是' : '否'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lang.isActive ? '是' : '否'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lang.sortOrder}</td>
                </tr>
              ))}
              {languages.length === 0 && (
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
