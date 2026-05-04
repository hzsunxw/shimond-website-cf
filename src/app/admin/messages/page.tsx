'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Trash2, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  company: string | null
  product: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Fetch messages error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const markAsRead = async (id: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      })
      if (res.ok) {
        fetchMessages()
      }
    } catch (err) {
      console.error('Mark as read error:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条留言吗？')) return
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchMessages()
      }
    } catch (err) {
      console.error('Delete message error:', err)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const productMap: Record<string, string> = {
    'pvc-leather': 'PVC人造革',
    'pvc-mats': 'PVC地垫',
    'table-protector': '桌垫保护垫',
    'other': '其他',
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">留言管理</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
              {unreadCount} 条未读
            </span>
          )}
        </div>
        <Button variant="outline" onClick={fetchMessages} disabled={loading}>
          {loading ? '刷新中...' : '刷新'}
        </Button>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">展开</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">感兴趣的产品</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <>
                  <tr
                    key={msg.id}
                    className={`hover:bg-gray-50 transition-colors ${!msg.isRead ? 'bg-sky-50/30' : ''}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(msg.id)}
                        className="text-gray-400 hover:text-sky-500 transition-colors"
                      >
                        {expandedId === msg.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {msg.isRead ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-gray-400">
                          <Check className="w-3 h-3" />
                          <span>已读</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs text-sky-600 font-medium">
                          <Mail className="w-3 h-3" />
                          <span>未读</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {msg.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`mailto:${msg.email}`} className="hover:text-sky-500 transition-colors">
                        {msg.email}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {msg.company || '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {msg.product ? (productMap[msg.product] || msg.product) : '--'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      {!msg.isRead && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          disabled={updating === msg.id}
                          className="text-sky-600 hover:text-sky-800 font-medium"
                          title="标记为已读"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {expandedId === msg.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-gray-50">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">留言内容</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {messages.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">暂无留言</td>
                </tr>
              )}
              {loading && messages.length === 0 && (
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
