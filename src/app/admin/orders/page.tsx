'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  productSpec: string | null
  quantity: number
  expectedPrice: string | null
  expectedUnit: string | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerCompany: string | null
  customerPhone: string | null
  customerEmail: string | null
  shippingAddress: string | null
  totalAmount: string | null
  currency: string
  status: string
  customerNote: string | null
  adminNote: string | null
  createdAt: string
  items: OrderItem[]
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  PRODUCING: { label: '生产中', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: '已发货', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-800' },
}

const statusOptions = [
  { value: 'PENDING', label: '待确认' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'PRODUCING', label: '生产中' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        fetchOrders()
      } else {
        const err = await res.json()
        alert(err.error || '更新失败')
      }
    } catch (err) {
      console.error('Update status error:', err)
      alert('更新失败')
    } finally {
      setUpdating(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">订单管理</h2>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          {loading ? '刷新中...' : '刷新'}
        </Button>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">展开</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="text-gray-400 hover:text-sky-500 transition-colors"
                      >
                        {expandedId === order.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerCompany || '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerPhone || '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.totalAmount ? `${order.totalAmount} ${order.currency}` : '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>

                  {/* Expanded Detail */}
                  {expandedId === order.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Contact Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">联系人：</span>
                              <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">电话：</span>
                              <span>{order.customerPhone || '--'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">邮箱：</span>
                              <span>{order.customerEmail || '--'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">公司：</span>
                              <span>{order.customerCompany || '--'}</span>
                            </div>
                            {order.shippingAddress && (
                              <div className="col-span-2 md:col-span-4">
                                <span className="text-gray-500">收货地址：</span>
                                <span>{order.shippingAddress}</span>
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">产品名称</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">规格</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">数量</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">期望单价</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{item.productSpec || '--'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                      {item.expectedPrice ? `${item.expectedPrice} ${item.expectedUnit || ''}` : '--'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Notes & Status Update */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">客户备注</p>
                              <p className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 p-3 min-h-[60px]">
                                {order.customerNote || '无'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">更新状态</p>
                              <div className="flex gap-2">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateStatus(order.id, e.target.value)}
                                  disabled={updating === order.id}
                                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">暂无订单数据</td>
                </tr>
              )}
              {loading && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">加载中...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
