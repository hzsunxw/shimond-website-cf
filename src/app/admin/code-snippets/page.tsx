import { prisma } from '@/lib/prisma'

export default async function CodeSnippetsPage() {
  const snippets = await prisma.codeSnippet.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">代码注入</h2>
      </header>
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">插入位置</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作用范围</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">激活</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代码</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {snippets.map((snippet: any) => (
                <tr key={snippet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{snippet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.scope}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{snippet.isActive ? '是' : '否'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{snippet.code}</pre>
                  </td>
                </tr>
              ))}
              {snippets.length === 0 && (
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
