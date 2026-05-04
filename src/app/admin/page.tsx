export default function AdminPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <h2 className="text-lg font-semibold text-gray-900">控制台</h2>
      </header>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">产品数量</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">订单数量</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">新闻数量</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
          </div>
        </div>
      </div>
    </>
  )
}
