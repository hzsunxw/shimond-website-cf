import { prisma } from '@/lib/prisma'

export default async function SeoPage() {
  const config = await prisma.siteConfig.findFirst()

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">SEO 设置</h2>
      </header>
      <div className="p-8">
        {config ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">字段</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">网站标题</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.siteTitle || '--'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">网站描述</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.siteDescription || '--'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">默认 SEO 标题</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.defaultSeoTitle || '--'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">默认 Meta Description</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.defaultSeoDescription || '--'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">默认 Meta Keywords</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.defaultSeoKeywords || '--'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">暂无站点配置数据</div>
        )}
      </div>
    </>
  )
}
